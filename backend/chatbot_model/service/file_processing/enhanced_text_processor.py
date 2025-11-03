"""
Enhanced Text Processor for AI Chatbot Builder
Provides advanced text processing, validation, and quality assessment
"""

import re
import string
import unicodedata
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.tag import pos_tag

logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except Exception as e:
    logger.warning(f"Failed to download NLTK data: {e}")

# Try to load spaCy model
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except (OSError, ImportError, ValueError) as e:
    logger.warning(f"spaCy not available: {e}")
    SPACY_AVAILABLE = False
    nlp = None

@dataclass
class TextQuality:
    score: float
    issues: List[str]
    suggestions: List[str]
    metrics: Dict[str, Any]

class EnhancedTextProcessor:
    """Advanced text processing with quality assessment and validation"""
    
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        try:
            self.stop_words = set(stopwords.words('english'))
        except:
            self.stop_words = set()
        
        # Common contractions
        self.contractions = {
            "won't": "will not",
            "can't": "cannot",
            "n't": " not",
            "'re": " are",
            "'ve": " have",
            "'ll": " will",
            "'d": " would",
            "'m": " am",
            "it's": "it is",
            "that's": "that is",
            "what's": "what is",
            "where's": "where is",
            "how's": "how is",
            "who's": "who is",
            "there's": "there is"
        }
        
        # Quality thresholds
        self.quality_thresholds = {
            'min_length': 3,
            'max_length': 500,
            'min_words': 1,
            'max_words': 100,
            'min_alpha_ratio': 0.3,
            'max_special_chars': 0.3,
            'max_repeated_chars': 3
        }
    
    def preprocess_for_training(self, text: str) -> str:
        """Preprocess text for training with comprehensive cleaning"""
        if not text or not isinstance(text, str):
            return ""
        
        # Basic cleaning
        text = self._basic_clean(text)
        
        # Expand contractions
        text = self._expand_contractions(text)
        
        # Normalize unicode
        text = self._normalize_unicode(text)
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove very short or empty results
        if len(text.strip()) < 2:
            return ""
        
        return text
    
    def preprocess_for_chat(self, text: str) -> str:
        """Preprocess text for chat inference with lighter cleaning"""
        if not text or not isinstance(text, str):
            return ""
        
        # Light cleaning for chat
        text = text.strip()
        
        # Expand contractions
        text = self._expand_contractions(text)
        
        # Basic normalization
        text = self._normalize_unicode(text)
        
        # Remove excessive whitespace but preserve structure
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize_advanced(self, text: str) -> List[str]:
        """Advanced tokenization with multiple methods"""
        if not text:
            return []
        
        tokens = []
        
        # Use spaCy if available
        if SPACY_AVAILABLE and nlp:
            doc = nlp(text)
            tokens = [token.lemma_.lower() for token in doc 
                     if not token.is_stop and not token.is_punct and token.text.strip()]
        else:
            # Fallback to NLTK
            try:
                word_tokens = word_tokenize(text.lower())
                tokens = [self.lemmatizer.lemmatize(token) for token in word_tokens 
                         if token not in self.stop_words and token not in string.punctuation]
            except:
                # Basic tokenization fallback
                tokens = [word.lower().strip() for word in text.split() 
                         if word.strip() and word.lower() not in self.stop_words]
        
        # Filter out empty tokens
        tokens = [token for token in tokens if token and len(token) > 1]
        
        return tokens
    
    def calculate_text_quality(self, text: str) -> TextQuality:
        """Calculate comprehensive text quality score"""
        if not text or not isinstance(text, str):
            return TextQuality(
                score=0.0,
                issues=["Empty or invalid text"],
                suggestions=["Provide valid text content"],
                metrics={}
            )
        
        issues = []
        suggestions = []
        metrics = {}
        
        # Basic metrics
        length = len(text)
        words = text.split()
        word_count = len(words)
        
        metrics['length'] = length
        metrics['word_count'] = word_count
        
        # Length checks
        if length < self.quality_thresholds['min_length']:
            issues.append("Text too short")
            suggestions.append("Add more content")
        elif length > self.quality_thresholds['max_length']:
            issues.append("Text too long")
            suggestions.append("Consider shortening the text")
        
        # Word count checks
        if word_count < self.quality_thresholds['min_words']:
            issues.append("Too few words")
            suggestions.append("Add more words for better context")
        elif word_count > self.quality_thresholds['max_words']:
            issues.append("Too many words")
            suggestions.append("Consider breaking into shorter sentences")
        
        # Character composition
        alpha_chars = sum(1 for c in text if c.isalpha())
        alpha_ratio = alpha_chars / length if length > 0 else 0
        metrics['alpha_ratio'] = alpha_ratio
        
        if alpha_ratio < self.quality_thresholds['min_alpha_ratio']:
            issues.append("Too few alphabetic characters")
            suggestions.append("Ensure text contains meaningful words")
        
        # Special characters
        special_chars = sum(1 for c in text if not c.isalnum() and not c.isspace())
        special_ratio = special_chars / length if length > 0 else 0
        metrics['special_ratio'] = special_ratio
        
        if special_ratio > self.quality_thresholds['max_special_chars']:
            issues.append("Too many special characters")
            suggestions.append("Reduce special characters for better processing")
        
        # Repeated characters
        repeated_pattern = re.search(r'(.)\1{' + str(self.quality_thresholds['max_repeated_chars']) + ',}', text)
        if repeated_pattern:
            issues.append("Excessive repeated characters")
            suggestions.append("Remove repeated characters")
        
        # Language detection (basic)
        try:
            if SPACY_AVAILABLE and nlp:
                doc = nlp(text)
                metrics['entities'] = len(doc.ents)
                metrics['sentences'] = len(list(doc.sents))
        except:
            pass
        
        # Calculate overall score
        score = self._calculate_quality_score(metrics, issues)
        
        return TextQuality(
            score=score,
            issues=issues,
            suggestions=suggestions,
            metrics=metrics
        )
    
    def validate_intent_data(self, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and assess intent data quality"""
        validation_result = {
            'valid': True,
            'issues': [],
            'suggestions': [],
            'quality_scores': {}
        }
        
        # Check required fields
        if 'tag' not in intent or not intent['tag']:
            validation_result['valid'] = False
            validation_result['issues'].append("Missing or empty tag")
            validation_result['suggestions'].append("Provide a meaningful tag name")
        
        if 'patterns' not in intent or not intent['patterns']:
            validation_result['valid'] = False
            validation_result['issues'].append("Missing or empty patterns")
            validation_result['suggestions'].append("Add training patterns")
        
        if 'responses' not in intent or not intent['responses']:
            validation_result['valid'] = False
            validation_result['issues'].append("Missing or empty responses")
            validation_result['suggestions'].append("Add response messages")
        
        # Validate patterns
        if 'patterns' in intent and intent['patterns']:
            pattern_scores = []
            for i, pattern in enumerate(intent['patterns']):
                quality = self.calculate_text_quality(pattern)
                pattern_scores.append(quality.score)
                
                if quality.score < 50:
                    validation_result['issues'].append(f"Low quality pattern {i+1}: {pattern}")
                    validation_result['suggestions'].extend(quality.suggestions)
            
            validation_result['quality_scores']['patterns'] = {
                'average': sum(pattern_scores) / len(pattern_scores) if pattern_scores else 0,
                'individual': pattern_scores
            }
        
        # Validate responses
        if 'responses' in intent and intent['responses']:
            response_scores = []
            for i, response in enumerate(intent['responses']):
                quality = self.calculate_text_quality(response)
                response_scores.append(quality.score)
                
                if quality.score < 50:
                    validation_result['issues'].append(f"Low quality response {i+1}: {response}")
                    validation_result['suggestions'].extend(quality.suggestions)
            
            validation_result['quality_scores']['responses'] = {
                'average': sum(response_scores) / len(response_scores) if response_scores else 0,
                'individual': response_scores
            }
        
        # Overall validation
        if validation_result['issues']:
            validation_result['valid'] = False
        
        return validation_result
    
    def auto_correct_text(self, text: str) -> str:
        """Auto-correct common text issues"""
        if not text:
            return text
        
        # Fix common spacing issues
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\s*([.!?])\s*', r'\1 ', text)
        text = re.sub(r'\s*,\s*', ', ', text)
        
        # Fix capitalization
        sentences = sent_tokenize(text)
        corrected_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence:
                # Capitalize first letter
                sentence = sentence[0].upper() + sentence[1:] if len(sentence) > 1 else sentence.upper()
                corrected_sentences.append(sentence)
        
        return ' '.join(corrected_sentences)
    
    def _basic_clean(self, text: str) -> str:
        """Basic text cleaning"""
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove excessive punctuation
        text = re.sub(r'[.]{3,}', '...', text)
        text = re.sub(r'[!]{2,}', '!', text)
        text = re.sub(r'[?]{2,}', '?', text)
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def _expand_contractions(self, text: str) -> str:
        """Expand contractions in text"""
        for contraction, expansion in self.contractions.items():
            text = re.sub(re.escape(contraction), expansion, text, flags=re.IGNORECASE)
        return text
    
    def _normalize_unicode(self, text: str) -> str:
        """Normalize unicode characters while preserving multilingual content"""
        # Normalize unicode to NFC (Canonical Composition) for consistent representation
        text = unicodedata.normalize('NFC', text)

        # Keep all characters including non-ASCII for multilingual support
        return text
    
    def _calculate_quality_score(self, metrics: Dict[str, Any], issues: List[str]) -> float:
        """Calculate overall quality score"""
        base_score = 100.0
        
        # Deduct points for issues
        base_score -= len(issues) * 10
        
        # Adjust based on metrics
        length = metrics.get('length', 0)
        word_count = metrics.get('word_count', 0)
        alpha_ratio = metrics.get('alpha_ratio', 0)
        
        # Length scoring
        if 10 <= length <= 200:
            base_score += 10
        elif length < 5:
            base_score -= 20
        
        # Word count scoring
        if 2 <= word_count <= 50:
            base_score += 10
        elif word_count < 1:
            base_score -= 30
        
        # Alpha ratio scoring
        if alpha_ratio >= 0.7:
            base_score += 10
        elif alpha_ratio < 0.3:
            base_score -= 20
        
        # Ensure score is between 0 and 100
        return max(0.0, min(100.0, base_score))

# Global instance
try:
    text_processor = EnhancedTextProcessor()
except Exception as e:
    logger.error(f"Failed to initialize text processor: {e}")
    # Create a fallback object with basic methods
    class FallbackTextProcessor:
        def preprocess_for_chat(self, text):
            return text.strip() if text else ""
        def preprocess_for_training(self, text):
            return text.strip() if text else ""
        def calculate_text_quality(self, text):
            from dataclasses import dataclass
            @dataclass
            class BasicQuality:
                score: float = 75.0
                issues: list = None
                suggestions: list = None
                metrics: dict = None
                def __post_init__(self):
                    if self.issues is None:
                        self.issues = []
                    if self.suggestions is None:
                        self.suggestions = []
                    if self.metrics is None:
                        self.metrics = {}
            return BasicQuality()
    text_processor = FallbackTextProcessor()

# Convenience functions
def preprocess_for_training(text: str) -> str:
    return text_processor.preprocess_for_training(text)

def preprocess_for_chat(text: str) -> str:
    return text_processor.preprocess_for_chat(text)

def calculate_text_quality(text: str) -> TextQuality:
    return text_processor.calculate_text_quality(text)

def validate_intent_data(intent: Dict[str, Any]) -> Dict[str, Any]:
    return text_processor.validate_intent_data(intent)

def tokenize_advanced(text: str) -> List[str]:
    return text_processor.tokenize_advanced(text)