import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Trash2,
  Plus,
  Check,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import EmbedCodeGenerator from './EmbedCodeGenerator';
import { widgetApi } from '../../api/services/api';

type Tab = 'basic' | 'appearance' | 'agent' | 'behavior' | 'embed' | 'preview';
type Device = 'desktop' | 'mobile';

interface WidgetConfig {
  bot_name: string;
  greeting_message: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  agent_name: string;
  agent_title: string;
  agent_avatar: string;
  agent_description: string;
  theme_color: string;
  header_color: string;
  text_color: string;
  user_bubble_color: string;
  bot_bubble_color: string;
  background_type: 'solid' | 'gradient' | 'image';
  background_value: string;
  font_family: string;
  font_size: number;
  border_radius: number;
  width: number;
  height: number;
  bubble_style: 'rounded' | 'square' | 'circle';
  auto_open: boolean;
  auto_open_delay: number;
  enable_sound: boolean;
  enable_typing_indicator: boolean;
  show_timestamps: boolean;
  show_branding: boolean;
  typing_delay: number;
  language: string;
  custom_css: string;
  welcome_delay: number;
  session_timeout: number;
  max_messages: number;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  // { code: 'es', name: 'Español', flag: '🇪🇸' },
  // { code: 'fr', name: 'Français', flag: '🇫🇷' },
  // { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  // { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  // { code: 'pt', name: 'Português', flag: '🇵🇹' },
  // { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  // { code: 'ja', name: '日本語', flag: '🇯🇵' },
  // { code: 'ko', name: '한국어', flag: '🇰🇷' },
  // { code: 'zh', name: '中文', flag: '🇨🇳' },
  // { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
  { code: 'as', name: 'অসমীয়া (Assamese)', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو (Urdu)', flag: '🇮🇳' },
  { code: 'sd', name: 'سنڌي (Sindhi)', flag: '🇮🇳' },
  { code: 'ks', name: 'کٲشُر (Kashmiri)', flag: '🇮🇳' },
  { code: 'ne', name: 'नेपाली (Nepali)', flag: '🇮🇳' },
  { code: 'sa', name: 'संस्कृत (Sanskrit)', flag: '🇮🇳' },
  { code: 'ma', name: 'मैथिली (Maithili)', flag: '🇮🇳' },
  { code: 'bho', name: 'भोजपुरी (Bhojpuri)', flag: '🇮🇳' },
  { code: 'doi', name: 'डोगरी (Dogri)', flag: '🇮🇳' },
  { code: 'mni', name: 'মৈতৈলোন্ (Manipuri)', flag: '🇮🇳' },
  { code: 'sant', name: 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)', flag: '🇮🇳' },
  { code: 'kok', name: 'कोंकणी (Konkani)', flag: '🇮🇳' },
];

const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Nunito',
  'Raleway',
  'Ubuntu',
];

const AdvancedWidgetConfigPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();

  // State
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [previewDevice, setPreviewDevice] = useState<Device>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<WidgetConfig>({
    bot_name: 'AI Assistant',
    greeting_message: "Hello! I'm your friendly AI Agent. How can I help you today?",
    position: 'bottom-right',
    agent_name: 'Mira',
    agent_title: 'Client Feedback Specialist',
    agent_avatar: '',
    agent_description: "I'm here to help you with any questions or feedback.",
    theme_color: '#667eea',
    header_color: '#667eea',
    text_color: '#374151',
    user_bubble_color: '#667eea',
    bot_bubble_color: '#F3F4F6',
    background_type: 'gradient',
    background_value: 'linear-gradient(135deg, #000000 0%, #434343 100%)',

    font_family: 'Inter',
    font_size: 14,
    border_radius: 16,
    width: 400,
    height: 600,
    bubble_style: 'rounded',
    auto_open: false,
    auto_open_delay: 1000,
    enable_sound: true,
    enable_typing_indicator: true,
    show_timestamps: true,
    show_branding: true,
    typing_delay: 1500,
    language: 'en',
    custom_css: '',
    welcome_delay: 2000,
    session_timeout: 1800,
    max_messages: 100,
  });

  // Debounced setConfig to prevent excessive re-renders
  const debouncedSetConfig = debounce((newConfig: WidgetConfig) => setConfig(newConfig), 300);

  // Handle file upload for agent avatar
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      debouncedSetConfig({ ...config, agent_avatar: e.target?.result as string });
      toast.success('Agent photo uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  // Auto-save configuration
  const autoSaveConfig = useCallback(
    debounce(async (newConfig: WidgetConfig) => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('No auth token found, skipping auto-save');
          return;
        }

        const response = await fetch(`/api/projects/${projectId}/widget/config`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newConfig),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        console.log('Configuration auto-saved successfully');
      } catch (error) {
        console.error('Failed to auto-save configuration:', error);
        // Don't show toast for auto-save failures to avoid spam
      }
    }, 1000),
    [projectId]
  );

  // Save configuration
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await autoSaveConfig(config);
      toast.success('Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'basic' as Tab, name: 'Basic Settings', icon: Settings },
    { id: 'agent' as Tab, name: 'Agent Profile', icon: User },
    { id: 'appearance' as Tab, name: 'Appearance', icon: Palette },
    { id: 'behavior' as Tab, name: 'Behavior', icon: Zap },
    { id: 'embed' as Tab, name: 'Embed Code', icon: Code },
    // { id: 'preview' as Tab, name: 'Preview', icon: Eye },
  ];
 

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl  ">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to={`/app/projects/${projectId}`}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Back to project"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Advanced Widget Configuration
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Customize your chatbot widget with advanced features
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-[#e1802b] disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
            aria-label="Save configuration"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
                aria-label={`Switch to ${tab.name}`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Settings Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-orange-600" />
                    Basic Configuration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bot Name
                      </label>
                      <input
                        type="text"
                        value={config.bot_name}
                        onChange={(e) =>
                          debouncedSetConfig({ ...config, bot_name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter bot name"
                        aria-label="Bot name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Widget Position
                      </label>
                      {/* <select
                        value={"bottom-right"}
                        onChange={(e) =>
                          debouncedSetConfig({ ...config, position: e.target.value as any })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        aria-label="Widget position"
                      >
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                      </select> */}
                      <select
  value="bottom-right"  // default value
  onChange={() => {}}   // no-op so it won't update state
  disabled              // disable the dropdown
  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
  aria-label="Widget position"
>
  <option value="bottom-right">Bottom Right</option>
  <option value="bottom-left">Bottom Left</option>
  <option value="top-right">Top Right</option>
  <option value="top-left">Top Left</option>
</select>

                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Greeting Message
                    </label>
                    <textarea
                      value={config.greeting_message}
                      onChange={(e) =>
                        debouncedSetConfig({ ...config, greeting_message: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter greeting message"
                      aria-label="Greeting message"
                    />
                  </div>



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

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <Languages className="h-3 w-3 inline mr-2" />
                      Language
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => debouncedSetConfig({ ...config, language: lang.code })}
                          className={` rounded-lg border-2 transition-all text-left ${
                            config.language === lang.code
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                          aria-label={`Select ${lang.name} language`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{lang.flag}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {lang.name}
                              </div>
                              <div className="text-xs text-gray-500">{lang.code}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Profile Tab */}
            {activeTab === 'agent' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <User className="h-5 w-5 mr-2 text-orange-600" />
                    Agent Profile
                  </h3>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Agent Photo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {config.agent_avatar ? (
                          <img
                            src={config.agent_avatar}
                            alt="Agent Avatar"
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <label
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
                          aria-label="Upload agent photo"
                        >
                          <Camera className="h-4 w-4 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Upload a professional photo of your agent. Recommended size: 200x200px
                        </p>
                        {config.agent_avatar && (
                          <button
                            onClick={() => debouncedSetConfig({ ...config, agent_avatar: '' })}
                            className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center"
                            aria-label="Remove agent photo"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        value={config.agent_name}
                        onChange={(e) =>
                          debouncedSetConfig({ ...config, agent_name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Mira"
                        aria-label="Agent name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Agent Title
                      </label>
                      <input
                        type="text"
                        value={config.agent_title}
                        onChange={(e) =>
                          debouncedSetConfig({ ...config, agent_title: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Client Feedback Specialist"
                        aria-label="Agent title"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agent Description
                    </label>
                    <textarea
                      value={config.agent_description}
                      onChange={(e) =>
                        debouncedSetConfig({ ...config, agent_description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of what the agent does"
                      aria-label="Agent description"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-orange-600" />
                    Colors & Theme
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Primary Theme Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={config.theme_color}
                          onChange={(e) =>
                            debouncedSetConfig({ ...config, theme_color: e.target.value })
                          }
                          className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                          aria-label="Primary theme color"
                        />
                        <input
                          type="text"
                          value={config.theme_color}
                          onChange={(e) =>
                            debouncedSetConfig({ ...config, theme_color: e.target.value })
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          aria-label="Primary theme color hex"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Header Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={config.header_color}
                          onChange={(e) =>
                            debouncedSetConfig({ ...config, header_color: e.target.value })
                          }
                          className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                          aria-label="Header color"
                        />
                        <input
                          type="text"
                          value={config.header_color}
                          onChange={(e) =>
                            debouncedSetConfig({ ...config, header_color: e.target.value })
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          aria-label="Header color hex"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Background Style
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { type: 'solid', name: 'Solid Color', preview: config.theme_color },
                        {
                          type: 'gradient',
                          name: 'Gradient',
                          preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        },
                        { type: 'image', name: 'Custom Image', preview: '#f3f4f6' },
                      ].map((bg) => (
                        <button
                          key={bg.type}
                          onClick={() =>
                            debouncedSetConfig({ ...config, background_type: bg.type as any })
                          }
                          className={`p-4 rounded-lg border-2 transition-all ${
                            config.background_type === bg.type
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                          aria-label={`Select ${bg.name} background`}
                        >
                          <div
                            className="w-full h-8 rounded mb-2"
                            style={{ background: bg.preview }}
                          ></div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {bg.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* // Add this code after the header color picker and before the background style section */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      User Bubble Color
    </label>
    <div className="flex items-center space-x-3">
      <input
        type="color"
        value={config.user_bubble_color}
        onChange={(e) =>
          debouncedSetConfig({ ...config, user_bubble_color: e.target.value })
        }
        className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
        aria-label="User bubble color"
      />
      <input
        type="text"
        value={config.user_bubble_color}
        onChange={(e) =>
          debouncedSetConfig({ ...config, user_bubble_color: e.target.value })
        }
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
        aria-label="User bubble color hex"
      />
    </div>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Bot Bubble Color
    </label>
    <div className="flex items-center space-x-3">
      <input
        type="color"
        value={config.bot_bubble_color}
        onChange={(e) =>
          debouncedSetConfig({ ...config, bot_bubble_color: e.target.value })
        }
        className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
        aria-label="Bot bubble color"
      />
      <input
        type="text"
        value={config.bot_bubble_color}
        onChange={(e) =>
          debouncedSetConfig({ ...config, bot_bubble_color: e.target.value })
        }
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        aria-label="Bot bubble color hex"
      />
    </div>
  </div>
</div>
                  

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Font Family
                      </label>
                      <select
                        value={config.font_family}
                        onChange={(e) =>
                          debouncedSetConfig({ ...config, font_family: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        aria-label="Font family"
                      >
                        {FONT_FAMILIES.map((font) => (
                          <option key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Border Radius ({config.border_radius}px)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        value={config.border_radius}
                        onChange={(e) =>
                          debouncedSetConfig({
                            ...config,
                            border_radius: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                        aria-label="Border radius"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Behavior Tab */}
            {activeTab === 'behavior' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-orange-600" />
                    Widget Behavior
                  </h3>

                  <div className="space-y-6">
                    {[
                      {
                        key: 'auto_open',
                        label: 'Auto Open Widget',
                        description: 'Automatically open the widget when page loads in 1 Sec',
                      },

                      {
                        key: 'enable_sound',
                        label: 'Enable Sound Notifications',
                        description: 'Play sound when new messages arrive',
                      },
                      {
                        key: 'enable_typing_indicator',
                        label: 'Show Typing Indicator',
                        description: 'Display typing animation when bot is responding',
                      },
                      {
                        key: 'show_timestamps',
                        label: 'Show Message Timestamps',
                        description: 'Display time for each message',
                      },
                      {
                        key: 'show_branding',
                        label: 'Show Powered By Branding',
                        description: 'Display attribution link',
                      },
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {setting.label}
                            </h4>
                            {config[setting.key as keyof WidgetConfig] && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {setting.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config[setting.key as keyof WidgetConfig] as boolean}
                            onChange={(e) =>
                              debouncedSetConfig({ ...config, [setting.key]: e.target.checked })
                            }
                            className="sr-only peer"
                            aria-label={setting.label}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Embed Code Tab */}
            {activeTab === 'embed' && (
              <EmbedCodeGenerator
                config={config}
                projectId={projectId || ''}
                onSaveConfig={async () => {
                  try {
                    await widgetApi.updateConfig(projectId!, config);
                  } catch (error) {
                    console.warn('Could not save config to backend, using current config:', error);
                  }
                }}
              />
            )}
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-1 min-h-full">
            <div className="sticky top-8 w-ful h-[100%]">
              <div className="bg-white  dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Preview
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-2 rounded-l-lg transition-colors ${
                          previewDevice === 'desktop'
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                        aria-label="Preview on desktop"
                        title="Desktop View"
                      >
                        <Monitor className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-2 rounded-r-lg transition-colors ${
                          previewDevice === 'mobile'
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                        aria-label="Preview on mobile"
                        title="Mobile View"
                      >
                        <Smartphone className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden ${
                    previewDevice === 'desktop'
                      ? 'h-[700px] max-w-[600px] mx-auto'
                      : 'h-[700px] max-w-[360px] mx-auto'
                  }`}
                >
                  <WidgetPreview config={config} device={previewDevice} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Widget Preview Component
const WidgetPreview: React.FC<{ config: WidgetConfig; device: Device }> = React.memo(
  ({ config, device }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState([
      {
        id: 1,
        text: config.greeting_message,
        isBot: true,
        timestamp: new Date(),
        agent: config.agent_name,
      },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

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
        timestamp: new Date(),
        agent: 'You',
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setIsTyping(true);

      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: 'Thank you for your message! This is a preview of how I would respond.',
          isBot: true,
          timestamp: new Date(),
          agent: config.agent_name,
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, config.typing_delay);
    };

    return (
      <div
        className=" w-full h-full relative"
        style={{
          background: config.background_value,
          fontFamily: config.font_family,
        }}
      >
        {/* Sample website content */}
        <div className="p-4">
          <div className="text-center text-white">
            <h2 className="text-lg font-bold mb-2">Your Website</h2>
            <p className="text-sm opacity-90">
              Widget positioned: {config.position.replace('-', ' ')}
            </p>
          </div>
        </div>

        {/* Chat Button */}
        <div className={`absolute ${getPositionClasses()}`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center text-white"
            style={{
              backgroundColor: config.theme_color,
              borderRadius: config.bubble_style === 'circle' ? '50%' : `${config.border_radius}px`,
            }}
            aria-label={isOpen ? 'Close chat widget' : 'Open chat widget'}
          >
            {isOpen ? (
              <div className="w-6 h-6 relative">
                <div className="absolute inset-0 w-6 h-0.5 bg-white transform rotate-45 top-3"></div>
                <div className="absolute inset-0 w-6 h-0.5 bg-white transform -rotate-45 top-3"></div>
              </div>
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Chat Widget */}
        {isOpen && (
          <div
            className={`absolute ${getWidgetPositionClasses()} bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden`}
            style={{
              width: device === 'mobile' ? 'min(90vw, 320px)' : 'min(80vw, 400px)',
              height: device === 'mobile' ? 'min(80vh, 480px)' : 'min(80vh, 600px)',
              borderRadius: `${config.border_radius}px`,
              maxWidth: '100%',
              maxHeight: '90vh',
            }}
            role="dialog"
            aria-labelledby="chat-widget-title"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 text-white"
              style={{
                background: config.header_color,
                borderTopLeftRadius: `${config.border_radius}px`,
                borderTopRightRadius: `${config.border_radius}px`,
              }}
            >
              <div className="flex items-center space-x-3">
                {config.agent_avatar ? (
                  <img
                    src={config.agent_avatar}
                    alt={config.agent_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 id="chat-widget-title" className="font-semibold text-sm">
                    {config.agent_name}
                  </h3>
                  <p className="text-xs opacity-90">{config.agent_title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                aria-label="Close chat widget"
              >
                <div className="w-4 h-4 relative">
                  <div className="absolute inset-0 w-4 h-0.5 bg-white transform rotate-45 top-2"></div>
                  <div className="absolute inset-0 w-4 h-0.5 bg-white transform -rotate-45 top-2"></div>
                </div>
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ fontSize: `${config.font_size}px` }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="max-w-[80%]">
                    <div
                      className={`px-3 py-2 text-sm rounded-lg`}
                      style={{
                        backgroundColor: message.isBot
                          ? config.bot_bubble_color
                          : config.user_bubble_color,
                        color: message.isBot ? config.text_color : 'white',
                        borderRadius: `${config.border_radius}px`,
                      }}
                    >
                      {message.text}
                    </div>
                    {config.show_timestamps && (
                      <div
                        className={`text-xs mt-1 ${
                          message.isBot ? 'text-left' : 'text-right'
                        } opacity-60`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && config.enable_typing_indicator && (
                <div className="flex justify-start">
                  <div
                    className="px-3 py-2 rounded-lg"
                    style={{ backgroundColor: config.bot_bubble_color }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {config.agent_name} is typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <Globe className="h-4 w-4" />
                  <span>
                    {LANGUAGES.find((l) => l.code === config.language)?.flag}{' '}
                    {LANGUAGES.find((l) => l.code === config.language)?.name}
                  </span>
                </div>
                {config.enable_sound && (
                  <Volume2 className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-700 dark:text-white"
                  style={{ fontSize: `${config.font_size}px` }}
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: config.theme_color }}
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Branding */}
            {config.show_branding && (
              <div className="px-4 py-2 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Powered by{' '}
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    JetHat AI
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default AdvancedWidgetConfigPage;