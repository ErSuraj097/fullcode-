import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Bot, 
  Brain, 
  TrendingUp, 
  Activity, 
  Users, 
  MessageCircle,
  Calendar,
  Zap,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { projectsApi, systemApi, feedbackApi } from '../../api/services/api';
import { useAuth } from '../../providers/AuthProvider';
import { LoadingSpinner, SectionLoader } from '../../components/common/LoadingSpinner';
import { cn } from '../../utils/cn';
import Navbar from '../../components/layout/Navbar';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  });

  // Fetch system health
  const { data: systemHealth } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: systemApi.getHealth,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch feedback stats
  const { data: feedbackStats, isLoading: feedbackStatsLoading } = useQuery({
    queryKey: ['feedbackStats'],
    queryFn: () => feedbackApi.getStats(),
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    const trainedProjects = projects.filter(p => p.training_status === 'trained');
    const averageAccuracy = trainedProjects.length > 0
      ? trainedProjects.reduce((sum, p) => sum + (p.accuracy || 0), 0) / trainedProjects.length
      : 0;

    return {
      totalProjects: projects.length,
      trainedModels: trainedProjects.length,
      averageAccuracy: Math.round(averageAccuracy * 100),
      systemHealth: systemHealth?.status || 'unknown',
      feedbackStats: feedbackStats || {
        total_feedback: 0,
        avg_rating: 0,
        corrections_count: 0,
      },
      feedbackStatsLoading,
    };
  }, [projects, systemHealth, feedbackStats, feedbackStatsLoading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trained': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'training': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'basic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-8 ">


      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.welcome', { name: user?.name })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
        {/* <Link
          to="/app/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('projects.newProject')}
        </Link> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.totalProjects')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalProjects}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.trainedModels')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.trainedModels}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.avgAccuracy') || '9000%'}
                {/* {t('dashboard.avgAccuracy')?' (9000%)' : '9000'} */}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.averageAccuracy}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.systemStatus')}
              </p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400 capitalize">
                {stats.systemHealth}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.recentProjects')}
            </h2>
            <Link 
              to="/app/projects" 
              className="text-[#e1802be0] dark:text-[#e1802be0] hover:text-[#e1802be0] text-sm font-medium flex items-center"
            >
              {t('View All')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {projectsLoading ? (
          <SectionLoader />
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <Bot className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {t('dashboard.noProjects')}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.noProjectsDesc')}
            </p>
            <div className="mt-6">
              <Link
                to="/app/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#e1802be0] hover:bg-[#e1802be0]/50 dark:bg-[#e1802be0] dark:hover:bg-[#e1802be0]/50"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('dashboard.createFirst')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    <Link
                      to={`/app/projects/${project.id}/${project.model_type}-project`}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {project.name}
                    </Link>
                      </h3>
                      {/* <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(project.training_status)
                      )}>
                        {project.training_status}
                      </span> */}
                      {project.model_type && (
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getModelTypeColor(project.model_type)
                        )}>
                          {project.model_type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {project.description || t('common.noDescription')}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      {project.accuracy && (
                        <span className="flex items-center">
                          <Zap className="h-3 w-3 mr-1" />
                          {Math.round(project.accuracy * 100)}% accuracy
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                   
                    <Link
                      to={`/app/projects/${project.id}/${project.model_type}-project`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-[#e1802be0] hover:bg-[#e1802be0]
                       dark:bg-[#e1802be0] dark:hover:bg-#e1802be0-600"
                    >
                      {t('common.manage')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/app/projects/new"
          className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {t('projects.newProject')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create a new chatbot
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/app/projects"
          className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                View Analytics
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Check project performance
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/app/settings"
          className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Team Settings
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage your account
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Feedback Stats Section */}
    
    </div>
  );
};

export default DashboardPage;
