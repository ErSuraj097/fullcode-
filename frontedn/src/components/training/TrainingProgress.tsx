import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Brain, 
  Cpu, 
  Target,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { projectsApi } from '../../api/services/api';

interface TrainingProgressProps {
  projectId: string;
  onTrainingComplete?: (result: any) => void;
  onTrainingError?: (error: string) => void;
}

const TrainingProgress: React.FC<TrainingProgressProps> = ({
  projectId,
  onTrainingComplete,
  onTrainingError
}) => {
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadProgress();
    
    // Poll for progress updates every 2 seconds
    const interval = setInterval(loadProgress, 2000);
    
    return () => clearInterval(interval);
  }, [projectId]);

  const loadProgress = async () => {
    try {
      const progressData = await projectsApi.getTrainingProgress(projectId);
      setProgress(progressData);
      setLastUpdate(new Date());
      
      // Check if training completed
      if (progressData.training_status === 'trained') {
        onTrainingComplete?.(progressData);
      } else if (progressData.training_status === 'error') {
        onTrainingError?.(progressData.error_message || 'Training failed');
      }
      
    } catch (error) {
      console.error('Failed to load training progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModelIcon = (modelType: string) => {
    switch (modelType) {
      case 'basic':
        return <Zap className="h-5 w-5 text-green-600" />;
      case 'medium':
        return <Brain className="h-5 w-5 text-blue-600" />;
      case 'advanced':
        return <Cpu className="h-5 w-5 text-purple-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training':
        return 'bg-blue-100 text-blue-800';
      case 'trained':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'not_trained':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading || !progress) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading training status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getModelIcon(progress.model_type)}
              <CardTitle className="capitalize">
                {progress.model_type} Model Training
              </CardTitle>
            </div>
            <Badge className={getStatusColor(progress.training_status)}>
              {progress.training_status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.progress || 0}%</span>
            </div>
            <Progress value={progress.progress || 0} className="h-2" />
          </div>

          {/* Training Details */}
          {progress.training_status === 'training' && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {progress.current_epoch && progress.total_epochs && (
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>Epoch: {progress.current_epoch}/{progress.total_epochs}</span>
                </div>
              )}
              
              {progress.estimated_time_remaining && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>ETA: {formatTime(progress.estimated_time_remaining)}</span>
                </div>
              )}
              
              {progress.current_loss && (
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-red-600" />
                  <span>Loss: {progress.current_loss.toFixed(4)}</span>
                </div>
              )}
              
              {progress.best_accuracy && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Best Accuracy: {(progress.best_accuracy * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
          )}

          {/* Completion Status */}
          {progress.training_status === 'trained' && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Training Completed Successfully!</p>
                {progress.accuracy && (
                  <p className="text-sm text-green-600">
                    Final Accuracy: {(progress.accuracy * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Status */}
          {progress.training_status === 'error' && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Training Failed</p>
                {progress.error_message && (
                  <p className="text-sm text-red-600">{progress.error_message}</p>
                )}
              </div>
            </div>
          )}

          {/* Status Message */}
          {progress.message && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {progress.message}
            </div>
          )}

          {/* Last Updated */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadProgress}
              className="h-6 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Stats */}
      {(progress.training_status === 'trained' || progress.training_status === 'training') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Training Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-800">Model Type</div>
                <div className="text-blue-600 capitalize">{progress.model_type}</div>
              </div>
              
              {progress.accuracy && (
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="font-semibold text-green-800">Accuracy</div>
                  <div className="text-green-600">{(progress.accuracy * 100).toFixed(1)}%</div>
                </div>
              )}
              
              {progress.training_time && (
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="font-semibold text-orange-800">Training Time</div>
                  <div className="text-orange-600">{formatTime(progress.training_time)}</div>
                </div>
              )}
              
              {progress.num_examples && (
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="font-semibold text-purple-800">Examples</div>
                  <div className="text-purple-600">{progress.num_examples}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrainingProgress;