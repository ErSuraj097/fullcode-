import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Copy,
  Eye,
  Code,
  Palette,
  Settings,
  Monitor,
  Upload,
  Smartphone,
  Download,
  ExternalLink,
  Save,
  RefreshCw,
  User,
  Globe,
  Image as ImageIcon,
  Camera,
  Languages,
  Link as LinkIcon,
  Zap,
  MessageCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { projectsApi, widgetApi } from '../../api/services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { cn } from '../../utils/cn';
import { toast } from 'react-toastify';
import EmbedCodeGenerator from './EmbedCodeGenerator';

type Tab = 'config' | 'embed' | 'preview';
type Device = 'desktop' | 'mobile';

const WidgetConfigPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState<Tab>('config');
  const [previewDevice, setPreviewDevice] = useState<Device>('desktop');
  const [config, setConfig] = useState({
    project_id: projectId || '',
    position: 'bottom-right' as const,
    theme_color: '#f7a35c',
    bot_name: 'JetHat AI Assistant',
    greeting_message: 'Hello! I\'m your JetHat AI assistant. How can I help you today?',
    width: 400,
    height: 600,
    border_radius: 12,
    show_branding: true,
    auto_open: false,
    auto_open_delay: 3000,
    bubble_style: 'rounded' as const,
    animation_style: 'slide' as const,
    font_family: 'Inter',
    font_size: 14,
    enable_sound: true,
    enable_typing_indicator: true,
    max_messages: 100,
    session_timeout: 1800,
    agent_name: 'JetHat Support Agent',
    agent_title: 'AI Assistant',
    agent_avatar: '',
    agent_description: 'I\'m your JetHat AI assistant, here to help you with any questions.',
    show_timestamps: true,
    typing_delay: 1500,
    custom_css: '',
    welcome_delay: 2000,
    minimize_enabled: true,
    header_color: '#f7a35c',
    text_color: '#374151',
    user_bubble_color: '#f7a35c',
    bot_bubble_color: '#F3F4F6',
    language: 'en',
    background_type: 'gradient' as const,
    background_value: 'linear-gradient(135deg, #f7a35c 0%, #e8923d 100%)',
  });
  const [embedCode, setEmbedCode] = useState<any>(null);

  // Fetch project
  const { data: project } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
  });

  // Fetch widget config
  const { data: widgetConfig, isLoading } = useQuery({
    queryKey: ['widget-config', projectId],
    queryFn: () => widgetApi.getConfig(projectId!),
    enabled: !!projectId,
    onSuccess: (data) => {
      setConfig(prev => ({
        ...prev,
        ...data,
        header_color: data.header_color || prev.theme_color,
        user_bubble_color: data.user_bubble_color || prev.theme_color,
      }));
    },
  });

  // Save config mutation
  const saveMutation = useMutation({
    mutationFn: () => widgetApi.updateConfig(projectId!, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-config', projectId] });
      toast.success('Configuration saved successfully');
      generateEmbedCode();
    },
    onError: () => {
      toast.error('Failed to save configuration');
    },
  });

  // Generate embed code
  const generateEmbedCode = async () => {
    try {
      const response = await widgetApi.generateEmbed(projectId!, config);
      setEmbedCode(response);
    } catch (error) {
      toast.error('Failed to generate embed code');
    }
  };

  // Upload icon mutation
  const uploadIconMutation = useMutation({
    mutationFn: (file: File) => widgetApi.uploadIcon(projectId!, file),
    onSuccess: (data) => {
      setConfig(prev => ({ ...prev, agent_avatar: data.icon_url }));
      toast.success('Icon uploaded successfully');
    },
    onError: () => {
      toast.error('Failed to upload icon');
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    uploadIconMutation.mutate(file);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${type} copied to clipboard`),
      () => toast.error(`Failed to copy ${type}`)
    );
  };

  const downloadEmbedCode = () => {
    if (!embedCode) return;

    const content = `<!-- Chatbot Widget Embed Code -->
${embedCode.html}

<script>
${embedCode.javascript}
</script>

<style>
${embedCode.css}
</style>`;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-widget-${projectId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update header_color and user_bubble_color when theme_color changes
  const handleThemeColorChange = (color: string) => {
    setConfig(prev => ({
      ...prev,
      theme_color: color,
      header_color: color,
      user_bubble_color: color,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading widget configuration..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/app/projects/${projectId}`}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Widget Configuration</h1>
              <Link
                to={`/app/projects/${projectId}/widget/advanced`}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <Zap className="h-3 w-3 mr-1" />
                Advanced
              </Link>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{project?.name || 'Unnamed Project'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/app/projects/${projectId}/widget/advanced`}
            className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced Config
          </Link>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <>
                <LoadingSpinner size="xs" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'config' as Tab, name: 'Configuration', icon: Settings },
            { id: 'embed' as Tab, name: 'Embed Code', icon: Code },
            { id: 'preview' as Tab, name: 'Preview', icon: Eye },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              )}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Basic Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bot Name
                  </label>
                  <input
                    type="text"
                    value={config.bot_name}
                    onChange={(e) => setConfig({ ...config, bot_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Greeting Message
                  </label>
                  <textarea
                    value={config.greeting_message}
                    onChange={(e) => setConfig({ ...config, greeting_message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={config.agent_name}
                    onChange={(e) => setConfig({ ...config, agent_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position
                  </label>
                  <select
                    value={config.position}
                    onChange={(e) => setConfig({ ...config, position: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={config.theme_color}
                      onChange={(e) => handleThemeColorChange(e.target.value)}
                      className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.theme_color}
                      onChange={(e) => handleThemeColorChange(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={config.width}
                      onChange={(e) => setConfig({ ...config, width: parseInt(e.target.value) || 400 })}
                      min="300"
                      max="600"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={config.height}
                      onChange={(e) => setConfig({ ...config, height: parseInt(e.target.value) || 600 })}
                      min="400"
                      max="800"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div> */}
                <div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Width (px)
    </label>
    <input
      type="number"
      value={config.width}
      onChange={(e) =>
        setConfig({ ...config, width: parseInt(e.target.value) || 400 })
      }
      min="300"
      max="600"
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                 dark:bg-gray-700 dark:text-white"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Height (px)
    </label>
    <input
      type="number"
      value={config.height}
      onChange={(e) =>
        setConfig({ ...config, height: parseInt(e.target.value) || 600 })
      }
      min="400"
      max="800"
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                 dark:bg-gray-700 dark:text-white"
    />
  </div>
</div>

{/* Reset Button */}
<div className="mt-4">
  <button
    onClick={() => setConfig({ ...config, width: 400, height: 600 })}
    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 
               rounded-lg text-sm font-medium 
               hover:bg-gray-300 dark:hover:bg-gray-500"
  >
    Reset to Default
  </button>
</div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Border Radius ({config.border_radius}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={config.border_radius}
                    onChange={(e) => setConfig({ ...config, border_radius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Behavior */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Behavior</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Open</label>
                  <input
                    type="checkbox"
                    checked={config.auto_open}
                    onChange={(e) => setConfig({ ...config, auto_open: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Branding</label>
                  <input
                    type="checkbox"
                    checked={config.show_branding}
                    onChange={(e) => setConfig({ ...config, show_branding: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Sound</label>
                  <input
                    type="checkbox"
                    checked={config.enable_sound}
                    onChange={(e) => setConfig({ ...config, enable_sound: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Timestamps</label>
                  <input
                    type="checkbox"
                    checked={config.show_timestamps}
                    onChange={(e) => setConfig({ ...config, show_timestamps: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Embed Code Tab */}
        {activeTab === 'embed' && (
          <EmbedCodeGenerator 
            config={config} 
            projectId={projectId || ''}
            onSaveConfig={handleSave}
          />
        )}

        {/* Live Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Preview</h3>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={cn(
                    'p-2 rounded-l-lg',
                    previewDevice === 'desktop'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={cn(
                    'p-2 rounded-r-lg',
                    previewDevice === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className={cn(
              'relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden',
              previewDevice === 'desktop' ? 'h-[700px]' : 'h-[600px] max-w-sm mx-auto'
            )}>
              <WidgetPreview config={config} device={previewDevice} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Widget Preview Component
const WidgetPreview: React.FC<{ config: any; device: Device }> = ({ config, device }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: config.greeting_message, isBot: true, timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');

  const getPositionClasses = () => {
    switch (config.position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getWidgetPositionClasses = () => {
    switch (config.position) {
      case 'bottom-left':
        return 'bottom-20 left-4';
      case 'top-right':
        return 'top-20 right-4';
      case 'top-left':
        return 'top-20 left-4';
      default:
        return 'bottom-20 right-4';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    const botMessage = {
      id: Date.now() + 1,
      text: "This is a preview response. In the actual widget, this would be generated by your trained AI model.",
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInputText('');
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      {/* Sample website content */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Website</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This is how your chatbot widget will appear on your website.
          The widget is positioned in the {config.position.replace('-', ' ')} corner.
        </p>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>

      {/* Chat Button */}
      <div className={`absolute ${getPositionClasses()}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center text-white"
          style={{
            backgroundColor: config.theme_color,
            borderRadius: config.bubble_style === 'circle' ? '50%' : `${config.border_radius}px`
          }}
        >
          {isOpen ? (
            <div className="w-6 h-6 relative">
              <div className="absolute inset-0 w-6 h-0.5 bg-white transform rotate-45 top-3"></div>
              <div className="absolute inset-0 w-6 h-0.5 bg-white transform -rotate-45 top-3"></div>
            </div>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={`absolute ${getWidgetPositionClasses()} bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col`}
          style={{
            width: device === 'mobile' ? '280px' : `${config.width}px`,
            height: device === 'mobile' ? '400px' : `${config.height}px`,
            borderRadius: `${config.border_radius}px`
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 text-white"
            style={{
              backgroundColor: config.theme_color,
              borderTopLeftRadius: `${config.border_radius}px`,
              borderTopRightRadius: `${config.border_radius}px`
            }}
          >
            <div className="flex items-center space-x-2">
              {config.agent_avatar && (
                <img
                  src={config.agent_avatar}
                  alt="Agent"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-medium text-sm">{config.agent_name}</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <div className="w-4 h-4 relative">
                <div className="absolute inset-0 w-4 h-0.5 bg-white transform rotate-45 top-2"></div>
                <div className="absolute inset-0 w-4 h-0.5 bg-white transform -rotate-45 top-2"></div>
              </div>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${message.isBot
                      ? ''
                      : 'text-white'
                    }`}
                  style={
                    message.isBot
                      ? {
                        backgroundColor: config.bot_bubble_color,
                        color: config.text_color,
                        borderRadius: config.bubble_style === 'rounded' ? '12px' : config.bubble_style === 'circle' ? '20px' : '4px'
                      }
                      : {
                        backgroundColor: config.theme_color,
                        borderRadius: config.bubble_style === 'rounded' ? '12px' : config.bubble_style === 'circle' ? '20px' : '4px'
                      }
                  }
                >
                  {message.text}
                  {config.show_timestamps && (
                    <div className={`text-xs mt-1 ${message.isBot ? 'opacity-60' : 'opacity-75'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {config.enable_typing_indicator && (
              <div className="flex justify-start">
                <div
                  className="px-3 py-2 rounded-lg"
                  style={{ backgroundColor: config.bot_bubble_color }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{config.agent_name} is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="p-2 rounded-lg text-white"
                style={{ backgroundColor: config.theme_color }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Branding */}
          {config.show_branding && (
            <div className="px-3 py-2 text-center border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by <span className="jethat-gradient-text font-medium">Suraj</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WidgetConfigPage;