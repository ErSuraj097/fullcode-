import nltk
import numpy as np
from nltk.stem import PorterStemmer
import string
import re

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt_tab')
    nltk.download('punkt')

stemmer = PorterStemmer()

def tokenize(sentence):
    """
    Enhanced tokenization with special character handling
    Split sentence into array of words/tokens
    A token can be a word or punctuation character, or number
    """
    if not sentence or not isinstance(sentence, str):
        return []
    
    # Preprocess the sentence first
    processed_sentence = preprocess_text(sentence)
    
    if not processed_sentence:
        return []
    
    try:
        # Use enhanced tokenization if available
        from service.file_processing.enhanced_text_processor import text_processor
        tokens = text_processor.tokenize_advanced(processed_sentence)
    except ImportError:
        # Fallback to basic NLTK tokenization
        tokens = nltk.word_tokenize(processed_sentence)
        # Filter out punctuation-only tokens and normalize
        return [token.lower() for token in tokens if token.isalnum() or token in ['.', '?', '!']]

def stem(word):
    """
    Stemming = find the root form of the word
    examples:
    words = ["organize", "organizes", "organizing"]
    words = [stem(w) for w in words]
    -> ["organ", "organ", "organ"]
    """
    return stemmer.stem(word.lower())

def bag_of_words(tokenized_sentence, words):
    """
    Return bag of words array:
    1 for each known word that exists in the sentence, 0 otherwise
    example:
    sentence = ["hello", "how", "are", "you"]
    words = ["hi", "hello", "I", "you", "bye", "thank", "cool"]
    bog   = [  0 ,    1 ,    0,   1 ,    0 ,     0 ,      0]
    """
    # Stem each word
    sentence_words = [stem(word) for word in tokenized_sentence]
    # Initialize bag with 0 for each word
    bag = np.zeros(len(words), dtype=np.float32)
    for idx, w in enumerate(words):
        if w in sentence_words: 
            bag[idx] = 1

    return bag

def preprocess_text(text):
    """
    Enhanced text preprocessing with special character and space handling
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Import enhanced processor
    try:
        from service.file_processing.enhanced_text_processor import text_processor
        return text_processor.preprocess_for_training(text)
    except ImportError:
        # Fallback to basic processing
        # Convert to lowercase
        text = text.lower()
        
        # Normalize Unicode characters
        import unicodedata
        text = unicodedata.normalize('NFD', text)
        text = ''.join(char for char in text if unicodedata.category(char) != 'Mn')
        text = text.encode('ascii', 'ignore').decode('ascii')
        
        # Expand common contractions
        contractions = {
            "can't": "cannot", "won't": "will not", "n't": " not",
            "'re": " are", "'ve": " have", "'ll": " will", "'d": " would",
            "'m": " am", "it's": "it is", "that's": "that is"
        }
        for contraction, expansion in contractions.items():
            text = text.replace(contraction, expansion)
        
        # Remove excessive punctuation
        text = re.sub(r'[!]{2,}', '!', text)
        text = re.sub(r'[?]{2,}', '?', text)
        text = re.sub(r'[.]{4,}', '...', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\?\!\,\;\:\-]', ' ', text)
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        return text

def extract_entities(text):
    """
    Simple entity extraction (can be enhanced with spaCy or other NLP libraries)
    """
    entities = {
        'emails': re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text),
        'phones': re.findall(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text),
        'urls': re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\$$\$$,]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text),
        'numbers': re.findall(r'\b\d+\b', text)
    }
    return entities

def calculate_similarity(text1, text2):
    """
    Calculate simple similarity between two texts using Jaccard similarity
    """
    tokens1 = set(tokenize(preprocess_text(text1)))
    tokens2 = set(tokenize(preprocess_text(text2)))
    
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    
    if len(union) == 0:
        return 0.0
    
    return len(intersection) / len(union)

def get_word_frequency(texts):
    """
    Get word frequency from a list of texts
    """
    word_freq = {}
    
    for text in texts:
        tokens = tokenize(preprocess_text(text))
        for token in tokens:
            stemmed = stem(token)
            word_freq[stemmed] = word_freq.get(stemmed, 0) + 1
    
    return word_freq

def remove_stopwords(tokens):
    """
    Remove common stopwords from tokens
    """
    stopwords = {
        'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
        'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
        'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
        'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
        'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
        'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
        'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after',
        'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
        'further', 'then', 'once'
    }
    
    
    return [token for token in tokens if token.lower() not in stopwords]
