"""
Model Selector for Custom Chatbot Models
Maps training types to appropriate model architectures
"""

from typing import Dict, Any
from .model import ChatbotModel, AdvancedChatbotModel, AttentionChatbotModel, EnsembleChatbotModel, NeuralNet


class ModelSelector:
    """Select appropriate model based on training type"""
    
    MODEL_CONFIGS = {
        "basic": {
            "model_class": ChatbotModel,
            "description": "Simple 3-layer neural network with ReLU and dropout",
            "hidden_size": 64,
            "complexity": "Low",
            "training_time": "Fast (1-3 minutes)",
            "accuracy_range": "70-80%"
        },
        "medium": {
            "model_class": AdvancedChatbotModel,
            "description": "Enhanced model with batch normalization and residual connections",
            "hidden_size": 128,
            "num_layers": 3,
            "complexity": "Medium",
            "training_time": "Moderate (3-8 minutes)",
            "accuracy_range": "75-85%"
        },
        "advanced": {
            "model_class": AttentionChatbotModel,
            "description": "Transformer-style model with multi-head attention",
            "hidden_size": 256,
            "num_heads": 8,
            "complexity": "High",
            "training_time": "Slower (8-15 minutes)",
            "accuracy_range": "80-90%"
        },
        "ensemble": {
            "model_class": EnsembleChatbotModel,
            "description": "Combines multiple models for best performance",
            "hidden_size": 128,
            "complexity": "Very High",
            "training_time": "Slowest (15-30 minutes)",
            "accuracy_range": "85-95%"
        },
        "neural": {
            "model_class": NeuralNet,
            "description": "Simple neural network for classification",
            "hidden_size": 64,
            "complexity": "Low",
            "training_time": "Very Fast (30 seconds - 2 minutes)",
            "accuracy_range": "65-75%"
        }
    }
    
    @classmethod
    def get_model(cls, model_type: str, input_size: int, output_size: int, **kwargs):
        """Get model instance based on type"""
        if model_type not in cls.MODEL_CONFIGS:
            model_type = "basic"  # Default fallback
        
        config = cls.MODEL_CONFIGS[model_type]
        model_class = config["model_class"]
        
        # Prepare model arguments
        model_args = {
            "input_size": input_size,
            "output_size": output_size
        }
        
        # Add model-specific parameters
        if model_type == "basic" or model_type == "neural":
            model_args["hidden_size"] = config.get("hidden_size", 64)
            if model_type == "neural":
                model_args["num_classes"] = output_size
                del model_args["output_size"]  # NeuralNet uses num_classes
        elif model_type == "medium":
            model_args["hidden_size"] = config.get("hidden_size", 128)
            model_args["num_layers"] = config.get("num_layers", 3)
        elif model_type == "advanced":
            model_args["hidden_size"] = config.get("hidden_size", 256)
            model_args["num_heads"] = config.get("num_heads", 8)
        elif model_type == "ensemble":
            model_args["hidden_size"] = config.get("hidden_size", 128)
        
        # Override with any provided kwargs
        model_args.update(kwargs)
        
        return model_class(**model_args)
    
    @classmethod
    def get_available_models(cls) -> Dict[str, Dict[str, Any]]:
        """Get information about available models"""
        return {
            name: {
                "description": config["description"],
                "complexity": config["complexity"],
                "training_time": config["training_time"],
                "accuracy_range": config["accuracy_range"]
            }
            for name, config in cls.MODEL_CONFIGS.items()
        }
    
    @classmethod
    def get_model_info(cls, model_type: str) -> Dict[str, Any]:
        """Get detailed information about a specific model"""
        if model_type not in cls.MODEL_CONFIGS:
            return {"error": f"Unknown model type: {model_type}"}
        
        return cls.MODEL_CONFIGS[model_type].copy()
    
    @classmethod
    def recommend_model(cls, num_intents: int, num_patterns: int) -> str:
        """Recommend model type based on data size"""
        if num_intents <= 5 and num_patterns <= 20:
            return "basic"
        elif num_intents <= 15 and num_patterns <= 100:
            return "medium"
        elif num_intents <= 30 and num_patterns <= 300:
            return "advanced"
        else:
            return "ensemble"