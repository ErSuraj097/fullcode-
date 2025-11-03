import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Brain, Zap, Sparkles, CheckCircle, Cpu, Layers, Network } from 'lucide-react';
import { projectsApi } from '../../api/services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { cn } from '../../utils/cn';

interface ModelOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  complexity: 'Low' | 'Medium' | 'High';
  trainingTime: string;
  accuracy: string;
  color: string;
}

const modelOptions: ModelOption[] = [
  {
    id: 'basic',
    name: 'Basic Model',
    description: 'Simple neural network for basic conversations',
    icon: Cpu,
    features: ['Fast training', 'Basic responses', 'Easy setup', 'Avatar & colors'],
    complexity: 'Low',
    trainingTime: '~2-5 minutes',
    accuracy: '75-85%',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'medium',
    name: 'Medium Model',
    description: 'BERT-based model for better understanding',
    icon: Layers,
    features: ['Better accuracy', 'Context awareness', 'Avatar & colors', 'Dynamic features'],
    complexity: 'Medium',
    trainingTime: '~5-15 minutes',
    accuracy: '85-95%',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'advanced',
    name: 'Advanced Model',
    description: 'RoBERTa-based model for complex conversations',
    icon: Brain,
    features: ['High accuracy', 'Advanced features', 'Full customization', 'Complex configurations'],
    complexity: 'High',
    trainingTime: '~15-45 minutes',
    accuracy: '90-98%',
    color: 'from-purple-500 to-purple-600',
  },
];

const ModelSelectionPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const projectData = location.state?.projectData;

  const [selectedModel, setSelectedModel] = useState<string>('');

  // Redirect if no project data
  React.useEffect(() => {
    if (!projectData) {
      navigate('/app/projects/new');
      return;
    }
  }, [projectData, navigate]);

  const updateProjectMutation = useMutation({
    mutationFn: (data: { model_type: string }) =>
      projectsApi.selectModelType(projectData.id, selectedModel as 'basic' | 'medium' | 'advanced'),
    onSuccess: () => {
      toast.success('Model type selected successfully');
      // Navigate to payment page with updated project data
      navigate(`/app/projects/${projectData.id}/payment`, {
        state: { projectData: { ...projectData, model_type: selectedModel } }
      });
    },
    onError: () => {
      toast.error('Failed to update project model type');
    },
  });

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleContinue = () => {
    if (!selectedModel) {
      toast.error('Please select a model type');
      return;
    }
    updateProjectMutation.mutate({ model_type: selectedModel });
  };

  if (!projectData) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 py-10">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/app/projects/new')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Choose AI Model
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Select the AI model that best fits your chatbot's needs
            </p>
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Project: {projectData.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>
              <span className="ml-2 text-gray-900 dark:text-white capitalize">
                {projectData.type?.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Description:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {projectData.description || 'No description'}
              </span>
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Model Options
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose the model complexity based on your requirements and available resources
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {modelOptions.map((model) => {
              const Icon = model.icon;
              const isSelected = selectedModel === model.id;

              return (
                <div
                  key={model.id}
                  className={cn(
                    'relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg',
                    isSelected
                      ? 'border-[#e1802b] bg-[#e1802b]/5 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  onClick={() => handleModelSelect(model.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      'p-3 rounded-lg bg-gradient-to-r',
                      model.color
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      model.complexity === 'Low' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      model.complexity === 'Medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    )}>
                      {model.complexity} Complexity
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {model.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    {model.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Training Time:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{model.trainingTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{model.accuracy}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {model.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-[#e1802b] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!selectedModel || updateProjectMutation.isPending}
            className={cn(
              'px-8 py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 transform',
              selectedModel && !updateProjectMutation.isPending
                ? 'bg-[#e1802b] hover:bg-[#d16f1a] hover:scale-105 shadow-lg'
                : 'bg-[#e1802b]/50 cursor-not-allowed'
            )}
          >
            {updateProjectMutation.isPending ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Updating...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Continue to Next Step
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar - Model Comparison */}
      <div className="lg:w-1/3 h-fit bg-gradient-to-br from-orange-50 to-orange-50 dark:from-orange-900/20 dark:to-orange-900 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-orange-900 dark:text-white mb-2">
              Model Comparison Guide
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
              Choose the right model for your needs:
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <Cpu className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">Basic Model</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Perfect for simple Q&A, basic customer support, or getting started quickly.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Best for: Small businesses, simple use cases, quick deployment
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <Layers className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">Medium Model</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Great for complex conversations, better context understanding, and moderate accuracy needs.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Best for: E-commerce, detailed support, content-rich applications
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">Advanced Model</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Ideal for sophisticated applications requiring high accuracy, complex reasoning, and advanced features.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Best for: Enterprise applications, complex workflows, high-stakes interactions
              </div>
            </div>
          </div>

          <div className="bg-orange-100 dark:bg-orange-900/20 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 dark:text-orange-400 mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-orange-800 dark:text-orange-300">
              Start with a Basic or Medium model if you're new to chatbots. You can always upgrade later as your needs grow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelectionPage;
