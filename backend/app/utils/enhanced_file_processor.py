import os
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from werkzeug.utils import secure_filename
import mimetypes
from pathlib import Path

logger = logging.getLogger(__name__)

class EnhancedFileProcessor:
    """Process uploaded files for chatbot training and content matching"""
    
    def __init__(self):
        self.supported_formats = {
            '.txt': self._process_text_file,
            '.json': self._process_json_file,
            '.csv': self._process_csv_file,
            '.md': self._process_markdown_file,
            '.pdf': self._process_pdf_file,
            '.docx': self._process_docx_file,
            '.xlsx': self._process_excel_file
        }
        
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.max_content_length = 50000  # 50k characters per file
    
    def process_uploaded_files(self, files: List, project_id: str) -> Dict[str, Any]:
        """
        Process multiple uploaded files and extract training data
        """
        results = {
            "processed_files": [],
            "extracted_intents": [],
            "file_contents": {},
            "errors": [],
            "total_patterns": 0,
            "total_responses": 0
        }
        
        for file in files:
            try:
                if not file or not file.filename:
                    continue
                
                # Security check
                filename = secure_filename(file.filename)
                if not filename:
                    results["errors"].append("Invalid filename")
                    continue
                
                # Size check
                file.seek(0, 2)  # Seek to end
                file_size = file.tell()
                file.seek(0)  # Reset to beginning
                
                if file_size > self.max_file_size:
                    results["errors"].append(f"File {filename} too large (max 10MB)")
                    continue
                
                # Process based on file extension
                file_ext = Path(filename).suffix.lower()
                
                if file_ext not in self.supported_formats:
                    results["errors"].append(f"Unsupported file format: {file_ext}")
                    continue
                
                # Process the file
                processor = self.supported_formats[file_ext]
                file_result = processor(file, filename)
                
                if file_result["success"]:
                    results["processed_files"].append({
                        "filename": filename,
                        "format": file_ext,
                        "size": file_size,
                        "intents_found": len(file_result.get("intents", [])),
                        "content_length": len(file_result.get("content", ""))
                    })
                    
                    # Store file content for matching
                    if file_result.get("content"):
                        results["file_contents"][filename] = file_result["content"]
                    
                    # Add extracted intents
                    if file_result.get("intents"):
                        results["extracted_intents"].extend(file_result["intents"])
                        results["total_patterns"] += sum(len(intent.get("patterns", [])) for intent in file_result["intents"])
                        results["total_responses"] += sum(len(intent.get("responses", [])) for intent in file_result["intents"])
                else:
                    results["errors"].append(f"Failed to process {filename}: {file_result.get('error', 'Unknown error')}")
                    
            except Exception as e:
                logger.error(f"Error processing file: {e}")
                results["errors"].append(f"Error processing file: {str(e)}")
        
        return results
    
    def _process_text_file(self, file, filename: str) -> Dict[str, Any]:
        """Process plain text file"""
        try:
            content = file.read().decode('utf-8', errors='ignore')
            
            if len(content) > self.max_content_length:
                content = content[:self.max_content_length]
            
            # Try to extract Q&A pairs or patterns
            intents = self._extract_qa_from_text(content, filename)
            
            return {
                "success": True,
                "content": content,
                "intents": intents,
                "format": "text"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _process_json_file(self, file, filename: str) -> Dict[str, Any]:
        """Process JSON file (could be existing intents or structured data)"""
        try:
            content = file.read().decode('utf-8')
            data = json.loads(content)
            
            intents = []
            
            # Check if it's already in intents format
            if isinstance(data, dict) and "intents" in data:
                intents = data["intents"]
            elif isinstance(data, list):
                # Try to convert list to intents
                for i, item in enumerate(data):
                    if isinstance(item, dict):
                        intent = self._convert_dict_to_intent(item, f"{filename}_item_{i}")
                        if intent:
                            intents.append(intent)
            elif isinstance(data, dict):
                # Convert single dict to intent
                intent = self._convert_dict_to_intent(data, filename.replace('.json', ''))
                if intent:
                    intents.append(intent)
            
            return {
                "success": True,
                "content": json.dumps(data, indent=2),
                "intents": intents,
                "format": "json"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _process_csv_file(self, file, filename: str) -> Dict[str, Any]:
        """Process CSV file"""
        try:
            import csv
            import io
            
            content = file.read().decode('utf-8', errors='ignore')
            csv_reader = csv.DictReader(io.StringIO(content))
            
            intents = []
            rows = list(csv_reader)
            
            # Try to identify Q&A columns
            headers = csv_reader.fieldnames if hasattr(csv_reader, 'fieldnames') else []
            question_col = self._find_column(headers, ['question', 'q', 'pattern', 'input', 'query'])
            answer_col = self._find_column(headers, ['answer', 'a', 'response', 'output', 'reply'])
            tag_col = self._find_column(headers, ['tag', 'category', 'intent', 'type'])
            
            if question_col and answer_col:
                for i, row in enumerate(rows):
                    question = row.get(question_col, '').strip()
                    answer = row.get(answer_col, '').strip()
                    tag = row.get(tag_col, f"{filename}_row_{i}").strip() if tag_col else f"{filename}_row_{i}"
                    
                    if question and answer:
                        intents.append({
                            "tag": tag,
                            "patterns": [question],
                            "responses": [answer]
                        })
            
            return {
                "success": True,
                "content": content,
                "intents": intents,
                "format": "csv"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _process_markdown_file(self, file, filename: str) -> Dict[str, Any]:
        """Process Markdown file"""
        try:
            content = file.read().decode('utf-8', errors='ignore')
            
            if len(content) > self.max_content_length:
                content = content[:self.max_content_length]
            
            # Extract Q&A from markdown structure
            intents = self._extract_qa_from_markdown(content, filename)
            
            return {
                "success": True,
                "content": content,
                "intents": intents,
                "format": "markdown"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _process_pdf_file(self, file, filename: str) -> Dict[str, Any]:
        """Process PDF file"""
        try:
            # Try to import PyPDF2 or pdfplumber
            try:
                import PyPDF2
                pdf_reader = PyPDF2.PdfReader(file)
                content = ""
                for page in pdf_reader.pages:
                    content += page.extract_text() + "\n"
            except ImportError:
                try:
                    import pdfplumber
                    with pdfplumber.open(file) as pdf:
                        content = ""
                        for page in pdf.pages:
                            content += page.extract_text() + "\n"
                except ImportError:
                    return {"success": False, "error": "PDF processing libraries not available"}
            
            if len(content) > self.max_content_length:
                content = content[:self.max_content_length]
            
            intents = self._extract_qa_from_text(content, filename)
            
            return {
                "success": True,
                "content": content,
                "intents": intents,
                "format": "pdf"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _process_docx_file(self, file, filename: str) -> Dict[str, Any]:
        """Process DOCX file"""
        try:
            import docx
            doc = docx.Document(file)
            content = ""
            
            for paragraph in doc.paragraphs:
                content += paragraph.text + "\n"
            
            if len(content) > self.max_content_length:
                content = content[:self.max_content_length]
            
            intents = self._extract_qa_from_text(content, filename)
            
            return {
                "success": True,
                "content": content,
                "intents": intents,
                "format": "docx"
            }
            
        except ImportError:
            return {"success": False, "error": "python-docx library not available"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _process_excel_file(self, file, filename: str) -> Dict[str, Any]:
        """Process Excel file"""
        try:
            import pandas as pd
            df = pd.read_excel(file)
            
            intents = []
            
            # Try to identify Q&A columns
            columns = [col.lower() for col in df.columns]
            question_col = self._find_column(df.columns, ['question', 'q', 'pattern', 'input', 'query'])
            answer_col = self._find_column(df.columns, ['answer', 'a', 'response', 'output', 'reply'])
            tag_col = self._find_column(df.columns, ['tag', 'category', 'intent', 'type'])
            
            if question_col and answer_col:
                for i, row in df.iterrows():
                    question = str(row.get(question_col, '')).strip()
                    answer = str(row.get(answer_col, '')).strip()
                    tag = str(row.get(tag_col, f"{filename}_row_{i}")).strip() if tag_col else f"{filename}_row_{i}"
                    
                    if question and answer and question != 'nan' and answer != 'nan':
                        intents.append({
                            "tag": tag,
                            "patterns": [question],
                            "responses": [answer]
                        })
            
            content = df.to_string()
            
            return {
                "success": True,
                "content": content,
                "intents": intents,
                "format": "excel"
            }
            
        except ImportError:
            return {"success": False, "error": "pandas library not available"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _extract_qa_from_text(self, content: str, filename: str) -> List[Dict]:
        """Extract Q&A pairs from plain text"""
        intents = []
        lines = content.split('\n')
        
        current_question = None
        current_answer = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Look for Q&A patterns
            if line.lower().startswith(('q:', 'question:', 'q.', 'query:')):
                if current_question and current_answer:
                    intents.append({
                        "tag": f"{filename}_qa_{len(intents)}",
                        "patterns": [current_question],
                        "responses": [current_answer]
                    })
                current_question = line.split(':', 1)[1].strip() if ':' in line else line
                current_answer = None
                
            elif line.lower().startswith(('a:', 'answer:', 'a.', 'response:')):
                current_answer = line.split(':', 1)[1].strip() if ':' in line else line
                
            elif current_question and not current_answer:
                current_answer = line
        
        # Add the last Q&A pair
        if current_question and current_answer:
            intents.append({
                "tag": f"{filename}_qa_{len(intents)}",
                "patterns": [current_question],
                "responses": [current_answer]
            })
        
        return intents
    
    def _extract_qa_from_markdown(self, content: str, filename: str) -> List[Dict]:
        """Extract Q&A pairs from markdown structure"""
        intents = []
        lines = content.split('\n')
        
        current_section = None
        current_content = []
        
        for line in lines:
            if line.startswith('#'):
                # Process previous section
                if current_section and current_content:
                    content_text = '\n'.join(current_content).strip()
                    if content_text:
                        intents.append({
                            "tag": current_section.lower().replace(' ', '_'),
                            "patterns": [current_section],
                            "responses": [content_text]
                        })
                
                # Start new section
                current_section = line.lstrip('#').strip()
                current_content = []
            else:
                if current_section:
                    current_content.append(line)
        
        # Process last section
        if current_section and current_content:
            content_text = '\n'.join(current_content).strip()
            if content_text:
                intents.append({
                    "tag": current_section.lower().replace(' ', '_'),
                    "patterns": [current_section],
                    "responses": [content_text]
                })
        
        return intents
    
    def _convert_dict_to_intent(self, data: Dict, default_tag: str) -> Optional[Dict]:
        """Convert dictionary to intent format"""
        try:
            patterns = []
            responses = []
            tag = default_tag
            
            # Try to find patterns/questions
            for key, value in data.items():
                key_lower = key.lower()
                if key_lower in ['pattern', 'patterns', 'question', 'questions', 'input', 'query']:
                    if isinstance(value, list):
                        patterns.extend([str(v) for v in value])
                    else:
                        patterns.append(str(value))
                elif key_lower in ['response', 'responses', 'answer', 'answers', 'output', 'reply']:
                    if isinstance(value, list):
                        responses.extend([str(v) for v in value])
                    else:
                        responses.append(str(value))
                elif key_lower in ['tag', 'intent', 'category', 'type']:
                    tag = str(value)
            
            if not patterns and not responses:
                for key, value in data.items():
                    if isinstance(value, str) and len(value) > 5:
                        if '?' in key.lower() or 'question' in key.lower():
                            patterns.append(str(value))
                        else:
                            responses.append(str(value))
            
            if patterns and responses:
                return {
                    "tag": tag,
                    "patterns": patterns,
                    "responses": responses
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error converting dict to intent: {e}")
            return None
    
    def _find_column(self, headers: List[str], possible_names: List[str]) -> Optional[str]:
        """Find column by possible names"""
        if not headers:
            return None
            
        headers_lower = [h.lower() for h in headers]
        
        for name in possible_names:
            if name in headers_lower:
                return headers[headers_lower.index(name)]
        
        return None

# Global instance
file_processor = EnhancedFileProcessor()