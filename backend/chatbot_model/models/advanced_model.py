import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import json
import os
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import logging
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns



from chatbot_model.models.model import AdvancedChatbotModel, AttentionChatbotModel, EnsembleChatbotModel
from chatbot_model.models.model_selector import ModelSelector
# from .nltk_utils import bag_of_words, tokenize, stem, preprocess_text
from chatbot_model.utils.nltk_utils import  bag_of_words, tokenize, stem, preprocess_text


logger = logging.getLogger(__name__)

@dataclass
class TrainingConfig:
    model_type: str = "advanced"  # "basic", "advanced", "attention", "ensemble"
    epochs: int = 100
    batch_size: int = 16
    learning_rate: float = 0.001
    hidden_size: int = 128
    num_layers: int = 3
    num_heads: int = 8
    dropout_rate: float = 0.3
    weight_decay: float = 1e-5
    patience: int = 10
    confidence_threshold: float = 0.75
    validation_split: float = 0.2
    use_scheduler: bool = True
    scheduler_step_size: int = 30
    scheduler_gamma: float = 0.5

class AdvancedChatDataset(Dataset):
    def __init__(self, X, y, augment=False):
        self.X = torch.FloatTensor(X)
        self.y = torch.LongTensor(y)
        self.augment = augment
        
    def __len__(self):
        return len(self.X)
    
    def __getitem__(self, idx):
        x = self.X[idx]
        y = self.y[idx]
        
        if self.augment:
            # Add noise for data augmentation
            noise = torch.randn_like(x) * 0.01
            x = x + noise
            
        return x, y

class AdvancedModelTrainer:
    def __init__(self, config: TrainingConfig = None):
        self.config = config or TrainingConfig()
        self.model = None
        self.all_words = []
        self.tags = []
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.training_history = {
            'train_loss': [],
            'val_loss': [],
            'train_acc': [],
            'val_acc': []
        }
        
    def prepare_data(self, intents_data: List[Dict]):
        """Prepare and preprocess training data"""
        all_words = []
        tags = []
        xy = []
        
        # Extract patterns and tags
        for intent in intents_data:
            tag = intent['tag']
            tags.append(tag)
            
            for pattern in intent['patterns']:
                # Preprocess text
                processed_pattern = preprocess_text(pattern)
                w = tokenize(processed_pattern)
                all_words.extend(w)
                xy.append((w, tag))
        
        # Stem and filter words
        ignore_words = ['?', '.', '!', ',', ';', ':', '-', '(', ')']
        all_words = [stem(w) for w in all_words if w not in ignore_words]
        all_words = sorted(set(all_words))
        tags = sorted(set(tags))
        
        self.all_words = all_words
        self.tags = tags
        
        # Create training data
        X = []
        y = []
        
        for (pattern_sentence, tag) in xy:
            bag = bag_of_words(pattern_sentence, all_words)
            X.append(bag)
            
            label = tags.index(tag)
            y.append(label)
        
        X = np.array(X)
        y = np.array(y)
        
        return X, y
    
    def create_model(self, input_size: int, output_size: int):
        """Create model based on configuration using ModelSelector"""
        # Prepare model-specific kwargs
        model_kwargs = {
            "hidden_size": self.config.hidden_size
        }
        
        # Add model-specific parameters based on model type
        if self.config.model_type in ["medium"]:
            model_kwargs["num_layers"] = getattr(self.config, 'num_layers', 3)
        elif self.config.model_type in ["advanced"]:
            model_kwargs["num_heads"] = getattr(self.config, 'num_heads', 8)
        
        model = ModelSelector.get_model(
            self.config.model_type,
            input_size,
            output_size,
            **model_kwargs
        )
        
        return model.to(self.device)
    
    def train(self, intents_data: List[Dict]) -> Dict[str, Any]:
        """Train the advanced model"""
        try:
            logger.info(f"Starting training with {self.config.model_type} model")
            
            # Prepare data
            X, y = self.prepare_data(intents_data)
            
            # Split data with improved logic
            try:
                # Try stratified split first
                X_train, X_val, y_train, y_val = train_test_split(
                    X, y, 
                    test_size=self.config.validation_split, 
                    random_state=42,
                    stratify=y
                )
            except ValueError as e:
                logger.warning(f"Stratified split failed: {e}. Using random split.")
                # Fallback to random split if stratified fails
                X_train, X_val, y_train, y_val = train_test_split(
                    X, y, 
                    test_size=self.config.validation_split, 
                    random_state=42
                )
            
            # Ensure we have enough data for training
            if len(X_train) < 2:
                logger.warning("Very small dataset. Using all data for training.")
                X_train, y_train = X, y
                X_val, y_val = X, y  # Use same data for validation
            
            # Create datasets
            train_dataset = AdvancedChatDataset(X_train, y_train, augment=True)
            val_dataset = AdvancedChatDataset(X_val, y_val, augment=False)
            
            # Create data loaders
            train_loader = DataLoader(
                train_dataset, 
                batch_size=self.config.batch_size, 
                shuffle=True,
                num_workers=0
            )
            val_loader = DataLoader(
                val_dataset, 
                batch_size=self.config.batch_size, 
                shuffle=False,
                num_workers=0
            )
            
            # Create model
            input_size = len(self.all_words)
            output_size = len(self.tags)
            self.model = self.create_model(input_size, output_size)
            
            # Loss and optimizer
            criterion = nn.CrossEntropyLoss()
            optimizer = optim.AdamW(
                self.model.parameters(), 
                lr=self.config.learning_rate,
                weight_decay=self.config.weight_decay
            )
            
            # Learning rate scheduler
            if self.config.use_scheduler:
                scheduler = optim.lr_scheduler.StepLR(
                    optimizer, 
                    step_size=self.config.scheduler_step_size,
                    gamma=self.config.scheduler_gamma
                )
            
            # Early stopping
            best_val_loss = float('inf')
            patience_counter = 0
            best_model_state = None
            
            # Training loop
            for epoch in range(self.config.epochs):
                # Training phase
                self.model.train()
                train_loss = 0.0
                train_correct = 0
                train_total = 0
                
                for batch_X, batch_y in train_loader:
                    batch_X = batch_X.to(self.device)
                    batch_y = batch_y.to(self.device)
                    
                    optimizer.zero_grad()
                    outputs = self.model(batch_X)
                    loss = criterion(outputs, batch_y)
                    loss.backward()
                    
                    # Gradient clipping
                    torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                    
                    optimizer.step()
                    
                    train_loss += loss.item()
                    _, predicted = torch.max(outputs.data, 1)
                    train_total += batch_y.size(0)
                    train_correct += (predicted == batch_y).sum().item()
                
                # Validation phase
                self.model.eval()
                val_loss = 0.0
                val_correct = 0
                val_total = 0
                
                with torch.no_grad():
                    for batch_X, batch_y in val_loader:
                        batch_X = batch_X.to(self.device)
                        batch_y = batch_y.to(self.device)
                        
                        outputs = self.model(batch_X)
                        loss = criterion(outputs, batch_y)
                        
                        val_loss += loss.item()
                        _, predicted = torch.max(outputs.data, 1)
                        val_total += batch_y.size(0)
                        val_correct += (predicted == batch_y).sum().item()
                
                # Calculate metrics
                train_loss /= len(train_loader)
                val_loss /= len(val_loader)
                train_acc = 100 * train_correct / train_total
                val_acc = 100 * val_correct / val_total
                
                # Store history
                self.training_history['train_loss'].append(train_loss)
                self.training_history['val_loss'].append(val_loss)
                self.training_history['train_acc'].append(train_acc)
                self.training_history['val_acc'].append(val_acc)
                
                # Learning rate scheduling
                if self.config.use_scheduler:
                    scheduler.step()
                
                # Early stopping check
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    patience_counter = 0
                    best_model_state = self.model.state_dict().copy()
                else:
                    patience_counter += 1
                
                # Log progress
                if (epoch + 1) % 10 == 0:
                    logger.info(f'Epoch [{epoch+1}/{self.config.epochs}] - '
                              f'Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}% - '
                              f'Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%')
                
                # Early stopping
                if patience_counter >= self.config.patience:
                    logger.info(f'Early stopping at epoch {epoch+1}')
                    break
            
            # Load best model
            if best_model_state:
                self.model.load_state_dict(best_model_state)
            
            # Final evaluation
            final_metrics = self.evaluate_model(val_loader)
            
            logger.info(f"Training completed. Final validation accuracy: {final_metrics['accuracy']:.2f}%")
            
            return {
                "accuracy": final_metrics['accuracy'],
                "final_metrics": final_metrics,
                "training_history": self.training_history,
                "model_type": self.config.model_type,
                "epochs_trained": epoch + 1,
                "best_val_loss": best_val_loss
            }
            
        except Exception as e:
            logger.error(f"Error during advanced training: {str(e)}")
            raise e
    
    def evaluate_model(self, data_loader) -> Dict[str, Any]:
        """Evaluate model performance"""
        self.model.eval()
        all_predictions = []
        all_targets = []
        all_confidences = []
        
        with torch.no_grad():
            for batch_X, batch_y in data_loader:
                batch_X = batch_X.to(self.device)
                batch_y = batch_y.to(self.device)
                
                outputs = self.model(batch_X)
                probabilities = torch.softmax(outputs, dim=1)
                max_probs, predicted = torch.max(probabilities, 1)
                
                all_predictions.extend(predicted.cpu().numpy())
                all_targets.extend(batch_y.cpu().numpy())
                all_confidences.extend(max_probs.cpu().numpy())
        
        # Calculate metrics
        accuracy = 100 * sum(p == t for p, t in zip(all_predictions, all_targets)) / len(all_predictions)
        avg_confidence = np.mean(all_confidences)
        
        # Generate classification report with error handling
        try:
            # Get unique classes that actually appear in predictions
            unique_classes = sorted(set(all_targets + all_predictions))
            target_names_filtered = [self.tags[i] for i in unique_classes if i < len(self.tags)]
            
            report = classification_report(
                all_targets, 
                all_predictions, 
                target_names=target_names_filtered,
                output_dict=True,
                zero_division=0
            )
        except Exception as e:
            logger.warning(f"Classification report failed: {e}, using basic metrics")
            report = {"accuracy": accuracy / 100}
        
        return {
            "accuracy": accuracy,
            "average_confidence": avg_confidence,
            "classification_report": report,
            "confusion_matrix": confusion_matrix(all_targets, all_predictions).tolist(),
            "confidence_distribution": {
                "min": float(np.min(all_confidences)),
                "max": float(np.max(all_confidences)),
                "std": float(np.std(all_confidences)),
                "median": float(np.median(all_confidences))
            }
        }
    
    def predict(self, text: str) -> Dict[str, Any]:
        """Make prediction on input text"""
        if not self.model:
            return {"error": "Model not trained"}
        
        try:
            self.model.eval()
            
            # Preprocess and tokenize
            processed_text = preprocess_text(text)
            tokenized = tokenize(processed_text)
            bag = bag_of_words(tokenized, self.all_words)
            bag = torch.FloatTensor(bag).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                output = self.model(bag)
                probabilities = torch.softmax(output, dim=1)
                max_prob, predicted_idx = torch.max(probabilities, 1)
                
                predicted_tag = self.tags[predicted_idx.item()]
                confidence = max_prob.item()
                
                # Get all probabilities
                all_probs = probabilities[0].cpu().numpy()
                all_probabilities = {
                    tag: float(prob) for tag, prob in zip(self.tags, all_probs)
                }
                
                return {
                    "intent": predicted_tag,
                    "confidence": confidence,
                    "all_probabilities": all_probabilities
                }
                
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            return {"error": str(e)}
    
    def save_model(self, project_id: str):
        """Save trained model"""
        if not self.model:
            raise Exception("No model to save")

        # Import PROJECTS_DIR from config
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        from config import PROJECTS_DIR

        project_dir = os.path.join(PROJECTS_DIR, project_id)
        os.makedirs(project_dir, exist_ok=True)

        # Save model state
        model_path = os.path.join(project_dir, "advanced_model.pth")
        torch.save(self.model.state_dict(), model_path)

        # Save model data
        data = {
            "model_type": self.config.model_type,
            "input_size": len(self.all_words),
            "hidden_size": self.config.hidden_size,
            "output_size": len(self.tags),
            "num_layers": self.config.num_layers,
            "all_words": self.all_words,
            "tags": self.tags,
            "config": self.config.__dict__,
            "training_history": self.training_history
        }

        data_path = os.path.join(project_dir, "advanced_data.pth")
        torch.save(data, data_path)

        logger.info(f"Advanced model saved for project {project_id}")
    
    def load_model(self, project_id: str) -> bool:
        """Load trained model"""
        try:
            # Import PROJECTS_DIR from config
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            from config import PROJECTS_DIR

            project_dir = os.path.join(PROJECTS_DIR, project_id)
            model_path = os.path.join(project_dir, "advanced_model.pth")
            data_path = os.path.join(project_dir, "advanced_data.pth")

            if not os.path.exists(model_path) or not os.path.exists(data_path):
                return False

            # Load data
            data = torch.load(data_path, map_location=self.device)
            self.all_words = data["all_words"]
            self.tags = data["tags"]
            self.training_history = data.get("training_history", {})

            # Update config
            if "config" in data:
                for key, value in data["config"].items():
                    if hasattr(self.config, key):
                        setattr(self.config, key, value)

            # Create and load model
            input_size = data["input_size"]
            output_size = data["output_size"]
            self.model = self.create_model(input_size, output_size)
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.eval()

            logger.info(f"Advanced model loaded for project {project_id}")
            return True

        except Exception as e:
            logger.error(f"Error loading advanced model for project {project_id}: {str(e)}")
            return False
    
    def plot_training_history(self, save_path: str = None):
        """Plot training history"""
        if not self.training_history:
            logger.warning("No training history available")
            return
        
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 8))
        
        # Loss plots
        ax1.plot(self.training_history['train_loss'], label='Train Loss')
        ax1.plot(self.training_history['val_loss'], label='Validation Loss')
        ax1.set_title('Training and Validation Loss')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Loss')
        ax1.legend()
        ax1.grid(True)
        
        # Accuracy plots
        ax2.plot(self.training_history['train_acc'], label='Train Accuracy')
        ax2.plot(self.training_history['val_acc'], label='Validation Accuracy')
        ax2.set_title('Training and Validation Accuracy')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Accuracy (%)')
        ax2.legend()
        ax2.grid(True)
        
        # Learning rate plot (if available)
        if 'learning_rate' in self.training_history:
            ax3.plot(self.training_history['learning_rate'])
            ax3.set_title('Learning Rate Schedule')
            ax3.set_xlabel('Epoch')
            ax3.set_ylabel('Learning Rate')
            ax3.grid(True)
        else:
            ax3.text(0.5, 0.5, 'Learning Rate\nHistory Not Available', 
                    ha='center', va='center', transform=ax3.transAxes)
        
        # Loss difference
        if len(self.training_history['train_loss']) > 0 and len(self.training_history['val_loss']) > 0:
            loss_diff = np.array(self.training_history['val_loss']) - np.array(self.training_history['train_loss'])
            ax4.plot(loss_diff)
            ax4.set_title('Validation - Training Loss')
            ax4.set_xlabel('Epoch')
            ax4.set_ylabel('Loss Difference')
            ax4.grid(True)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"Training history plot saved to {save_path}")
        
        plt.show()

def hyperparameter_search(intents_data: List[Dict], param_grid: Dict[str, List]) -> Dict[str, Any]:
    """Perform hyperparameter search"""
    best_score = 0
    best_params = {}
    results = []
    
    # Generate parameter combinations
    import itertools
    param_names = list(param_grid.keys())
    param_values = list(param_grid.values())
    
    for param_combination in itertools.product(*param_values):
        params = dict(zip(param_names, param_combination))
        
        try:
            # Create config with current parameters
            config = TrainingConfig(**params)
            trainer = AdvancedModelTrainer(config)
            
            # Train model
            result = trainer.train(intents_data)
            score = result['accuracy']
            
            results.append({
                'params': params,
                'score': score,
                'result': result
            })
            
            if score > best_score:
                best_score = score
                best_params = params
            
            logger.info(f"Params: {params}, Score: {score:.2f}%")
            
        except Exception as e:
            logger.error(f"Error with params {params}: {str(e)}")
            continue
    
    return {
        'best_params': best_params,
        'best_score': best_score,
        'all_results': results
    }
