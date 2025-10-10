import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    Users, 
    MessageCircle, 
    Clock,
    Star,
    Calendar,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { cn } from '../../utils/cn';

interface AnalyticsData {
    overview: {
        total_conversations: number;
        total_unique_users: number;
        avg_response_time: number;
        avg_satisfaction: number;
        total_projects: number;
        active_projects: number;
    };
    chart_data: Array<{
        date: string;
        conversations: number;
        unique_users: number;
        satisfaction: number;
        response_time: number;
    }>;
    project_performance: Array<{
        id: string;
        name: string;
        conversations: number;
        satisfaction: number;
        status: string;
        training_status: string;
    }>;
    usage_info: any;
    date_range: {
        start_date: string;
        end_date: string;
        days: number;
    };
}

const COLORS = ['#e1802b', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

const AnalyticsPage: React.FC = () => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState(30);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/analytics/dashboard?days=${dateRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAnalytics(data.analytics);
            } else {
                setError('Failed to load analytics data');
            }
        } catch (err) {
            setError('Failed to load analytics data');
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e1802b]"></div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Analytics Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Track your chatbot performance and user engagement
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#e1802b] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                            <option value={365}>Last year</option>
                        </select>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'overview', name: 'Overview', icon: BarChart3 },
                                { id: 'conversations', name: 'Conversations', icon: MessageCircle },
                                { id: 'projects', name: 'Projects', icon: PieChart },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'flex items-center py-2 px-1 border-b-2 font-medium text-sm',
                                        activeTab === tab.id
                                            ? 'border-[#e1802b] text-[#e1802b]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    )}
                                >
                                    <tab.icon className="h-4 w-4 mr-2" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Total Conversations
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatNumber(analytics.overview.total_conversations)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Unique Users
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatNumber(analytics.overview.total_unique_users)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                        <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Avg Response Time
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {analytics.overview.avg_response_time.toFixed(1)}s
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Satisfaction Score
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {analytics.overview.avg_satisfaction.toFixed(1)}/5
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Conversations Over Time */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Conversations Over Time
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analytics.chart_data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={formatDate}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip 
                                            labelFormatter={(value) => formatDate(value)}
                                            formatter={(value: number) => [formatNumber(value), 'Conversations']}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="conversations" 
                                            stroke="#e1802b" 
                                            strokeWidth={2}
                                            dot={{ fill: '#e1802b', strokeWidth: 2, r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* User Engagement */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    User Engagement
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analytics.chart_data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={formatDate}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip 
                                            labelFormatter={(value) => formatDate(value)}
                                            formatter={(value: number, name: string) => [
                                                name === 'satisfaction' ? value.toFixed(1) : formatNumber(value),
                                                name === 'satisfaction' ? 'Satisfaction' : 'Unique Users'
                                            ]}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="unique_users" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="satisfaction" 
                                            stroke="#8b5cf6" 
                                            strokeWidth={2}
                                            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Conversations Tab */}
                {activeTab === 'conversations' && (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Daily Conversations
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={analytics.chart_data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={formatDate}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        labelFormatter={(value) => formatDate(value)}
                                        formatter={(value: number) => [formatNumber(value), 'Conversations']}
                                    />
                                    <Bar dataKey="conversations" fill="#e1802b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Response Time Trend
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analytics.chart_data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={formatDate}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        labelFormatter={(value) => formatDate(value)}
                                        formatter={(value: number) => [`${value.toFixed(2)}s`, 'Response Time']}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="response_time" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2}
                                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                Project Performance
                            </h3>
                            <div className="space-y-4">
                                {analytics.project_performance.map((project, index) => (
                                    <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div 
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            ></div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {project.name}
                                                </h4>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className={cn(
                                                        'px-2 py-1 rounded-full text-xs',
                                                        project.status === 'active' 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                    )}>
                                                        {project.status}
                                                    </span>
                                                    <span className={cn(
                                                        'px-2 py-1 rounded-full text-xs',
                                                        project.training_status === 'trained' 
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    )}>
                                                        {project.training_status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {formatNumber(project.conversations)}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                conversations
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {project.satisfaction.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;