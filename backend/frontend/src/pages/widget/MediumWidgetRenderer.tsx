import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Send,
  Minimize2,
  Volume2,
  VolumeX,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Settings
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
  rating?: number;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
];

const MediumWidgetRenderer: React.FC = () => {
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
  const [showSettings, setShowSettings] = useState(false);

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

      // Create a medium configuration
      const mediumConfig = {
        ...getDefaultConfig(),
        bot_name: "Medium AI Assistant",
        agent_name: 'Medium Support Agent',
        agent_title: 'Medium AI Assistant',
        project_name: 'Medium AI Assistant',
        project_type: 'medium',
        training_status: 'trained',
        is_trained: true,
        project_id: projectId,
        greeting_message: `Hello! I'm your Medium AI assistant. I can help you with detailed questions, provide feedback options, and support multiple languages.`,
        theme_color: '#10B981', // Green theme for medium
        header_color: '#10B981',
        user_bubble_color: '#10B981',
        width: 400, // Standard width for medium
        height: 550, // Standard height for medium
      };

      setConfig(mediumConfig);
      setCurrentLanguage(mediumConfig.language || 'en');
      setSoundEnabled(mediumConfig.enable_sound !== false);

    } catch (error) {
      console.error('Failed to load medium widget config:', error);
      setError('Failed to load widget configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultConfig = (): WidgetConfig => ({
    bot_name: 'Medium AI Assistant',
    greeting_message: 'Hello! How can I help you today?',
    theme_color: '#10B981',
    header_color: '#10B981',
    text_color: '#374151',
    user_bubble_color: '#10B981',
    bot_bubble_color: '#F3F4F6',
    agent_name: 'Medium Support Agent',
    agent_title: 'Medium AI Assistant',
    agent_avatar: '',
    agent_description: 'I\'m here to help you with detailed questions and support.',
    position: 'bottom-right',
    width: 400,
    height: 550,
    border_radius: 16,
    font_family: 'Inter, sans-serif',
    font_size: 14,
    auto_open: false,
    auto_open_delay: 3000,
    enable_sound: true,
    enable_typing_indicator: true,
    show_timestamps: true, // Enhanced for medium
    show_branding: true,
    typing_delay: 1500,
    language: 'en',
    background_type: 'gradient',
    background_value: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    if (soundEnabled && config?.enable_sound) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
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
      // Send message to the medium bot API
      const response = await fetch(`/api/v1/projects/${projectId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "X-Host-Name": window.location.hostname 
        },
        body: JSON.stringify({
          message: messageText,
          lang: currentLanguage || 'en',
          model_type: 'medium'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setTimeout(() => {
        let botResponseText = data.translated_response || data.response || data.message || 
                             'I received your message. As a medium assistant, I can provide detailed help and support.';

        const botMessage: Message = {
          id: Date.now() + 1,
          text: botResponseText,
          isBot: true,
          timestamp: new Date(),
          agent: config.agent_name,
          showFeedback: true, // Enable feedback for medium
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        playNotificationSound();

      }, config.typing_delay);

    } catch (error) {
      console.error('Medium chat API error:', error);

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

  const handleFeedback = (messageId: number, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(m =>
      m.id === messageId
        ? { ...m, feedback, showFeedback: false }
        : m
    ));

    // Send feedback to backend
    fetch(`/api/v1/projects/${projectId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message_id: messageId,
        feedback_type: feedback,
        project_id: projectId,
        model_type: 'medium'
      })
    }).catch(console.error);
  };

  const handleRating = (messageId: number, rating: number) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId
        ? { ...m, rating, showFeedback: false }
        : m
    ));
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

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Medium Widget...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Medium Widget Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load medium widget configuration'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
        className={`fixed ${getWidgetPositionClasses()} bg-white border border-gray-200 flex flex-col transition-all duration-300 overflow-hidden shadow-xl`}
        style={{
          width: `${config?.width || 400}px`,
          height: isMinimized ? '60px' : `${config?.height || 550}px`,
          borderRadius: `${config?.border_radius || 16}px`,
          background: config?.background_type === 'gradient' ? config.background_value : 'white'
        }}
      >
        {/* Header - Medium Style */}
        <div
          className="flex items-center justify-between p-4 text-white"
          style={{
            background: config?.header_color || '#10B981',
            borderTopLeftRadius: `${config?.border_radius || 16}px`,
            borderTopRightRadius: `${config?.border_radius || 16}px`
          }}
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{config?.agent_name || 'Medium Assistant'}</h3>
              <p className="text-xs opacity-90 truncate">Medium AI Support</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-white/20 border-none rounded px-2 py-1 text-xs text-white cursor-pointer"
              title="Select language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-black">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title={soundEnabled ? "Disable sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              onClick={toggleMinimize}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Container - Medium Style */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} items-end space-x-2`}
                >
                  {message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  
                  <div className="flex flex-col max-w-xs">
                    <div
                      className={`px-4 py-2 rounded-lg text-sm ${
                        message.isBot ? '' : 'text-white'
                      }`}
                      style={
                        message.isBot
                          ? {
                              backgroundColor: config.bot_bubble_color,
                              color: config.text_color,
                              borderRadius: '16px'
                            }
                          : {
                              backgroundColor: config.theme_color,
                              borderRadius: '16px'
                            }
                      }
                    >
                      {message.text}
                    </div>
                    
                    {/* Timestamp and Feedback */}
                    {message.isBot && (
                      <div className="flex items-center justify-between mt-1">
                        {config.show_timestamps && (
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        )}
                        
                        {/* Feedback Buttons */}
                        {message.showFeedback && !message.feedback && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleFeedback(message.id, 'positive')}
                              className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-green-600"
                              title="Helpful"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, 'negative')}
                              className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600"
                              title="Not helpful"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        
                        {/* Feedback Status */}
                        {message.feedback && (
                          <div className="flex items-center space-x-1">
                            {message.feedback === 'positive' ? (
                              <ThumbsUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <ThumbsDown className="h-3 w-3 text-red-600" />
                            )}
                            <span className="text-xs text-gray-500">Thank you!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Enhanced Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start items-end space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-gray-200">
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
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Medium Style */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default MediumWidgetRenderer;