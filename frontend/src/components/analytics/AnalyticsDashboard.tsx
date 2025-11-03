import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { systemApi } from '../../api/services/api';
import { Analytics } from '../../types';
import { StatsCard } from './StatsCard';
import { MetricsChart } from './MetricsChart';

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await systemApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard statistics');
      console.error('Error loading dashboard stats:', err);
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
              onClick={loadDashboardStats}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`p-4 ${className}`}>
        <Card className="p-6">
          <p className="text-gray-500">No analytics data available.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Projects"
          value={stats.total_projects}
          icon="📊"
          trend={stats.recent_activity?.projects_created_this_week > 0 ? 'up' : 'stable'}
          subtitle={`${stats.recent_activity?.projects_created_this_week || 0} this week`}
        />
        <StatsCard
          title="Trained Models"
          value={stats.trained_models}
          icon="🤖"
          trend={stats.recent_activity?.projects_trained_this_week > 0 ? 'up' : 'stable'}
          subtitle={`${stats.untrained_models} untrained`}
        />
        <StatsCard
          title="Average Accuracy"
          value={`${stats.average_accuracy}%`}
          icon="🎯"
          trend={stats.performance_summary?.accuracy_trend || 'stable'}
          subtitle={`Best: ${stats.performance_summary?.best_accuracy || 0}%`}
        />
        <StatsCard
          title="Total Intents"
          value={stats.recent_activity?.total_intents || 0}
          icon="💬"
          trend="stable"
          subtitle="Across all projects"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Model Distribution</h3>
          <MetricsChart
            data={Object.entries(stats.model_distribution || {}).map(([key, value]) => ({
              name: key.charAt(0).toUpperCase() + key.slice(1),
              value: value as number
            }))}
            type="pie"
          />
        </Card>

        {/* Training Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Training Status</h3>
          <MetricsChart
            data={Object.entries(stats.training_status_distribution || {}).map(([key, value]) => ({
              name: key.charAt(0).toUpperCase() + key.slice(1),
              value: value as number
            }))}
            type="bar"
          />
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.recent_activity?.projects_created_this_week || 0}
            </div>
            <div className="text-sm text-blue-800">Projects Created This Week</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.recent_activity?.projects_trained_this_week || 0}
            </div>
            <div className="text-sm text-green-800">Models Trained This Week</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.active_projects || 0}
            </div>
            <div className="text-sm text-purple-800">Active Projects</div>
          </div>
        </div>
      </Card>

      {/* System Health */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${
            stats.system_health === 'healthy' ? 'bg-green-500' : 
            stats.system_health === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="capitalize font-medium">{stats.system_health}</span>
          <span className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      </Card>
    </div>
  );
};