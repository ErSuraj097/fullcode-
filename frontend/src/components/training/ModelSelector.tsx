import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Zap, Brain, Cpu, Clock, Target, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { projectsApi, systemApi } from '../../api/services/api';

interface ModelInfo {
  name: string;
  description: string;
  complexity: string;
  training_time: string;
  accuracy_range: string;
  technology: string;
  use_case: string;
}

interface ModelSelectorProps {
  projectId: string;
  currentModelType?: string;
  onModelSelect?: (modelType: string) => void;
  onTrainingStart?: (modelType: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  projectId,
  currentModelType = 'basic',
  onModelSelect,
  onTrainingStart
}) => {
  const [models, setModels] = useState<Record<string, ModelInfo>>({});
  const [selectedModel, setSelectedModel] = useState<string>(currentModelType);
  const [isLoading, setIsLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [modelStatus, setModelStatus] = useState<any>(null);

  useEffect(() => {
    loadAvailableModels();
    loadModelStatus();
  }, [projectId]);

  const loadAvailableModels = async () => {
    try {
      const response = await systemApi.getAvailableModels();
      setModels(response.models || {});
    } catch (error) {
      console.error('Failed to load available models:', error);
      toast.error('Failed to load available models');
    }
  };

  const loadModelStatus = async () => {
    try {
      const status = await projectsApi.getModelStatus(projectId);
      setModelStatus(status);
      setSelectedModel(status.model_type || 'basic');
    } catch (error) {
      console.error('Failed to load model status:', error);
    }
  };

  const handleModelSelect = async (modelType: string) => {
    if (isTraining) return;

    setIsLoading(true);
    try {
      await projectsApi.selectModelType(projectId, modelType as 'basic' | 'medium' | 'advanced');
      setSelectedModel(modelType);
      onModelSelect?.(modelType);
      toast.success(`${modelType.charAt(0).toUpperCase() + modelType.slice(1)} model selected`);
    } catch (error) {
      console.error('Failed to select model:', error);
      toast.error('Failed to select model');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTraining = async (modelType: string) => {
    setIsTraining(true);
    try {
      let result;
      switch (modelType) {
        case 'basic':
          result = await projectsApi.trainBasic(projectId);
          break;
        case 'medium':
          result = await projectsApi.trainMedium(projectId);
          break;
        case 'advanced':
          result = await projectsApi.trainAdvanced(projectId);
          break;
        default:
          throw new Error('Invalid model type');
      }

      toast.success(`${modelType.charAt(0).toUpperCase() + modelType.slice(1)} model training started`);
      onTrainingStart?.(modelType);
      
      // Reload model status
      setTimeout(() => {
        loadModelStatus();
      }, 1000);

    } catch (error: any) {
      console.error('Training failed:', error);
      toast.error(error.response?.data?.error || 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const getModelIcon = (modelType: string) => {
    switch (modelType) {
      case 'basic':
        return <Zap className="h-5 w-5" />;
      case 'medium':
        return <Brain className="h-5 w-5" />;
      case 'advanced':
        return <Cpu className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Model</h2>
        <p className="text-gray-600">
          Select the model type that best fits your chatbot's requirements
        </p>
      </div>

      {/* Current Status */}
      {modelStatus && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-white">
                  Current: {modelStatus.model_type?.charAt(0).toUpperCase() + modelStatus.model_type?.slice(1)}
                </Badge>
                <Badge 
                  variant={modelStatus.training_status === 'trained' ? 'default' : 'secondary'}
                  className={modelStatus.training_status === 'trained' ? 'bg-green-100 text-green-800' : ''}
                >
                  {modelStatus.training_status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              {modelStatus.accuracy > 0 && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>{(modelStatus.accuracy * 100).toFixed(1)}% accuracy</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(models).map(([modelType, info]) => (
          <Card 
            key={modelType}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedModel === modelType 
                ? 'ring-2 ring-blue-500 border-blue-500' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => !isTraining && handleModelSelect(modelType)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getModelIcon(modelType)}
                  <CardTitle className="text-lg capitalize">{modelType}</CardTitle>
                </div>
                <Badge className={getComplexityColor(info.complexity)}>
                  {info.complexity}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{info.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Technology:</span>
                  <span className="font-medium">{info.technology}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Training Time:
                  </span>
                  <span className="font-medium">{info.training_time}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <Target className="h-3 w-3 mr-1" />
                    Accuracy:
                  </span>
                  <span className="font-medium">{info.accuracy_range}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-3">{info.use_case}</p>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTraining(modelType);
                  }}
                  disabled={isTraining || isLoading}
                  className="w-full"
                  variant={selectedModel === modelType ? "default" : "outline"}
                >
                  {isTraining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Training...
                    </>
                  ) : (
                    `Train ${modelType.charAt(0).toUpperCase() + modelType.slice(1)} Model`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Training Status */}
      {isTraining && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">Training in Progress</p>
                <p className="text-sm text-orange-600">
                  Your {selectedModel} model is being trained. This may take a few minutes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModelSelector;