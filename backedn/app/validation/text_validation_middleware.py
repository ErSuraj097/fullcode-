"""
Text Validation Middleware for AI Chatbot Builder
Provides comprehensive text validation and quality checks
"""

import re
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import unicodedata
import string

logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    is_valid: bool
    score: float
    issues: List[str]
    suggestions: List[str]
    cleaned_text: Optional[str] = None

class TextValidator:
    """Comprehensive text validation with quality scoring"""
    
    def __init__(self):
        # Validation thresholds
        self.thresholds = {
            'min_length': 1,
            'max_length': 1000,
            'min_words': 1,
            'max_words': 200,
            'min_alpha_ratio': 0.2,
            'max_special_chars_ratio': 0.5,
            'max_repeated_chars': 4,
            'min_quality_score': 30
        }
        
        # Common spam/invalid patterns
        self.spam_patterns = [
            r'(.)\1{10,}',  # Excessive repeated characters
            r'[^\w\s]{10,}',  # Too many special characters in a row
            r'^\s*$',  # Only whitespace
            r'^[^a-zA-Z]*$',  # No alphabetic characters
        ]
        
        # Profanity filter (basic)
        self.profanity_words = {
            'mild': ['damn', 'hell', 'crap'],
            'moderate': ['stupid', 'idiot', 'moron'],
            'severe': []  # Add as needed
        }
    
    def validate_message(self, message: str, context: str = "chat") -> ValidationResult:
        """Validate a chat message"""
        if not message or not isinstance(message, str):
            return ValidationResult(
                is_valid=False,
                score=0.0,
                issues=["Empty or invalid message"],
                suggestions=["Provide a valid text message"]
            )
        
        issues = []
        suggestions = []
        score = 100.0
        
        # Basic length checks
        length = len(message.strip())
        if length < self.thresholds['min_length']:
            issues.append("Message too short")
            suggestions.append("Please provide a longer message")
            score -= 30
        elif length > self.thresholds['max_length']:
            issues.append("Message too long")
            suggestions.append("Please shorten your message")
            score -= 20
        
        # Word count check
        words = message.split()
        word_count = len(words)
        if word_count > self.thresholds['max_words']:
            issues.append("Too many words")
            suggestions.append("Please use fewer words")
            score -= 15
        
        # Character composition
        alpha_chars = sum(1 for c in message if c.isalpha())
        alpha_ratio = alpha_chars / length if length > 0 else 0
        
        if alpha_ratio < self.thresholds['min_alpha_ratio']:
            issues.append("Too few alphabetic characters")
            suggestions.append("Please use more words")
            score -= 25
        
        # Special characters check
        special_chars = sum(1 for c in message if c in string.punctuation)
        special_ratio = special_chars / length if length > 0 else 0
        
        if special_ratio > self.thresholds['max_special_chars_ratio']:
            issues.append("Too many special characters")
            suggestions.append("Please reduce special characters")
            score -= 20
        
        # Spam pattern detection
        for pattern in self.spam_patterns:
            if re.search(pattern, message):
                issues.append("Message appears to be spam or invalid")
                suggestions.append("Please provide a meaningful message")
                score -= 40
                break
        
        # Profanity check
        profanity_level = self._check_profanity(message)
        if profanity_level:
            issues.append(f"Inappropriate language detected ({profanity_level})")
            suggestions.append("Please use appropriate language")
            score -= 30 if profanity_level == 'severe' else 15
        
        # Clean the message
        try:
            from chatbot_model.service.file_processing.enhanced_text_processor import text_processor
            # Ensure text_processor is properly initialized
            if hasattr(text_processor, 'preprocess_for_chat') and hasattr(text_processor, 'calculate_text_quality'):
                cleaned_message = text_processor.preprocess_for_chat(message)
                quality = text_processor.calculate_text_quality(cleaned_message)

                # Adjust score based on quality
                if hasattr(quality, 'score') and quality.score < 50:
                    score -= 20
                    if hasattr(quality, 'issues'):
                        issues.extend(quality.issues[:2])  # Add top 2 issues
                    if hasattr(quality, 'suggestions'):
                        suggestions.extend(quality.suggestions[:2])  # Add top 2 suggestions
            else:
                cleaned_message = self._basic_clean(message)
        except (ImportError, AttributeError, Exception) as e:
            logger.warning(f"Text processor error: {e}")
            cleaned_message = self._basic_clean(message)
        
        # Final score adjustment
        score = max(0.0, min(100.0, score))
        is_valid = score >= self.thresholds['min_quality_score'] and len(issues) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            score=score,
            issues=issues,
            suggestions=suggestions,
            cleaned_text=cleaned_message
        )
    
    def validate_pattern(self, pattern: str) -> ValidationResult:
        """Validate a training pattern"""
        if not pattern or not isinstance(pattern, str):
            return ValidationResult(
                is_valid=False,
                score=0.0,
                issues=["Empty or invalid pattern"],
                suggestions=["Provide a valid training pattern"]
            )
        
        issues = []
        suggestions = []
        score = 100.0
        
        # Length checks
        length = len(pattern.strip())
        if length < 2:
            issues.append("Pattern too short")
            suggestions.append("Add more content to the pattern")
            score -= 40
        elif length > 500:
            issues.append("Pattern too long")
            suggestions.append("Consider shortening the pattern")
            score -= 20
        
        # Word count
        words = pattern.split()
        if len(words) < 1:
            issues.append("Pattern has no words")
            suggestions.append("Add meaningful words to the pattern")
            score -= 50
        elif len(words) > 50:
            issues.append("Pattern has too many words")
            suggestions.append("Simplify the pattern")
            score -= 15
        
        # Check for meaningful content
        alpha_chars = sum(1 for c in pattern if c.isalpha())
        if alpha_chars < 2:
            issues.append("Pattern lacks meaningful content")
            suggestions.append("Add more descriptive words")
            score -= 30
        
        # Check for excessive repetition
        if re.search(r'(.{3,})\1{2,}', pattern):
            issues.append("Pattern has excessive repetition")
            suggestions.append("Remove repeated content")
            score -= 25
        
        # Clean the pattern
        try:
            from chatbot_model.service.file_processing.enhanced_text_processor import text_processor
            # Ensure text_processor is properly initialized
            if hasattr(text_processor, 'preprocess_for_training') and hasattr(text_processor, 'calculate_text_quality'):
                cleaned_pattern = text_processor.preprocess_for_training(pattern)
                quality = text_processor.calculate_text_quality(cleaned_pattern)
                
                if hasattr(quality, 'score') and quality.score < 60:
                    score -= 15
                    if hasattr(quality, 'issues'):
                        issues.extend(quality.issues[:1])
                    if hasattr(quality, 'suggestions'):
                        suggestions.extend(quality.suggestions[:1])
            else:
                cleaned_pattern = self._basic_clean(pattern)
        except (ImportError, AttributeError, Exception) as e:
            logger.warning(f"Text processor error in pattern validation: {e}")
            cleaned_pattern = self._basic_clean(pattern)
        
        score = max(0.0, min(100.0, score))
        is_valid = score >= 50 and len(issues) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            score=score,
            issues=issues,
            suggestions=suggestions,
            cleaned_text=cleaned_pattern
        )
    
    def validate_response(self, response: str) -> ValidationResult:
        """Validate a bot response"""
        if not response or not isinstance(response, str):
            return ValidationResult(
                is_valid=False,
                score=0.0,
                issues=["Empty or invalid response"],
                suggestions=["Provide a valid response"]
            )
        
        issues = []
        suggestions = []
        score = 100.0
        
        # Length checks
        length = len(response.strip())
        if length < 1:
            issues.append("Response is empty")
            suggestions.append("Add content to the response")
            score -= 50
        elif length > 800:
            issues.append("Response too long")
            suggestions.append("Consider shortening the response")
            score -= 15
        
        # Word count
        words = response.split()
        if len(words) < 1:
            issues.append("Response has no words")
            suggestions.append("Add meaningful words to the response")
            score -= 40
        elif len(words) > 100:
            issues.append("Response has too many words")
            suggestions.append("Make the response more concise")
            score -= 10
        
        # Check for helpful content
        alpha_chars = sum(1 for c in response if c.isalpha())
        if alpha_chars < 3:
            issues.append("Response lacks meaningful content")
            suggestions.append("Add more helpful information")
            score -= 25
        
        # Check for politeness indicators
        polite_words = ['please', 'thank', 'sorry', 'help', 'welcome', 'glad']
        if any(word in response.lower() for word in polite_words):
            score += 5  # Bonus for politeness
        
        # Clean the response
        try:
            from chatbot_model.service.file_processing.enhanced_text_processor import text_processor
            # Ensure text_processor is properly initialized
            if hasattr(text_processor, 'preprocess_for_training') and hasattr(text_processor, 'calculate_text_quality'):
                cleaned_response = text_processor.preprocess_for_training(response)
                quality = text_processor.calculate_text_quality(cleaned_response)
                
                if hasattr(quality, 'score') and quality.score < 60:
                    score -= 10
                    if hasattr(quality, 'issues'):
                        issues.extend(quality.issues[:1])
                    if hasattr(quality, 'suggestions'):
                        suggestions.extend(quality.suggestions[:1])
            else:
                cleaned_response = self._basic_clean(response)
        except (ImportError, AttributeError, Exception) as e:
            logger.warning(f"Text processor error in response validation: {e}")
            cleaned_response = self._basic_clean(response)
        
        score = max(0.0, min(100.0, score))
        is_valid = score >= 40 and len(issues) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            score=score,
            issues=issues,
            suggestions=suggestions,
            cleaned_text=cleaned_response
        )
    
    def validate_intent(self, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a complete intent object"""
        validation_result = {
            'valid': True,
            'overall_score': 100.0,
            'issues': [],
            'suggestions': [],
            'field_validations': {}
        }
        
        # Validate tag
        tag = intent.get('tag', '')
        if not tag:
            validation_result['valid'] = False
            validation_result['issues'].append("Missing intent tag")
            validation_result['suggestions'].append("Provide a meaningful tag name")
            validation_result['overall_score'] -= 30
        elif not isinstance(tag, str) or len(tag.strip()) < 2:
            validation_result['valid'] = False
            validation_result['issues'].append("Invalid intent tag")
            validation_result['suggestions'].append("Tag should be a meaningful string")
            validation_result['overall_score'] -= 25
        
        # Validate patterns
        patterns = intent.get('patterns', [])
        if not patterns:
            validation_result['valid'] = False
            validation_result['issues'].append("Missing training patterns")
            validation_result['suggestions'].append("Add training patterns")
            validation_result['overall_score'] -= 40
        else:
            pattern_scores = []
            pattern_issues = []
            
            for i, pattern in enumerate(patterns):
                pattern_validation = self.validate_pattern(pattern)
                pattern_scores.append(pattern_validation.score)
                
                if not pattern_validation.is_valid:
                    pattern_issues.extend([f"Pattern {i+1}: {issue}" for issue in pattern_validation.issues])
            
            if pattern_issues:
                validation_result['issues'].extend(pattern_issues[:3])  # Limit to top 3
                validation_result['suggestions'].append("Improve pattern quality")
                validation_result['overall_score'] -= 20
            
            avg_pattern_score = sum(pattern_scores) / len(pattern_scores) if pattern_scores else 0
            validation_result['field_validations']['patterns'] = {
                'average_score': avg_pattern_score,
                'individual_scores': pattern_scores
            }
        
        # Validate responses
        responses = intent.get('responses', [])
        if not responses:
            validation_result['valid'] = False
            validation_result['issues'].append("Missing responses")
            validation_result['suggestions'].append("Add response messages")
            validation_result['overall_score'] -= 40
        else:
            response_scores = []
            response_issues = []
            
            for i, response in enumerate(responses):
                response_validation = self.validate_response(response)
                response_scores.append(response_validation.score)
                
                if not response_validation.is_valid:
                    response_issues.extend([f"Response {i+1}: {issue}" for issue in response_validation.issues])
            
            if response_issues:
                validation_result['issues'].extend(response_issues[:3])  # Limit to top 3
                validation_result['suggestions'].append("Improve response quality")
                validation_result['overall_score'] -= 15
            
            avg_response_score = sum(response_scores) / len(response_scores) if response_scores else 0
            validation_result['field_validations']['responses'] = {
                'average_score': avg_response_score,
                'individual_scores': response_scores
            }
        
        # Final validation
        validation_result['overall_score'] = max(0.0, min(100.0, validation_result['overall_score']))
        
        if validation_result['overall_score'] < 50:
            validation_result['valid'] = False
        
        return validation_result
    
    def _check_profanity(self, text: str) -> Optional[str]:
        """Basic profanity detection with word boundary checking"""
        text_lower = text.lower()
        
        for level, words in self.profanity_words.items():
            for word in words:
                # Use word boundaries to avoid false positives like "hello" containing "hell"
                pattern = r'\b' + re.escape(word) + r'\b'
                if re.search(pattern, text_lower):
                    return level
        
        return None
    
    def _basic_clean(self, text: str) -> str:
        """Basic text cleaning fallback"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Normalize unicode
        text = unicodedata.normalize('NFD', text)
        text = ''.join(char for char in text if unicodedata.category(char) != 'Mn')
        
        return text.strip()
    
    def get_validation_stats(self, texts: List[str], validation_type: str = "message") -> Dict[str, Any]:
        """Get validation statistics for a list of texts"""
        if not texts:
            return {
                'total': 0,
                'valid': 0,
                'invalid': 0,
                'average_score': 0.0,
                'issues_summary': {}
            }
        
        validator_map = {
            'message': self.validate_message,
            'pattern': self.validate_pattern,
            'response': self.validate_response
        }
        
        validator = validator_map.get(validation_type, self.validate_message)
        
        results = [validator(text) for text in texts]
        valid_count = sum(1 for r in results if r.is_valid)
        scores = [r.score for r in results]
        
        # Collect issue statistics
        all_issues = []
        for result in results:
            all_issues.extend(result.issues)
        
        issue_counts = {}
        for issue in all_issues:
            issue_counts[issue] = issue_counts.get(issue, 0) + 1
        
        return {
            'total': len(texts),
            'valid': valid_count,
            'invalid': len(texts) - valid_count,
            'average_score': sum(scores) / len(scores) if scores else 0.0,
            'score_distribution': {
                'min': min(scores) if scores else 0.0,
                'max': max(scores) if scores else 0.0,
                'median': sorted(scores)[len(scores)//2] if scores else 0.0
            },
            'issues_summary': dict(sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:10])
        }

# Global instance
text_validator = TextValidator()

# Convenience functions
def validate_message(message: str, context: str = "chat") -> ValidationResult:
    return text_validator.validate_message(message, context)

def validate_pattern(pattern: str) -> ValidationResult:
    return text_validator.validate_pattern(pattern)

def validate_response(response: str) -> ValidationResult:
    return text_validator.validate_response(response)

def validate_intent(intent: Dict[str, Any]) -> Dict[str, Any]:
    return text_validator.validate_intent(intent)