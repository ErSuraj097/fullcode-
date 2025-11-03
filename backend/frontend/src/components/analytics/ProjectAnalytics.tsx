import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { projectsApi } from '../../api/services/api';
import { StatsCard } from './StatsCard';
import { MetricsChart } from './MetricsChart';

interface ProjectAnalyticsProps {
  projectId: string;
  className?: string;
}

export const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProjectAnalytics();
    }
  }, [projectId]);

  const loadProjectAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getAnalytics(projectId);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load project analytics');
      console.error('Error loading project analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="text-red-800">
            <h3 className="font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-sm">{error}</p>
            <button
              onClick={loadProjectAnalytics}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`p-4 ${className}`}>
        <Card className="p-6">
          <p className="text-gray-500">No analytics data available for this project.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Project Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">{analytics.project_name} Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              analytics.training_status === 'trained' ? 'bg-green-100 text-green-800' :
              analytics.training_status === 'training' ? 'bg-yellow-100 text-yellow-800' :
              analytics.training_status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {analytics.training_status}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Model:</span>
            <span className="ml-2 font-medium">{analytics.model_type}</span>
          </div>
          <div>
            <span className="text-gray-600">Accuracy:</span>
            <span className="ml-2 font-medium">{analytics.accuracy}%</span>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2">{new Date(analytics.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Intents"
          value={analytics.total_intents}
          icon="🎯"
          subtitle="Intent categories"
        />
        <StatsCard
          title="Training Patterns"
          value={analytics.total_patterns}
          icon="📝"
          subtitle="Input examples"
        />
        <StatsCard
          title="Responses"
          value={analytics.total_responses}
          icon="💬"
          subtitle="Output variations"
        />
        <StatsCard
          title="Conversations"
          value={analytics.conversations_count}
          icon="🗨️"
          subtitle="Total chats"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Confidence Distribution</h3>
          <MetricsChart
            data={[
              { name: 'High (>80%)', value: analytics.performance_metrics?.confidence_distribution?.high || 0 },
              { name: 'Medium (50-80%)', value: analytics.performance_metrics?.confidence_distribution?.medium || 0 },
              { name: 'Low (<50%)', value: analytics.performance_metrics?.confidence_distribution?.low || 0 }
            ]}
            type="pie"
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
          <MetricsChart
            data={[
              { name: 'Daily', value: analytics.usage_stats?.daily_conversations || 0 },
              { name: 'Weekly', value: analytics.usage_stats?.weekly_conversations || 0 },
              { name: 'Monthly', value: analytics.usage_stats?.monthly_conversations || 0 }
            ]}
            type="bar"
          />
        </Card>
      </div>

      {/* Most Common Intents */}
      {analytics.most_common_intents && analytics.most_common_intents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Most Common Intents</h3>
          <div className="space-y-3">
            {analytics.most_common_intents.map((intent: any, index: number) => (
              <div key={intent.tag} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="font-medium">{intent.tag}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{intent.pattern_count} patterns</span>
                  <span>{intent.response_count} responses</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Performance Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.performance_metrics?.average_response_time || 0}s
            </div>
            <div className="text-sm text-blue-800">Average Response Time</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analytics.accuracy}%
            </div>
            <div className="text-sm text-green-800">Model Accuracy</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.total_intents}
            </div>
            <div className="text-sm text-purple-800">Intent Categories</div>
          </div>
        </div>
      </Card>
    </div>
  );
};