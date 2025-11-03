import torch
import torch.nn as nn


class ChatbotModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(ChatbotModel, self).__init__()
        self.l1 = nn.Linear(input_size, hidden_size) 
        self.l2 = nn.Linear(hidden_size, hidden_size) 
        self.l3 = nn.Linear(hidden_size, output_size)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x):
        out = self.l1(x)
        out = self.relu(out)
        out = self.dropout(out)
        out = self.l2(out)
        out = self.relu(out)
        out = self.dropout(out)
        out = self.l3(out)
        # no activation and no softmax at the end
        return out


class AdvancedChatbotModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_layers=3):
        super(AdvancedChatbotModel, self).__init__()
        
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        self.num_layers = num_layers
        
        # Input layer
        self.input_layer = nn.Linear(input_size, hidden_size)
        
        # Hidden layers
        self.hidden_layers = nn.ModuleList([
            nn.Linear(hidden_size, hidden_size) for _ in range(num_layers - 1)
        ])
        
        # Output layer
        self.output_layer = nn.Linear(hidden_size, output_size)
        
        # Activation functions
        self.relu = nn.ReLU()
        self.leaky_relu = nn.LeakyReLU(0.1)
        
        # Regularization
        self.dropout = nn.Dropout(0.3)
        self.batch_norm = nn.BatchNorm1d(hidden_size)
        
        # Initialize weights
        self._initialize_weights()
    
    def _initialize_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                nn.init.constant_(m.bias, 0)
    
    def forward(self, x):
        # Input layer
        out = self.input_layer(x)
        out = self.batch_norm(out)
        out = self.leaky_relu(out)
        out = self.dropout(out)
        
        # Hidden layers
        for hidden_layer in self.hidden_layers:
            residual = out
            out = hidden_layer(out)
            out = self.batch_norm(out)
            out = self.leaky_relu(out)
            out = self.dropout(out)
            
            # Residual connection (if dimensions match)
            if residual.shape == out.shape:
                out = out + residual
        
        # Output layer
        out = self.output_layer(out)
        
        return out


class AttentionChatbotModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_heads=8):
        super(AttentionChatbotModel, self).__init__()
        
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        
        # Embedding layer
        self.embedding = nn.Linear(input_size, hidden_size)
        
        # Multi-head attention
        self.attention = nn.MultiheadAttention(hidden_size, num_heads, batch_first=True)
        
        # Feed forward network
        self.ffn = nn.Sequential(
            nn.Linear(hidden_size, hidden_size * 4),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_size * 4, hidden_size)
        )
        
        # Layer normalization
        self.layer_norm1 = nn.LayerNorm(hidden_size)
        self.layer_norm2 = nn.LayerNorm(hidden_size)
        
        # Output layer
        self.output_layer = nn.Linear(hidden_size, output_size)
        
        # Dropout
        self.dropout = nn.Dropout(0.1)
    
    def forward(self, x):
        # Add sequence dimension for attention
        if len(x.shape) == 2:
            x = x.unsqueeze(1)  # (batch_size, 1, input_size)
        
        # Embedding
        embedded = self.embedding(x)  # (batch_size, 1, hidden_size)
        
        # Self-attention
        attn_output, _ = self.attention(embedded, embedded, embedded)
        attn_output = self.dropout(attn_output)
        
        # Residual connection and layer norm
        out1 = self.layer_norm1(embedded + attn_output)
        
        # Feed forward network
        ffn_output = self.ffn(out1)
        ffn_output = self.dropout(ffn_output)
        
        # Residual connection and layer norm
        out2 = self.layer_norm2(out1 + ffn_output)
        
        # Remove sequence dimension and apply output layer
        out2 = out2.squeeze(1)  # (batch_size, hidden_size)
        output = self.output_layer(out2)
        
        return output


class EnsembleChatbotModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(EnsembleChatbotModel, self).__init__()
        
        # Multiple models with different architectures
        self.model1 = ChatbotModel(input_size, hidden_size, output_size)
        self.model2 = AdvancedChatbotModel(input_size, hidden_size, output_size)
        self.model3 = AttentionChatbotModel(input_size, hidden_size, output_size)
        
        # Combination layer
        self.combination_layer = nn.Linear(output_size * 3, output_size)
        self.softmax = nn.Softmax(dim=1)
    
    def forward(self, x):
        # Get outputs from all models
        out1 = self.model1(x)
        out2 = self.model2(x)
        out3 = self.model3(x)
        
        # Concatenate outputs
        combined = torch.cat([out1, out2, out3], dim=1)
        
        # Final combination
        output = self.combination_layer(combined)
        
        return output


class NeuralNet(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(NeuralNet, self).__init__()
        self.l1 = nn.Linear(input_size, hidden_size) 
        self.l2 = nn.Linear(hidden_size, hidden_size) 
        self.l3 = nn.Linear(hidden_size, num_classes)
        self.relu = nn.ReLU()
    
    def forward(self, x):
        out = self.l1(x)
        out = self.relu(out)
        out = self.l2(out)
        out = self.relu(out)
        out = self.l3(out)
        # no activation and no softmax at the end
        return out