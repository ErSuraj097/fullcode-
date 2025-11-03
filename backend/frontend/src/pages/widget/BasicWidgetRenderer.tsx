import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Send,
  Minimize2,
  Bot
} from 'lucide-react';

interface WidgetConfig {
  bot_name: string;
  greeting_message: string;
  theme_color: string;
  header_color: string;
  text_color: string;
  user_bubble_color: string;
  bot_bubble_color: string;
  agent_name: string;
  agent_title: string;
  agent_avatar: string;
  agent_description: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  width: number;
  height: number;
  border_radius: number;
  font_family: string;
  font_size: number;
  auto_open: boolean;
  auto_open_delay: number;
  enable_sound: boolean;
  enable_typing_indicator: boolean;
  show_timestamps: boolean;
  show_branding: boolean;
  typing_delay: number;
  language: string;
  background_type: 'solid' | 'gradient' | 'image';
  background_value: string;
  project_id?: string;
  project_name?: string;
  project_type?: string;
  training_status?: string;
  is_trained?: boolean;
}

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  agent?: string;
  feedback?: 'positive' | 'negative' | null;
  showFeedback?: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
];

const BasicWidgetRenderer: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load widget configuration
  useEffect(() => {
    loadWidgetConfig();
  }, [projectId]);

  // Auto-open widget if configured
  useEffect(() => {
    if (config?.auto_open && !isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, config.auto_open_delay);
      return () => clearTimeout(timer);
    }
  }, [config]);

  // Initialize messages with greeting
  useEffect(() => {
    if (config && messages.length === 0) {
      setMessages([{
        id: 1,
        text: config.greeting_message,
        isBot: true,
        timestamp: new Date(),
        agent: config.agent_name
      }]);
    }
  }, [config]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadWidgetConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!projectId) {
        throw new Error('No project ID provided');
      }

      // Create a basic configuration for basic model
      const basicConfig = {
        ...getDefaultConfig(),
        bot_name: "Basic AI Assistant",
        agent_name: 'Basic Support Agent',
        agent_title: 'Basic AI Assistant',
        project_name: 'Basic AI Assistant',
        project_type: 'basic',
        training_status: 'trained',
        is_trained: true,
        project_id: projectId,
        greeting_message: `Hello! I'm your Basic AI assistant. I can help you with simple questions and basic support.`,
        theme_color: '#3B82F6', // Blue theme for basic
        header_color: '#3B82F6',
        user_bubble_color: '#3B82F6',
        width: 350, // Smaller width for basic
        height: 450, // Smaller height for basic
      };

      setConfig(basicConfig);
      setCurrentLanguage(basicConfig.language || 'en');
      setSoundEnabled(basicConfig.enable_sound !== false);

    } catch (error) {
      console.error('Failed to load basic widget config:', error);
      setError('Failed to load widget configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultConfig = (): WidgetConfig => ({
    bot_name: 'Basic AI Assistant',
    greeting_message: 'Hello! How can I help you today?',
    theme_color: '#3B82F6',
    header_color: '#3B82F6',
    text_color: '#374151',
    user_bubble_color: '#3B82F6',
    bot_bubble_color: '#F3F4F6',
    agent_name: 'Basic Support Agent',
    agent_title: 'Basic AI Assistant',
    agent_avatar: '',
    agent_description: 'I\'m here to help you with basic questions.',
    position: 'bottom-right',
    width: 350,
    height: 450,
    border_radius: 12,
    font_family: 'Inter, sans-serif',
    font_size: 14,
    auto_open: false,
    auto_open_delay: 3000,
    enable_sound: true,
    enable_typing_indicator: true,
    show_timestamps: false, // Simplified for basic
    show_branding: true,
    typing_delay: 1000, // Faster for basic
    language: 'en',
    background_type: 'solid',
    background_value: '#3B82F6',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !config) return;

    const messageText = inputText.trim();
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    if (config.enable_typing_indicator) {
      setIsTyping(true);
    }

    try {
      // Send message to the basic bot API
      const response = await fetch(`/api/v1/projects/${projectId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "X-Host-Name": window.location.hostname 
        },
        body: JSON.stringify({
          message: messageText,
          lang: currentLanguage || 'en',
          model_type: 'basic'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setTimeout(() => {
        let botResponseText = data.translated_response || data.response || data.message || 
                             'I received your message. As a basic assistant, I can help with simple questions.';

        const botMessage: Message = {
          id: Date.now() + 1,
          text: botResponseText,
          isBot: true,
          timestamp: new Date(),
          agent: config.agent_name,
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);

      }, config.typing_delay);

    } catch (error) {
      console.error('Basic chat API error:', error);

      setTimeout(() => {
        const errorMsg: Message = {
          id: Date.now() + 1,
          text: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
          isBot: true,
          timestamp: new Date(),
          agent: config.agent_name,
        };

        setMessages(prev => [...prev, errorMsg]);
        setIsTyping(false);
      }, config.typing_delay);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const changeLanguage = (langCode: string) => {
    setCurrentLanguage(langCode);
  };

  const getPositionClasses = () => {
    if (!config) return 'bottom-4 right-4';
    switch (config.position) {
      case 'bottom-left': return 'bottom-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      default: return 'bottom-4 right-4';
    }
  };

  const getWidgetPositionClasses = () => {
    if (!config) return 'bottom-20 right-4';
    switch (config.position) {
      case 'bottom-left': return 'bottom-20 left-4';
      case 'top-right': return 'top-20 right-4';
      case 'top-left': return 'top-20 left-4';
      default: return 'bottom-20 right-4';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Basic Widget...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Basic Widget Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load basic widget configuration'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed z-50" style={{ fontFamily: config?.font_family || 'Inter, sans-serif' }}>
      {/* Chat Widget */}
      <div
        className={`fixed ${getWidgetPositionClasses()} bg-white border border-gray-200 flex flex-col transition-all duration-300 overflow-hidden shadow-lg`}
        style={{
          width: `${config?.width || 350}px`,
          height: isMinimized ? '60px' : `${config?.height || 450}px`,
          borderRadius: `${config?.border_radius || 12}px`,
        }}
      >
        {/* Header - Basic Style */}
        <div
          className="flex items-center justify-between p-3 text-white"
          style={{
            background: config?.header_color || '#3B82F6',
            borderTopLeftRadius: `${config?.border_radius || 12}px`,
            borderTopRightRadius: `${config?.border_radius || 12}px`
          }}
        >
          <div className="flex items-center space-x-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{config?.agent_name || 'Basic Assistant'}</h3>
              <p className="text-xs opacity-90 truncate">Basic Support</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Simple Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-white/20 border-none rounded px-1 py-0.5 text-xs text-white cursor-pointer"
              title="Language"
            >
              {LANGUAGES.slice(0, 4).map((lang) => (
                <option key={lang.code} value={lang.code} className="text-black">
                  {lang.flag}
                </option>
              ))}
            </select>

            <button
              onClick={toggleMinimize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Messages Container - Basic Style */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.isBot ? '' : 'text-white'
                    }`}
                    style={
                      message.isBot
                        ? {
                            backgroundColor: config.bot_bubble_color,
                            color: config.text_color,
                            borderRadius: '12px'
                          }
                        : {
                            backgroundColor: config.theme_color,
                            borderRadius: '12px'
                          }
                    }
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {/* Simple Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-lg bg-gray-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Basic Style */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: config.theme_color }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BasicWidgetRenderer;