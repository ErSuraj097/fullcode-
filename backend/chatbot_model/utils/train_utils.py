import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import numpy as np
import json
import os
from .nltk_utils import bag_of_words, tokenize, stem
from chatbot_model.models.model import ChatbotModel
import logging

logger = logging.getLogger(__name__)

class ChatDataset(Dataset):
    def __init__(self, X_train, y_train):
        self.n_samples = len(X_train)
        self.x_data = X_train
        self.y_data = y_train

    def __getitem__(self, index):
        return self.x_data[index], self.y_data[index]

    def __len__(self):
        return self.n_samples

def train_model(project_id):
    """Train basic chatbot model"""
    try:
        # Import PROJECTS_DIR from config
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        from config import PROJECTS_DIR
        
        project_dir = os.path.join(PROJECTS_DIR, project_id)
        intents_file = os.path.join(project_dir, "intents.json")
        
        if not os.path.exists(intents_file):
            raise Exception("No intents file found")
        
        with open(intents_file, 'r', encoding='utf-8') as f:
            intents = json.load(f)
        
        all_words = []
        tags = []
        xy = []
        
        # Enhanced processing for training data
        for intent in intents['intents']:
            tag = intent['tag']
            tags.append(tag)
            patterns = intent.get('patterns', [])
            
            if not patterns:
                logger.warning(f"Intent '{tag}' has no patterns, skipping")
                continue
                
            for pattern in patterns:
                if not pattern or not isinstance(pattern, str):
                    continue
                    
                try:
                    # Use enhanced text processing
                    from chatbot_model.service.file_processing.enhanced_text_processor import EnhancedTextProcessor
                    text_processor = EnhancedTextProcessor()
                    
                    # Validate and clean the pattern
                    quality = text_processor.calculate_text_quality(pattern)
                    if quality.score < 30:  # Lower threshold for small datasets
                        logger.warning(f"Skipping very low quality pattern: {pattern} (score: {quality.score})")
                        continue
                    
                    # Preprocess and tokenize
                    processed_pattern = text_processor.preprocess_for_training(pattern)
                    if processed_pattern:
                        w = text_processor.tokenize_advanced(processed_pattern)
                        # Filter out empty tokens
                        w = [token for token in w if token and token.strip()]
                        if w:  # Only add if we have valid tokens
                            all_words.extend(w)
                            xy.append((w, tag))
                    
                except ImportError:
                    # Fallback to basic processing
                    w = tokenize(pattern)
                    if w:  # Only add if we have valid tokens
                        all_words.extend(w)
                        xy.append((w, tag))
                except Exception as e:
                    logger.warning(f"Error processing pattern '{pattern}': {e}")
                    # Try basic tokenization as last resort
                    try:
                        w = tokenize(pattern)
                        if w:
                            all_words.extend(w)
                            xy.append((w, tag))
                    except:
                        logger.error(f"Failed to process pattern '{pattern}', skipping")
        
        # Ensure we have training data
        if not xy:
            raise ValueError("No valid training patterns found after processing")
        
        if len(set(tags)) < 2:
            raise ValueError("Need at least 2 different intent tags for training")

        # Stem and lower each word
        ignore_words = ['?', '.', '!']
        all_words = [stem(w) for w in all_words if w not in ignore_words]
        # Remove duplicates and sort
        all_words = sorted(set(all_words))
        tags = sorted(set(tags))

        # Create training data
        X_train = []
        y_train = []
        for (pattern_sentence, tag) in xy:
            # X: bag of words for each pattern_sentence
            bag = bag_of_words(pattern_sentence, all_words)
            X_train.append(bag)
            
            # y: PyTorch CrossEntropyLoss needs only class labels, not one-hot
            label = tags.index(tag)
            y_train.append(label)

        X_train = np.array(X_train)
        y_train = np.array(y_train)

        # Hyper-parameters 
        num_epochs = 1000
        batch_size = 8
        learning_rate = 0.001
        input_size = len(X_train[0])
        hidden_size = 8
        output_size = len(tags)

        dataset = ChatDataset(X_train, y_train)
        train_loader = DataLoader(dataset=dataset,
                                batch_size=batch_size,
                                shuffle=True,
                                num_workers=0)

        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        model = ChatbotModel(input_size, hidden_size, output_size).to(device)

        # Loss and optimizer
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

        # Train the model
        for epoch in range(num_epochs):
            for (words, labels) in train_loader:
                words = words.to(device)
                labels = labels.to(torch.long).to(device)
                
                # Forward pass
                outputs = model(words)
                loss = criterion(outputs, labels)
                
                # Backward and optimize
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
            
            if (epoch+1) % 100 == 0:
                logger.info(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')

        # Calculate accuracy
        model.eval()
        with torch.no_grad():
            correct = 0
            total = 0
            for words, labels in train_loader:
                words = words.to(device)
                labels = labels.to(torch.long).to(device)
                outputs = model(words)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
            
            accuracy = 100 * correct / total

        # Save model and data
        data = {
            "model_state": model.state_dict(),
            "input_size": input_size,
            "hidden_size": hidden_size,
            "output_size": output_size,
            "all_words": all_words,
            "tags": tags
        }
        
        model_file = os.path.join(project_dir, "chatbot_model.pth")
        data_file = os.path.join(project_dir, "data.pth")
        
        torch.save(model.state_dict(), model_file)
        torch.save(data, data_file)
        
        logger.info(f"Training complete for project {project_id}. Accuracy: {accuracy:.2f}%")
        
        return {
            "accuracy": accuracy,
            "loss": loss.item(),
            "epochs": num_epochs,
            "model_type": "basic"
        }
        
    except Exception as e:
        logger.error(f"Error training model for project {project_id}: {str(e)}")
        raise e

def evaluate_model(project_id, test_data=None):
    """Evaluate trained model performance"""
    try:
        project_dir = os.path.join("../projects", project_id)
        data_file = os.path.join(project_dir, "data.pth")
        model_file = os.path.join(project_dir, "chatbot_model.pth")
        
        if not os.path.exists(data_file) or not os.path.exists(model_file):
            raise Exception("Model files not found")
        
        # Load model and data
        data = torch.load(data_file, map_location=torch.device('cpu'))
        model = ChatbotModel(data["input_size"], data["hidden_size"], data["output_size"])
        model.load_state_dict(torch.load(model_file, map_location=torch.device('cpu')))
        model.eval()
        
        if test_data is None:
            # Use training data for evaluation if no test data provided
            intents_file = os.path.join(project_dir, "intents.json")
            with open(intents_file, 'r', encoding='utf-8') as f:
                intents = json.load(f)
            
            test_patterns = []
            test_tags = []
            for intent in intents['intents']:
                for pattern in intent['patterns']:
                    test_patterns.append(pattern)
                    test_tags.append(intent['tag'])
        else:
            test_patterns, test_tags = test_data
        
        # Evaluate
        correct_predictions = 0
        total_predictions = len(test_patterns)
        confidence_scores = []
        
        with torch.no_grad():
            for pattern, true_tag in zip(test_patterns, test_tags):
                tokenized = tokenize(pattern)
                bag = bag_of_words(tokenized, data["all_words"])
                bag = torch.tensor(bag, dtype=torch.float32).unsqueeze(0)
                
                output = model(bag)
                probabilities = torch.softmax(output, dim=1)
                max_prob = torch.max(probabilities).item()
                predicted_idx = torch.argmax(output).item()
                predicted_tag = data["tags"][predicted_idx]
                
                confidence_scores.append(max_prob)
                
                if predicted_tag == true_tag:
                    correct_predictions += 1
        
        accuracy = (correct_predictions / total_predictions) * 100
        avg_confidence = np.mean(confidence_scores)
        
        return {
            "accuracy": accuracy,
            "average_confidence": avg_confidence,
            "total_predictions": total_predictions,
            "correct_predictions": correct_predictions,
            "confidence_distribution": {
                "min": np.min(confidence_scores),
                "max": np.max(confidence_scores),
                "std": np.std(confidence_scores)
            }
        }
        
    except Exception as e:
        logger.error(f"Error evaluating model for project {project_id}: {str(e)}")
        raise e

def retrain_model(project_id, new_intents=None):
    """Retrain model with new data"""
    try:
        if new_intents:
            # Add new intents to existing ones
            project_dir = os.path.join("../projects", project_id)
            intents_file = os.path.join(project_dir, "intents.json")
            
            if os.path.exists(intents_file):
                with open(intents_file, 'r', encoding='utf-8') as f:
                    existing_intents = json.load(f)
                
                existing_intents['intents'].extend(new_intents)
                
                with open(intents_file, 'w', encoding='utf-8') as f:
                    json.dump(existing_intents, f, ensure_ascii=False, indent=4)
        
        # Retrain with updated data
        return train_model(project_id)
        
    except Exception as e:
        logger.error(f"Error retraining model for project {project_id}: {str(e)}")
        raise e

def get_model_info(project_id):
    """Get information about trained model"""
    try:
        project_dir = os.path.join("../projects", project_id)
        data_file = os.path.join(project_dir, "data.pth")
        
        if not os.path.exists(data_file):
            return {"status": "not_trained"}
        
        data = torch.load(data_file, map_location=torch.device('cpu'))
        
        return {
            "status": "trained",
            "input_size": data["input_size"],
            "hidden_size": data["hidden_size"],
            "output_size": data["output_size"],
            "num_intents": len(data["tags"]),
            "vocabulary_size": len(data["all_words"]),
            "intents": data["tags"]
        }
        
    except Exception as e:
        logger.error(f"Error getting model info for project {project_id}: {str(e)}")
        return {"status": "error", "message": str(e)}
