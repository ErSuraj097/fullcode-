"""
Enhanced Response Selection System
Provides better response selection and accuracy
"""

import random
import logging
from typing import Dict, List, Any, Optional, Tuple
import re
from difflib import SequenceMatcher
import os
import json
from config import PROJECTS_DIR

logger = logging.getLogger(__name__)

class ResponseSelector:
    """Enhanced response selection with better accuracy"""
    
    def __init__(self):
        self.confidence_threshold = 0.6
        self.pattern_match_threshold = 0.4
        self.tag_match_threshold = 0.7
        self.context_memory = {}  # Store conversation context
        self.learned_responses_cache = {}  # Cache for learned responses
        
    def select_best_response(self, intent_tag: str, confidence: float, intents_data: Dict,
                           original_message: str = "", project_id: str = None) -> Dict[str, Any]:
        """
        Select the best response based on intent, confidence, and context
        Now incorporates learned responses from user feedback
        """
        try:
            intents = intents_data.get("intents", [])

            # Find the matching intent
            matching_intent = None
            for intent in intents:
                if intent.get("tag") == intent_tag:
                    matching_intent = intent
                    break

            if not matching_intent:
                return {
                    "response": "I'm not sure how to respond to that.",
                    "confidence": 0.2,
                    "intent": "unknown",
                    "selection_method": "fallback"
                }

            responses = matching_intent.get("responses", [])
            if not responses:
                return {
                    "response": f"I understand you're asking about {intent_tag}, but I don't have a response ready.",
                    "confidence": confidence * 0.8,
                    "intent": intent_tag,
                    "selection_method": "no_responses"
                }

            # Check for learned responses that improve upon the original
            learned_responses = []
            if project_id:
                learned_responses = self._get_learned_responses(intent_tag, project_id)

            # Combine original and learned responses, prioritizing learned ones
            all_responses = learned_responses + responses

            # Select response based on confidence and context
            if confidence >= self.confidence_threshold:
                # High confidence - select best contextual response
                selected_response = self._select_contextual_response(
                    all_responses, original_message, matching_intent
                )
                selection_method = "learned_response" if selected_response in learned_responses else "high_confidence"
                return {
                    "response": selected_response,
                    "confidence": confidence,
                    "intent": intent_tag,
                    "selection_method": selection_method
                }
            else:
                # Lower confidence - be more cautious
                base_response = random.choice(all_responses)
                cautious_responses = [
                    f"I think you're asking about {intent_tag}. {base_response}",
                    f"If you're asking about {intent_tag}, then: {base_response}",
                    base_response  # Sometimes give direct response anyway
                ]

                selected_response = random.choice(cautious_responses)
                selection_method = "learned_cautious" if base_response in learned_responses else "cautious"
                return {
                    "response": selected_response,
                    "confidence": confidence * 0.9,  # Slightly reduce confidence
                    "intent": intent_tag,
                    "selection_method": selection_method
                }

        except Exception as e:
            logger.error(f"Error in response selection: {e}")
            return {
                "response": "I'm having trouble processing your request right now.",
                "confidence": 0.1,
                "intent": "error",
                "selection_method": "error"
            }

    def _get_learned_responses(self, intent_tag: str, project_id: str) -> List[str]:
        """
        Get learned responses for an intent from feedback data
        """
        try:
            # Check cache first
            cache_key = f"{project_id}_{intent_tag}"
            if cache_key in self.learned_responses_cache:
                return self.learned_responses_cache[cache_key]

            # Load feedback data
            feedback_file = os.path.join(PROJECTS_DIR, project_id, "feedback.json")
            if not os.path.exists(feedback_file):
                return []

            with open(feedback_file, "r", encoding="utf-8") as f:
                feedback_data = json.load(f)

            learned_responses = []

            # Look for corrections and alternative responses for this intent
            for feedback in feedback_data.get("feedback", []):
                if feedback.get("intent") == intent_tag:
                    feedback_type = feedback.get("feedback_type", "")

                    if feedback_type == "correction":
                        correction = feedback.get("correction", "").strip()
                        if correction and correction not in learned_responses:
                            learned_responses.append(correction)

                    elif feedback_type == "alternative_response":
                        alt_response = feedback.get("alternative_response", "").strip()
                        if alt_response and alt_response not in learned_responses:
                            learned_responses.append(alt_response)

            # Cache the results
            self.learned_responses_cache[cache_key] = learned_responses

            return learned_responses

        except Exception as e:
            logger.error(f"Error getting learned responses for {intent_tag}: {e}")
            return []
    
    def _select_contextual_response(self, responses: List[str], message: str, intent: Dict) -> str:
        """
        Select the most contextually appropriate response
        """
        if len(responses) == 1:
            return responses[0]
        
        if not message:
            return random.choice(responses)
        
        # Try to match response to message context
        message_lower = message.lower()
        patterns = intent.get("patterns", [])
        
        # Find the pattern that best matches the message
        best_pattern_match = None
        best_similarity = 0
        
        for pattern in patterns:
            similarity = SequenceMatcher(None, message_lower, pattern.lower()).ratio()
            if similarity > best_similarity:
                best_similarity = similarity
                best_pattern_match = pattern
        
        # If we found a good pattern match, try to select a contextually relevant response
        if best_pattern_match and best_similarity > 0.6:
            # Look for responses that might be more contextually relevant
            # This is a simple heuristic - in practice, you might want more sophisticated matching
            
            # Check for question words in message
            question_words = ['what', 'how', 'when', 'where', 'why', 'who', 'which']
            has_question = any(word in message_lower for word in question_words)
            
            if has_question:
                # Prefer longer, more informative responses for questions
                informative_responses = [r for r in responses if len(r.split()) > 5]
                if informative_responses:
                    return random.choice(informative_responses)
        
        # Default to random selection
        return random.choice(responses)
    
    def enhanced_tag_pattern_match(self, message: str, intents_data: Dict, user_id: str = None) -> Dict[str, Any]:
        """
        Smart response selection with hierarchical matching:
        1. First try exact intent/tag matching
        2. If no match, try character-based generative matching
        3. If no character match, generate contextually related response
        """
        try:
            intents = intents_data.get("intents", [])
            message_lower = message.lower().strip()

            if not message_lower:
                return {
                    "response": "Please enter a message.",
                    "confidence": 0.0,
                    "intent": "empty",
                    "selection_method": "empty_input"
                }

            # Step 1: Try exact intent/tag matching first
            exact_match_result = self._try_exact_intent_matching(message_lower, intents)
            if exact_match_result:
                return exact_match_result

            # Step 2: Try character-based generative matching
            char_match_result = self._try_character_based_matching(message_lower, intents)
            if char_match_result:
                return char_match_result

            # Step 3: Generate contextually related response
            contextual_result = self._generate_contextual_response(message, intents, user_id)
            return contextual_result

        except Exception as e:
            logger.error(f"Error in smart response selection: {e}")
            return {
                "response": "I'm having trouble understanding your message. Please try again.",
                "confidence": 0.1,
                "intent": "error",
                "selection_method": "error"
            }

    def _try_exact_intent_matching(self, message_lower: str, intents: List[Dict]) -> Optional[Dict[str, Any]]:
        """Step 1: Try exact intent and tag matching"""
        best_match = None
        best_score = 0
        best_method = "none"

        for intent in intents:
            patterns = intent.get("patterns", [])
            tag = intent.get("tag", "")

            # Check for direct tag mentions in message
            if tag.lower() in message_lower:
                score = 0.8 + (len(tag) / len(message_lower)) * 0.2
                if score > best_score:
                    best_match = intent
                    best_score = score
                    best_method = "direct_tag_match"

            # Exact pattern matching
            for pattern in patterns:
                pattern_lower = pattern.lower().strip()

                # Exact match (highest priority)
                if message_lower == pattern_lower:
                    best_match = intent
                    best_score = 1.0
                    best_method = "exact_match"
                    break

                # Contains match with position weighting
                elif pattern_lower in message_lower:
                    position_weight = 1.0 - (message_lower.index(pattern_lower) / len(message_lower))
                    score = (len(pattern_lower) / len(message_lower)) * position_weight
                    if score > best_score:
                        best_match = intent
                        best_score = score
                        best_method = "contains_match"

            # Break if we found an exact match
            if best_score == 1.0:
                break

        # Return result if we have a good exact match
        if best_match and best_score >= self.tag_match_threshold:
            responses = best_match.get("responses", [])
            if responses:
                response = self._select_contextual_response(responses, message_lower, best_match)
                return {
                    "response": response,
                    "confidence": best_score * 0.95,
                    "intent": best_match["tag"],
                    "selection_method": f"exact_{best_method}",
                    "match_score": best_score
                }

        return None

    def _try_character_based_matching(self, message_lower: str, intents: List[Dict]) -> Optional[Dict[str, Any]]:
        """Step 2: Try character-based generative matching"""
        best_match = None
        best_score = 0
        best_method = "none"

        for intent in intents:
            patterns = intent.get("patterns", [])
            tag = intent.get("tag", "")

            for pattern in patterns:
                pattern_lower = pattern.lower().strip()

                # Fuzzy matching with Levenshtein-like scoring
                similarity = self._calculate_similarity(message_lower, pattern_lower)
                if similarity > 0.7 and similarity > best_score:
                    best_match = intent
                    best_score = similarity
                    best_method = "fuzzy_match"

                # Character-level n-gram matching
                char_score = self._calculate_character_similarity(message_lower, pattern_lower)
                if char_score > 0.6 and char_score > best_score:
                    best_match = intent
                    best_score = char_score
                    best_method = "character_match"

                # Word overlap with semantic weighting
                message_words = set(message_lower.split())
                pattern_words = set(pattern_lower.split())

                if message_words and pattern_words:
                    overlap = len(message_words & pattern_words)
                    total_words = len(message_words | pattern_words)

                    # Weight important words more heavily
                    important_words = {'what', 'how', 'when', 'where', 'why', 'who', 'can', 'do', 'is', 'are', 'help', 'please'}
                    important_overlap = len((message_words & pattern_words) & important_words)

                    if overlap > 0:
                        base_score = overlap / total_words
                        importance_boost = important_overlap * 0.15
                        score = min(0.9, base_score + importance_boost)

                        if score > best_score:
                            best_match = intent
                            best_score = score
                            best_method = "semantic_word_overlap"

        # Return result if we have a good character-based match
        if best_match and best_score >= self.pattern_match_threshold:
            responses = best_match.get("responses", [])
            if responses:
                response = self._select_contextual_response(responses, message_lower, best_match)
                return {
                    "response": response,
                    "confidence": best_score * 0.85,
                    "intent": best_match["tag"],
                    "selection_method": f"character_{best_method}",
                    "match_score": best_score
                }

        return None

    def _generate_contextual_response(self, message: str, intents: List[Dict], user_id: str = None) -> Dict[str, Any]:
        """Step 3: Generate contextually related response when no matches found"""
        message_lower = message.lower()

        # Check for context from previous conversation
        if user_id and user_id in self.context_memory:
            context = self.context_memory[user_id]
            if __import__('time').time() - context["timestamp"] < 300:  # 5 minutes
                return {
                    "response": f"I'm not sure about that. Were you still asking about {context['last_intent']}? Please provide more details.",
                    "confidence": 0.3,
                    "intent": "contextual_fallback",
                    "selection_method": "context_aware_fallback"
                }

        # Try to find related intents based on keywords
        related_intents = self._find_related_intents(message_lower, intents)

        if related_intents:
            # Use the most related intent
            best_related = related_intents[0]
            responses = best_related.get("responses", [])
            if responses:
                response = random.choice(responses)
                return {
                    "response": f"I'm not completely sure, but this might help: {response}",
                    "confidence": 0.4,
                    "intent": best_related["tag"],
                    "selection_method": "contextual_related",
                    "related_score": best_related.get("score", 0)
                }

        # Generate response based on message content analysis
        contextual_response = self._analyze_message_content(message)

        return {
            "response": contextual_response,
            "confidence": 0.2,
            "intent": "contextual_generation",
            "selection_method": "content_analysis_fallback"
        }

    def _calculate_character_similarity(self, str1: str, str2: str) -> float:
        """Calculate character-level similarity using n-grams"""
        if not str1 or not str2:
            return 0.0

        # Create character n-grams (n=2,3)
        def get_ngrams(text, n):
            return [text[i:i+n] for i in range(len(text)-n+1)]

        bigrams1 = set(get_ngrams(str1, 2))
        bigrams2 = set(get_ngrams(str2, 2))
        trigrams1 = set(get_ngrams(str1, 3))
        trigrams2 = set(get_ngrams(str2, 3))

        # Calculate Jaccard similarity for n-grams
        bigram_similarity = len(bigrams1 & bigrams2) / len(bigrams1 | bigrams2) if (bigrams1 | bigrams2) else 0
        trigram_similarity = len(trigrams1 & trigrams2) / len(trigrams1 | trigrams2) if (trigrams1 | trigrams2) else 0

        # Weighted combination
        return (bigram_similarity * 0.6) + (trigram_similarity * 0.4)

    def _find_related_intents(self, message: str, intents: List[Dict]) -> List[Dict]:
        """Find intents related to the message based on keyword matching"""
        message_words = set(message.split())
        related_intents = []

        for intent in intents:
            patterns = intent.get("patterns", [])
            tag = intent.get("tag", "").lower()

            # Check tag relevance
            tag_words = set(tag.split())
            tag_overlap = len(message_words & tag_words)

            # Check pattern relevance
            pattern_relevance = 0
            for pattern in patterns:
                pattern_words = set(pattern.lower().split())
                overlap = len(message_words & pattern_words)
                pattern_relevance = max(pattern_relevance, overlap / len(pattern_words) if pattern_words else 0)

            # Calculate overall relevance
            relevance = (tag_overlap * 0.4) + (pattern_relevance * 0.6)

            if relevance > 0.1:  # Minimum relevance threshold
                related_intents.append({
                    **intent,
                    "score": relevance
                })

        # Sort by relevance score
        related_intents.sort(key=lambda x: x["score"], reverse=True)
        return related_intents[:3]  # Return top 3 related intents

    def _analyze_message_content(self, message: str) -> str:
        """Analyze message content to generate contextual response"""
        message_lower = message.lower()

        # Question detection
        question_words = ['what', 'how', 'when', 'where', 'why', 'who', 'which', 'can', 'could', 'would', 'should', 'do', 'does', 'is', 'are']
        is_question = any(word in message_lower for word in question_words)

        # Greeting detection
        greeting_words = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings']
        is_greeting = any(word in message_lower for word in greeting_words)

        # Help request detection
        help_words = ['help', 'assist', 'support', 'please', 'need', 'want', 'looking for']
        needs_help = any(word in message_lower for word in help_words)

        # Generate contextual response
        if is_greeting:
            return "Hello! How can I help you today?"
        elif is_question:
            return "That's an interesting question! I'm still learning, but I'd be happy to help if you can provide more details about what you're looking for."
        elif needs_help:
            return "I'd be happy to help! Could you please provide more details about what you need assistance with?"
        else:
            # Generic contextual responses based on message length and content
            if len(message.split()) < 3:
                return "I see you've sent a short message. Could you please elaborate or provide more details so I can better assist you?"
            else:
                return "I understand you're trying to communicate something, but I'm not quite sure what you mean. Could you please rephrase your message or provide more context?"
    
    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calculate similarity between two strings using multiple methods"""
        if not str1 or not str2:
            return 0.0
        
        # Jaccard similarity for word sets
        words1 = set(str1.split())
        words2 = set(str2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        jaccard = intersection / union if union > 0 else 0
        
        # Character-level similarity
        from difflib import SequenceMatcher
        char_similarity = SequenceMatcher(None, str1, str2).ratio()
        
        # Combined score
        return (jaccard * 0.6) + (char_similarity * 0.4)
    
    def pattern_match_fallback(self, message: str, intents_data: Dict, user_id: str = None) -> Dict[str, Any]:
        """
        Enhanced pattern matching fallback - wrapper for backward compatibility
        """
        return self.enhanced_tag_pattern_match(message, intents_data, user_id)
    
    def match_with_uploaded_content(self, message: str, intents_data: Dict, uploaded_files_content: Dict = None) -> Dict[str, Any]:
        """
        Match user input against patterns, tags, and uploaded file content
        """
        # First try standard matching
        result = self.enhanced_tag_pattern_match(message, intents_data)
        
        # If no good match and we have uploaded content, search in files
        if result["confidence"] < 0.6 and uploaded_files_content:
            file_matches = []
            message_lower = message.lower()
            
            for filename, content in uploaded_files_content.items():
                if isinstance(content, str):
                    content_lower = content.lower()
                    
                    # Check if message keywords appear in file content
                    message_words = set(message_lower.split())
                    content_words = set(content_lower.split())
                    
                    overlap = len(message_words & content_words)
                    if overlap > 0:
                        # Extract relevant snippet
                        snippet = self._extract_relevant_snippet(content, message, max_length=200)
                        file_matches.append({
                            "filename": filename,
                            "snippet": snippet,
                            "relevance": overlap / len(message_words)
                        })
            
            if file_matches:
                # Sort by relevance
                file_matches.sort(key=lambda x: x["relevance"], reverse=True)
                best_match = file_matches[0]
                
                response = f"Based on the uploaded content in '{best_match['filename']}': {best_match['snippet']}"
                
                return {
                    "response": response,
                    "confidence": 0.7,
                    "intent": "file_content_match",
                    "selection_method": "uploaded_content",
                    "source_file": best_match["filename"],
                    "relevance_score": best_match["relevance"]
                }
        
        return result
    
    def _extract_relevant_snippet(self, content: str, query: str, max_length: int = 200) -> str:
        """Extract relevant snippet from content based on query"""
        query_words = query.lower().split()
        sentences = content.split('.')
        
        best_sentence = ""
        best_score = 0
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 10:
                continue
                
            sentence_lower = sentence.lower()
            score = sum(1 for word in query_words if word in sentence_lower)
            
            if score > best_score:
                best_score = score
                best_sentence = sentence
        
        if best_sentence:
            # Truncate if too long
            if len(best_sentence) > max_length:
                best_sentence = best_sentence[:max_length] + "..."
            return best_sentence
        
        # Fallback to first part of content
        return content[:max_length] + "..." if len(content) > max_length else content
    
    def get_fallback_response(self, message: str = "") -> Dict[str, Any]:
        """
        Get a helpful fallback response when no model is available
        """
        fallback_responses = [
            "I'm still learning! Please train me with some examples so I can help you better.",
            "I haven't been trained yet. Please add some intents and responses, then train the model.",
            "I need to be trained first before I can understand and respond to your messages.",
            "To get started, please add some training data and train the model."
        ]
        
        return {
            "response": random.choice(fallback_responses),
            "confidence": 0.1,
            "intent": "untrained",
            "selection_method": "fallback"
        }

# Global response selector instance
response_selector = ResponseSelector()