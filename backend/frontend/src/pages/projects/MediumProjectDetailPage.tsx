import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Brain,
  MessageCircle,
  Settings,
  Upload,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Download,
  FileText,
  Zap,
  Target,
  TrendingUp,
  BookOpen,
  Copy,
  X,
} from 'lucide-react';
import { projectsApi, intentsApi } from '../../api/services/api';
import { LoadingSpinner, SectionLoader } from '../../components/common/LoadingSpinner';
import { cn } from '../../utils/cn';
import { toast } from 'react-toastify';
import { useAuth } from '../../providers/AuthProvider';
import { ProjectAnalytics } from '../../components/analytics/ProjectAnalytics';

import TestChat from '../chat/ChatPage';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'intents' | 'training' | 'analytics' | 'feedback'>('overview');
  const [showIntentForm, setShowIntentForm] = useState(false);
  const [editingIntent, setEditingIntent] = useState<any>(null);
  const [newIntent, setNewIntent] = useState({
    tag: '',
    patterns: [''],
    responses: ['']
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTestChat, setShowTestChat] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
  });

  // Fetch intents
  const { data: intentsData, isLoading: intentsLoading } = useQuery({
    queryKey: ['intents', projectId],
    queryFn: () => intentsApi.getAll(projectId!),
    enabled: !!projectId,
  });

  const intents = intentsData?.intents || [];

  // Helper function for model display names
  const getModelDisplayName = (modelType: string) => {
    if (!modelType) return 'N/A';
    switch (modelType) {
      case 'basic': return 'Basic (Neural Network)';
      case 'medium': return 'Medium (BERT)';
      case 'advanced': return 'Advanced (RoBERTa)';
      case 'transformer_basic': return 'Basic (Neural Network)';
      case 'transformer_medium': return 'Medium (BERT)';
      case 'transformer_advanced': return 'Advanced (RoBERTa)';
      case 'transformer_large': return 'Large (Transformer)';
      default: return modelType.charAt(0).toUpperCase() + modelType.slice(1);
    }
  };

  // Training mutation
  const trainMutation = useMutation({
    mutationFn: () => projectsApi.train(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      toast.success(t('success.trained'));
    },
    onError: () => {
      toast.error(t('error.training'));
    },
  });

  if (projectLoading) {
    return <SectionLoader text="Loading project..." />;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/app/projects"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>


          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {project.description || 'No description'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTestChat(true)}
            className="flex py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Test Chat
          </button>
          {[
            { id: 'analytics', name: 'Analytics', icon: TrendingUp },
            { id: 'feedback', name: 'Feedback', icon: MessageCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'analytics') {
                  setShowAnalytics(true);
                }
                if (tab.id === 'feedback') {
                  setShowFeedback(true);
                }
              }}
              className={cn(
                'flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              )}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}

        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'intents', name: 'Upload Data - Intents', icon: Target },
            { id: 'training', name: 'Training - Model', icon: Brain },

          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              )}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
          <Link
            to={`/app/projects/${projectId}/widget/medium`}
            className="inline-flex items-center px-1 py-2 border-b-2 font-medium text-sm transition-colors "
          >
            <Settings className="h-4 w-4 mr-2" />
            Widget Setting
          </Link>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <ProjectOverview project={project} intents={intents} />
      )}

      {activeTab === 'intents' && (
        <IntentsManagement
          projectId={projectId!}
          intents={intents}
          isLoading={intentsLoading}
        />
      )}

      {activeTab === 'training' && (
        <TrainingSection
          project={project}
          intents={intents}
          onTrain={() => trainMutation.mutate()}
          isTraining={trainMutation.isPending}
        />
      )}

      {/* Analytics Popup */}
      <SidebarPopup
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        title="Analytics"
      >
        <AnalyticsSection project={project} />
      </SidebarPopup>

      {/* Test Chat Popup */}
      <SidebarPopup
        isOpen={showTestChat}
        onClose={() => setShowTestChat(false)}
        title="Test Chat"
      >
        <TestChat /> {/* Adjust props as needed for your TestChat component */}
      </SidebarPopup>

      {/* Feedback Popup */}
      <SidebarPopup
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        title="Feedback"
      >
        <FeedbackSection projectId={projectId!} />
      </SidebarPopup>

    </div>
  );
};

// Reusable Sidebar Popup Component
const SidebarPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  return (
    <div
      className={cn(
        'fixed top-0 right-0 h-full w-1/2 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          Close
        </button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
        {children}
      </div>
    </div>
  );
};

// Project Overview Component
const ProjectOverview: React.FC<{ project: any; intents: any[] }> = ({ project, intents }) => {
  const getTrainingStatusIcon = () => {
    switch (project.training_status) {
      case 'trained': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'training': return <Clock className="h-5 w-5 text-yellow-600 animate-spin" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getModelTypeIcon = (modelType: string) => {
    switch (modelType) {
      case 'basic':
      case 'transformer_basic':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'medium':
      case 'transformer_medium':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'advanced':
      case 'transformer_large':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getModelDisplayName = (modelType: string) => {
    if (!modelType) return 'N/A';
    switch (modelType) {
      case 'basic': return 'Basic (Neural Network)';
      case 'medium': return 'Medium (BERT)';
      case 'advanced': return 'Advanced (RoBERTa)';
      case 'transformer_basic': return 'Basic (Neural Network)';
      case 'transformer_medium': return 'Medium (BERT)';
      case 'transformer_advanced': return 'Advanced (RoBERTa)';
      case 'transformer_large': return 'Large (Transformer)';
      default: return modelType.charAt(0).toUpperCase() + modelType.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            {getTrainingStatusIcon()}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Training Status</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {project.training_status}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Model Type</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {getModelDisplayName(project.model_type || 'basic')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {project.accuracy ? `${Math.round(project.accuracy * 100)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Information</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Type</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
              {project.type.replace('_', ' ')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {new Date(project.created_at).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {new Date(project.updated_at).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Intents</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {intents.length}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

// Intents Management Component
const IntentsManagement: React.FC<{
  projectId: string;
  intents: any[];
  isLoading: boolean;
}> = ({ projectId, intents, isLoading }) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [editingIntent, setEditingIntent] = useState<any>(null);
  const [newIntent, setNewIntent] = useState({
    tag: '',
    patterns: [''],
    responses: ['']
  });
  const [isDragActive, setIsDragActive] = useState(false);

  // Add intent mutation
  const addMutation = useMutation({
    mutationFn: (intent: any) => intentsApi.create(projectId, intent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intents', projectId] });
      toast.success('Intent added successfully');
      setShowForm(false);
      setNewIntent({ tag: '', patterns: [''], responses: [''] });
    },
  });

  // Delete intent mutation
  const deleteMutation = useMutation({
    mutationFn: (tag: string) => intentsApi.delete(projectId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intents', projectId] });
      toast.success('Intent deleted successfully');
    },
  });

  const handleAddIntent = () => {
    if (!newIntent.tag || !newIntent.patterns[0] || !newIntent.responses[0]) {
      toast.error('Please fill in all fields');
      return;
    }
    addMutation.mutate(newIntent);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await intentsApi.upload(projectId, file);
      queryClient.invalidateQueries({ queryKey: ['intents', projectId] });
      toast.success('Intents uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload intents');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    try {
      await intentsApi.upload(projectId, file);
      queryClient.invalidateQueries({ queryKey: ['intents', projectId] });
      toast.success('Intents uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload intents');
    }
  };

  const downloadExampleFile = (format: 'json' | 'csv') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'json') {
      content = JSON.stringify({
        intents: [
          {
            tag: "greeting",
            patterns: ["hello", "hi", "hey", "good morning"],
            responses: ["Hello! How can I help you?", "Hi there!", "Hey! What can I do for you?"]
          },
          {
            tag: "goodbye",
            patterns: ["bye", "goodbye", "see you later"],
            responses: ["Goodbye!", "See you later!", "Have a great day!"]
          },
          {
            tag: "business_hours",
            patterns: ["what are your hours", "when are you open", "what time do you close"],
            responses: ["We're open Monday to Friday 9 AM to 6 PM", "Our hours are 9-6 weekdays, 10-4 weekends"]
          }
        ]
      }, null, 2);
      filename = 'example_intents.json';
      mimeType = 'application/json';
    } else if (format === 'csv') {
      content = `tag,patterns,responses
greeting,"hello|hi|hey|good morning","Hello! How can I help you?|Hi there!|Hey! What can I do for you?"
goodbye,"bye|goodbye|see you later","Goodbye!|See you later!|Have a great day!"
business_hours,"what are your hours|when are you open","We're open Monday to Friday 9 AM to 6 PM|Our hours are 9-6 weekdays"`;
      filename = 'example_intents.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${filename}`);
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  return (
    <div className="space-y-6 ">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upload Section */}
        <div className="space-y-6">
          <div className="bg-white h-full dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Upload Data & Intents
            </h3>

            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className={`mx-auto h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {isDragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  or click to browse
                </p>
              </div>
              <input
                type="file"
                accept=".json,.csv,.txt,.xlsx,.xls,.docx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </label>
            </div>

            {/* Supported Formats */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Supported formats:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">JSON</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">CSV</span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs rounded">TXT</span>
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 text-xs rounded">Excel</span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs rounded">Word</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400 text-xs rounded">PDF</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => setShowExampleModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Examples
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[#e1802b] hover:bg-[#e1802b]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Intent
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Uploaded Data Display */}
        <div className="space-y-6">
          <div className="bg-white  dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Uploaded Data ({intents.length} intents)
            </h3>

            {/* Intents List */}
            {intents.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No intents</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add intents to train your chatbot how to respond to user inputs.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {intents.map((intent) => (
                  <div key={intent.tag} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          {intent.tag}
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Patterns:</p>
                            <div className="flex flex-wrap gap-1">
                              {intent.patterns.map((pattern: string, index: number) => (
                                <span key={index} className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                                  {pattern}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Responses:</p>
                            <div className="flex flex-wrap gap-1">
                              {intent.responses.map((response: string, index: number) => (
                                <span key={index} className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                                  {response}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingIntent(intent)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit intent"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(intent.tag)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete intent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Intent Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Intent
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intent Tag
                </label>
                <input
                  type="text"
                  value={newIntent.tag}
                  onChange={(e) => setNewIntent({ ...newIntent, tag: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., greeting, help, goodbye"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patterns
                </label>
                {newIntent.patterns.map((pattern, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => {
                        const patterns = [...newIntent.patterns];
                        patterns[index] = e.target.value;
                        setNewIntent({ ...newIntent, patterns });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="User input example"
                    />
                    {newIntent.patterns.length > 1 && (
                      <button
                        onClick={() => {
                          const patterns = newIntent.patterns.filter((_, i) => i !== index);
                          setNewIntent({ ...newIntent, patterns });
                        }}
                        className="px-2 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewIntent({ ...newIntent, patterns: [...newIntent.patterns, ''] })}
                  className="text-sm text-orange-600 hover:text-orange-800"
                >
                  + Add Pattern
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Responses
                </label>
                {newIntent.responses.map((response, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={response}
                      onChange={(e) => {
                        const responses = [...newIntent.responses];
                        responses[index] = e.target.value;
                        setNewIntent({ ...newIntent, responses });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Bot response"
                    />
                    {newIntent.responses.length > 1 && (
                      <button
                        onClick={() => {
                          const responses = newIntent.responses.filter((_, i) => i !== index);
                          setNewIntent({ ...newIntent, responses });
                        }}
                        className="px-2 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewIntent({ ...newIntent, responses: [...newIntent.responses, ''] })}
                  className="text-sm text-orange-600 hover:text-orange-800"
                >
                  + Add Response
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddIntent}
                  disabled={addMutation.isPending}
                  className="px-4 py-2 bg-[#e1802b] text-white rounded-lg hover:bg-[#e1802b] disabled:opacity-50"
                >
                  {addMutation.isPending ? <LoadingSpinner size="xs" /> : 'Add Intent'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Example Modal */}
      {showExampleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Data Format Examples
              </h2>
              <button
                onClick={() => setShowExampleModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* JSON Example */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    JSON Format (Recommended)
                  </h3>
                  <button
                    onClick={() => downloadExampleFile('json')}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 relative">
                  <button
                    onClick={() => {
                      const jsonExample = `{
  "intents": [
    {
      "tag": "greeting",
      "patterns": [
        "hello",
        "hi",
        "hey",
        "good morning"
      ],
      "responses": [
        "Hello! How can I help you?",
        "Hi there!",
        "Hey! What can I do for you?"
      ]
    },
    {
      "tag": "goodbye",
      "patterns": [
        "bye",
        "goodbye",
        "see you later"
      ],
      "responses": [
        "Goodbye!",
        "See you later!",
        "Have a great day!"
      ]
    }
  ]
}`;
                      navigator.clipboard.writeText(jsonExample);
                      toast.success('JSON example copied to clipboard!');
                    }}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                    {`{
  "intents": [
    {
      "tag": "greeting",
      "patterns": [
        "hello",
        "hi", 
        "hey",
        "good morning"
      ],
      "responses": [
        "Hello! How can I help you?",
        "Hi there!",
        "Hey! What can I do for you?"
      ]
    },
    {
      "tag": "goodbye",
      "patterns": [
        "bye",
        "goodbye",
        "see you later"
      ],
      "responses": [
        "Goodbye!",
        "See you later!",
        "Have a great day!"
      ]
    }
  ]
}`}
                  </pre>
                </div>
              </div>

              {/* CSV Example */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    CSV Format
                  </h3>
                  <button
                    onClick={() => downloadExampleFile('csv')}
                    className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 relative">
                  <button
                    onClick={() => {
                      const csvExample = `tag,patterns,responses
greeting,"hello|hi|hey|good morning","Hello! How can I help you?|Hi there!|Hey! What can I do for you?"
goodbye,"bye|goodbye|see you later","Goodbye!|See you later!|Have a great day!"
business_hours,"what are your hours|when are you open","We're open Monday to Friday 9 AM to 6 PM|Our hours are 9-6 weekdays"`;
                      navigator.clipboard.writeText(csvExample);
                      toast.success('CSV example copied to clipboard!');
                    }}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                    {`tag,patterns,responses
greeting,"hello|hi|hey|good morning","Hello! How can I help you?|Hi there!|Hey! What can I do for you?"
goodbye,"bye|goodbye|see you later","Goodbye!|See you later!|Have a great day!"
business_hours,"what are your hours|when are you open","We're open Monday to Friday 9 AM to 6 PM|Our hours are 9-6 weekdays"`}
                  </pre>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Use the pipe symbol (|) to separate multiple patterns or responses within a cell.
                </p>
              </div>

              {/* Text Example */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Text Format
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 relative">
                  <button
                    onClick={() => {
                      const txtExample = `TAG: greeting
PATTERN: hello
PATTERN: hi
PATTERN: hey
RESPONSE: Hello! How can I help you?
RESPONSE: Hi there!

TAG: goodbye
PATTERN: bye
PATTERN: goodbye
RESPONSE: Goodbye!
RESPONSE: See you later!`;
                      navigator.clipboard.writeText(txtExample);
                      toast.success('Text example copied to clipboard!');
                    }}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                    {`TAG: greeting
PATTERN: hello
PATTERN: hi
PATTERN: hey
RESPONSE: Hello! How can I help you?
RESPONSE: Hi there!

TAG: goodbye
PATTERN: bye
PATTERN: goodbye
RESPONSE: Goodbye!
RESPONSE: See you later!`}
                  </pre>
                </div>
              </div>

              {/* Supported Formats */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Supported File Formats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-400">JSON (.json)</span>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-400">CSV (.csv)</span>
                  </div>
                  <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-400">Text (.txt)</span>
                  </div>
                  <div className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-400">Excel (.xlsx)</span>
                  </div>
                  <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <FileText className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-400">Word (.docx)</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-400">PDF (.pdf)</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">How to Upload:</h4>
                <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>1. Create your data file in any supported format</li>
                  <li>2. Click the "Upload File" button above</li>
                  <li>3. Select your file - the system will automatically process it</li>
                  <li>4. Review the imported intents in the interface</li>
                  <li>5. Train your model after uploading data</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Training Section Component
const TrainingSection: React.FC<{
  project: any;
  intents: any[];
  onTrain: () => void;
  isTraining: boolean;
}> = ({ project, intents, onTrain, isTraining }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const [selectedModel, setSelectedModel] = useState('medium');
  const [autoCorrectData, setAutoCorrectData] = useState(true);
  const [availableModels, setAvailableModels] = useState<any>({});
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [isTrainings, setIsTraining] = useState(false);
  const [isLegacyTraining, setIsLegacyTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [legacyTrainingStatus, setLegacyTrainingStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const apiPort = import.meta.env.VITE_API_PORT || '8000';
  const base_url = import.meta.env.VITE_API_BASE_URL || `http://localhost:${apiPort}`;

  // Training functions for this component
  const handleTraining = async (isLegacy = false) => {
    if (isLegacy) {
      setIsLegacyTraining(true);
      setLegacyTrainingStatus('idle');
    } else {
      setIsTraining(true);
      setTrainingStatus('idle');
    }

    try {
      if (isLegacy) {
        // Legacy training logic
        let response = await fetch(`/api/v1/projects/${projectId}/train`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (response.status === 401 || response.status === 403) {
          response = await fetch(`/api/v1/public/projects/${projectId}/train`, {
            method: 'POST'
          });
        }

        if (response.ok) {
          const result = await response.json();
          setLegacyTrainingStatus('success');
          toast.success('Legacy model trained successfully!');
          if (result.accuracy) {
            toast.info(`Training completed with ${(result.accuracy * 100).toFixed(1)}% accuracy`);
          }
        } else {
          throw new Error('Legacy training failed');
        }
      } else {
        // Transformer training logic
        await handleTransformerTrain();
        setTrainingStatus('success');
      }

      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    } catch (error) {
      if (isLegacy) {
        setLegacyTrainingStatus('error');
        toast.error('Legacy training failed. Please try again.');
      } else {
        setTrainingStatus('error');
      }
    } finally {
      if (isLegacy) {
        setIsLegacyTraining(false);
      } else {
        setIsTraining(false);
      }
    }
  };

  const handleTransformerTrain = async () => {
    try {
      // Use model-specific endpoints
      const modelEndpoints = {
        'basic': 'train/basic',
        'medium': 'train/medium',
        'advanced': 'train/advanced'
      };

      const modelEndpoint = modelEndpoints[selectedModel as keyof typeof modelEndpoints] || 'train/basic';

      // Try authenticated endpoint first
      let response;
      let endpoint = `${base_url}/api/v1/projects/${projectId}/${modelEndpoint}`;
      let headers: any = {
        'Content-Type': 'application/json'
      };

      // Get token from localStorage as fallback
      const authToken = token || localStorage.getItem('auth_token');
      console.log('Training request - Token available:', !!authToken);
      console.log('Training request - Endpoint:', endpoint);
      console.log('Training request - Model:', selectedModel);

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          auto_correct_data: autoCorrectData
        })
      });

      // If authentication fails, try fallback to old endpoint for compatibility
      if (response.status === 401 || response.status === 403) {
        console.log('Authentication failed, trying fallback endpoint...');
        console.log('Auth response status:', response.status);

        endpoint = `${base_url}/api/v1/projects/${projectId}/train-transformer`;
        console.log('Fallback endpoint:', endpoint);

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model_type: selectedModel,
            auto_correct_data: autoCorrectData
          })
        });

        console.log('Fallback endpoint response status:', response.status);
      }

      if (response.ok) {
        const result = await response.json();
        const modelDisplayName = selectedModel ? selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1) : 'Model';
        const technology = {
          'basic': 'Neural Network',
          'medium': 'BERT',
          'advanced': 'RoBERTa'
        }[selectedModel as string] || 'Unknown';

        toast.success(`${modelDisplayName} model (${technology}) trained successfully!`);

        if (result.training_time && result.accuracy) {
          toast.info(`Training completed in ${result.training_time.toFixed(1)}s with ${(result.accuracy * 100).toFixed(1)}% accuracy`);
        }

        // Refresh project data
        queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
        queryClient.invalidateQueries({ queryKey: ['intents', projectId] });
      } else {
        const error = await response.json();
        console.error('Training error:', error);
        toast.error(`Training failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Training request failed:', error);
      toast.error('Training failed. Please check your connection and try again.');
    }
  };

  React.useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${base_url}/api/v1/models/available`);
        const data = await response.json();
        setAvailableModels(data.models);
        setSelectedModel(data.default);
      } catch (error) {
        console.error('Failed to fetch available models:', error);
      }
    };
    fetchModels();
  }, []);


  return (
    <div className="space-y-6 ">
      {isTrainings ? (
        <>
          <LoadingSpinner size="lg" />

        </>
      ) : (
        <>

        </>
      )}
      {/* Model Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Model Selection</h2>
          <button
            onClick={() => setShowModelDetails(!showModelDetails)}
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            {showModelDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(availableModels).map(([key, model]: [string, any]) => (
            <div
              key={key}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedModel === key
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setSelectedModel(key)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                  {model.name}
                </h3>
                <div className={`px-2 py-1 rounded text-xs font-medium ${model.complexity === 'Low' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  model.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                  {model.complexity}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {model.description}
              </p>
              {showModelDetails && (
                <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                  <div>Training: {model.training_time}</div>
                  <div>Accuracy: {model.accuracy_range}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Training Options */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Training Options</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoCorrectData}
              onChange={(e) => setAutoCorrectData(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Auto-correct and clean training data
            </span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Automatically fix common issues in your training data for better results
          </p>
        </div>

        {/* Training Buttons */}
        {/* Training Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => handleTraining(false)}
            disabled={isTrainings || isLegacyTraining || intents.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTrainings ? (
              <>
                <LoadingSpinner size="xs" />
                <span className="ml-2">Training {selectedModel || 'model'}...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Train {selectedModel ? selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1) : 'Model'}
              </>
            )}
          </button>

          <button
            onClick={() => handleTraining(true)}
            disabled={isTraining || isLegacyTraining || intents.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLegacyTraining ? (
              <>
                <LoadingSpinner size="xs" />
                <span className="ml-2">Legacy Training...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Legacy Training
              </>
            )}
          </button>
        </div>

        {/* Success Messages */}
        {trainingStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Model trained successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {legacyTrainingStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Legacy model trained successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          Choose an AI model that fits your needs. Higher complexity models provide better accuracy but take longer to train.
        </p>

        {/* Training Status Display */}
        {project.training_status === 'trained' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Model trained successfully!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Accuracy: {Math.round((project.accuracy || 0) * 100)}% | Type: {
                    project.model_type === 'basic' ? 'Basic (Neural Network)' :
                      project.model_type === 'medium' ? 'Medium (BERT)' :
                        project.model_type === 'advanced' ? 'Advanced (RoBERTa)' :
                          project.model_type === 'transformer_basic' ? 'Basic (Neural Network)' :
                            project.model_type === 'transformer_medium' ? 'Medium (BERT)' :
                              project.model_type === 'transformer_advanced' ? 'Advanced (RoBERTa)' :
                                (project.model_type || 'basic').charAt(0).toUpperCase() + (project.model_type || 'basic').slice(1)
                  }
                  {project.training_time && ` | Training Time: ${Math.round(project.training_time)}s`}
                </p>
              </div>
            </div>
          </div>
        )}

        {project.training_status === 'auto_training' && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  Auto-training in progress...
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your model is being trained automatically with the current intents.
                </p>
              </div>
            </div>
          </div>
        )}

        {project.training_status === 'not_trained' && intents.length >= 2 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center">
              <div className="h-5 w-5 text-yellow-600 dark:text-yellow-400">⚠️</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Ready for training!
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You have {intents.length} intents. Click "Train Model" to start training.
                </p>
              </div>
            </div>
          </div>
        )}

        {project.training_status === 'not_trained' && intents.length < 2 && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="flex items-center">
              <div className="h-5 w-5 text-gray-600 dark:text-gray-400">ℹ️</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-400">
                  Add more intents to start training
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You need at least 2 intents to train a model. Current: {intents.length}
                </p>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

// Analytics Section Component
const AnalyticsSection: React.FC<{ project: any }> = ({ project }) => {
  return (
    <div className="space-y-6">
      <ProjectAnalytics projectId={project.id} />
    </div>
  );
};

import { feedbackApi } from '../../api/services/api';

const FeedbackSection: React.FC<{ projectId: string }> = ({ projectId }) => {
  // Fetch feedback for this project
  const { data: feedbackList, isLoading: feedbackLoading } = useQuery({
    queryKey: ['feedback', projectId],
    queryFn: () => feedbackApi.getForProject(projectId),
  });

  if (feedbackLoading) {
    return <SectionLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Feedback ({feedbackList?.length || 0})
        </h3>

        {feedbackList && feedbackList.length > 0 ? (
          <div className="space-y-4">
            {feedbackList.map((feedback: any) => (
              <div key={feedback.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Type: {feedback.feedback_type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(feedback.timestamp * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">User Message:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      {feedback.user_message}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bot Response:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      {feedback.bot_response}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">User Feedback Text</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      {feedback.correction || 'N/A'}
                    </p>
                  </div>
                </div>

                {feedback.intent && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Intent Detected:
                    </p>
                    <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                      {feedback.intent}
                    </span>
                  </div>
                )}

                {feedback.rating && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Rating:
                    </p>
                    <span className="inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs rounded">
                      {feedback.rating}/5
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No feedback yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Feedback from users will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
