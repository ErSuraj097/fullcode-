import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Volume2,
  VolumeX,
  Globe,
  Bot,
  User,
  RefreshCw,
  Download,
  Speaker,
  ThumbsUp,
  ThumbsDown,
  Star,
  Settings,
  Maximize2,
  FileText,
  Image,
  Paperclip,
  Smile,
  MoreHorizontal,
  Zap,
  Brain,
  Sparkles
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
  // Advanced features
  enable_file_upload?: boolean;
  enable_voice_input?: boolean;
  enable_analytics?: boolean;
  custom_css?: string;
  max_messages?: number;
  session_timeout?: number;
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
  attachments?: any[];
  messageType?: 'text' | 'image' | 'file';
  confidence?: number;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
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
];

const AdvancedWidgetRenderer: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [conversationRating, setConversationRating] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        agent: config.agent_name,
        confidence: 0.95
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

      // Create an advanced configuration
      const advancedConfig = {
        ...getDefaultConfig(),
        bot_name: "Advanced AI Assistant",
        agent_name: 'Advanced AI Agent',
        agent_title: 'Advanced AI Assistant',
        project_name: 'Advanced AI Assistant',
        project_type: 'advanced',
        training_status: 'trained',
        is_trained: true,
        project_id: projectId,
        greeting_message: `Hello! I'm your Advanced AI assistant with premium features. I can help with complex queries, file uploads, voice input, detailed analytics, and provide confidence scores for my responses.`,
        theme_color: '#8B5CF6', // Purple theme for advanced
        header_color: '#8B5CF6',
        user_bubble_color: '#8B5CF6',
        width: 450, // Larger width for advanced
        height: 650, // Larger height for advanced
        enable_file_upload: true,
        enable_voice_input: true,
        enable_analytics: true,
        max_messages: 200,
        session_timeout: 3600,
      };

      setConfig(advancedConfig);
      setCurrentLanguage(advancedConfig.language || 'en');
      setSoundEnabled(advancedConfig.enable_sound !== false);

    } catch (error) {
      console.error('Failed to load advanced widget config:', error);
      setError('Failed to load widget configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultConfig = (): WidgetConfig => ({
    bot_name: 'Advanced AI Assistant',
    greeting_message: 'Hello! How can I help you today?',
    theme_color: '#8B5CF6',
    header_color: '#8B5CF6',
    text_color: '#374151',
    user_bubble_color: '#8B5CF6',
    bot_bubble_color: '#F3F4F6',
    agent_name: 'Advanced AI Agent',
    agent_title: 'Advanced AI Assistant',
    agent_avatar: '',
    agent_description: 'I\'m here to provide advanced AI assistance with premium features.',
    position: 'bottom-right',
    width: 450,
    height: 650,
    border_radius: 20,
    font_family: 'Inter, sans-serif',
    font_size: 14,
    auto_open: false,
    auto_open_delay: 3000,
    enable_sound: true,
    enable_typing_indicator: true,
    show_timestamps: true,
    show_branding: true,
    typing_delay: 2000, // Longer for advanced processing
    language: 'en',
    background_type: 'gradient',
    background_value: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    enable_file_upload: true,
    enable_voice_input: true,
    enable_analytics: true,
    max_messages: 200,
    session_timeout: 3600,
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

      oscillator.frequency.value = 1000; // Higher pitch for advanced
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.7);
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
      // Send message to the advanced bot API
      const response = await fetch(`/api/v1/projects/${projectId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "X-Host-Name": window.location.hostname 
        },
        body: JSON.stringify({
          message: messageText,
          lang: currentLanguage || 'en',
          model_type: 'advanced',
          include_confidence: true,
          include_analytics: config.enable_analytics
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setTimeout(() => {
        let botResponseText = data.translated_response || data.response || data.message || 
                             'I received your message. As an advanced assistant, I can provide comprehensive help with detailed analysis.';

        const botMessage: Message = {
          id: Date.now() + 1,
          text: botResponseText,
          isBot: true,
          timestamp: new Date(),
          agent: config.agent_name,
          showFeedback: true,
          confidence: data.confidence || Math.random() * 0.3 + 0.7, // Mock confidence score
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        playNotificationSound();

      }, config.typing_delay);

    } catch (error) {
      console.error('Advanced chat API error:', error);

      setTimeout(() => {
        const errorMsg: Message = {
          id: Date.now() + 1,
          text: 'I apologize, but I\'m experiencing connectivity issues. My advanced systems are working to resolve this. Please try again shortly.',
          isBot: true,
          timestamp: new Date(),
          agent: config.agent_name,
          confidence: 0.9,
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

    // Send detailed feedback to backend
    fetch(`/api/v1/projects/${projectId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message_id: messageId,
        feedback_type: feedback,
        project_id: projectId,
        model_type: 'advanced',
        session_data: {
          language: currentLanguage,
          conversation_length: messages.length,
          timestamp: new Date().toISOString()
        }
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Mock file upload for advanced features
    const fileMessage: Message = {
      id: Date.now(),
      text: `📎 Uploaded: ${file.name}`,
      isBot: false,
      timestamp: new Date(),
      messageType: 'file',
      attachments: [{ name: file.name, size: file.size, type: file.type }]
    };

    setMessages(prev => [...prev, fileMessage]);

    // Mock AI response to file
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: `I've received your file "${file.name}". As an advanced AI, I can analyze various file types including documents, images, and data files. How would you like me to help you with this file?`,
        isBot: true,
        timestamp: new Date(),
        agent: config?.agent_name,
        confidence: 0.92,
        showFeedback: true
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const downloadChatHistory = () => {
    const chatHistory = {
      project_id: projectId,
      model_type: 'advanced',
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        is_bot: msg.isBot,
        timestamp: msg.timestamp.toISOString(),
        agent: msg.agent,
        feedback: msg.feedback,
        confidence: msg.confidence
      })),
      analytics: {
        total_messages: messages.length,
        user_messages: messages.filter(m => !m.isBot).length,
        bot_messages: messages.filter(m => m.isBot).length,
        average_confidence: messages.filter(m => m.isBot && m.confidence).reduce((acc, m) => acc + (m.confidence || 0), 0) / messages.filter(m => m.isBot && m.confidence).length || 0,
        language: currentLanguage,
        session_duration: Date.now() - (messages[0]?.timestamp.getTime() || Date.now())
      }
    };

    const dataStr = JSON.stringify(chatHistory, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `advanced_chat_${projectId}_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
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
    if (isMaximized) return 'inset-4';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Advanced Widget...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Advanced Widget Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load advanced widget configuration'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed z-50" style={{ fontFamily: config?.font_family || 'Inter, sans-serif' }}>
      {/* Chat Widget - Advanced Style */}
      <div
        className={`fixed ${getWidgetPositionClasses()} bg-white border border-gray-200 flex flex-col transition-all duration-300 overflow-hidden shadow-2xl`}
        style={{
          width: isMaximized ? 'calc(100vw - 2rem)' : `${config?.width || 450}px`,
          height: isMinimized ? '60px' : isMaximized ? 'calc(100vh - 2rem)' : `${config?.height || 650}px`,
          borderRadius: `${config?.border_radius || 20}px`,
          background: config?.background_type === 'gradient' ? config.background_value : 'white'
        }}
      >
        {/* Header - Advanced Style */}
        <div
          className="flex items-center justify-between p-4 text-white relative overflow-hidden"
          style={{
            background: config?.header_color || '#8B5CF6',
            borderTopLeftRadius: `${config?.border_radius || 20}px`,
            borderTopRightRadius: `${config?.border_radius || 20}px`
          }}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
          
          <div className="flex items-center space-x-3 flex-1 relative z-10">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Brain className="h-6 w-6" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate flex items-center">
                {config?.agent_name || 'Advanced AI'} 
                <Zap className="h-3 w-3 ml-1 text-yellow-300" />
              </h3>
              <p className="text-xs opacity-90 truncate">Advanced AI • Premium Features</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 relative z-10">
            {/* Advanced Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-white/20 border-none rounded-lg px-2 py-1 text-xs text-white cursor-pointer backdrop-blur-sm"
              title="Select language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-black">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>

            {/* Download Chat History */}
            <button
              onClick={downloadChatHistory}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              title="Download chat history"
            >
              <Download className="h-4 w-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              title={soundEnabled ? "Disable sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Maximize Toggle */}
            <button
              onClick={toggleMaximize}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            <button
              onClick={toggleMinimize}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              title="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Container - Advanced Style */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} items-end space-x-2`}
                >
                  {message.isBot && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div className="flex flex-col max-w-sm">
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm shadow-lg ${
                        message.isBot ? 'bg-white border border-gray-100' : 'text-white'
                      }`}
                      style={
                        message.isBot
                          ? {
                              backgroundColor: config.bot_bubble_color,
                              color: config.text_color,
                            }
                          : {
                              background: `linear-gradient(135deg, ${config.theme_color} 0%, ${config.user_bubble_color} 100%)`,
                            }
                      }
                    >
                      {message.text}
                      
                      {/* Confidence Score for Bot Messages */}
                      {message.isBot && message.confidence && (
                        <div className="mt-2 flex items-center space-x-1">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-blue-500 h-1 rounded-full transition-all duration-500"
                              style={{ width: `${message.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 font-mono">
                            {Math.round(message.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Advanced Timestamp and Feedback */}
                    {message.isBot && (
                      <div className="flex items-center justify-between mt-2">
                        {config.show_timestamps && (
                          <span className="text-xs text-gray-500 font-mono">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        )}
                        
                        {/* Advanced Feedback with Rating */}
                        {message.showFeedback && !message.feedback && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleFeedback(message.id, 'positive')}
                              className="p-1.5 hover:bg-green-100 rounded-lg text-gray-500 hover:text-green-600 transition-colors"
                              title="Helpful response"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, 'negative')}
                              className="p-1.5 hover:bg-red-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                              title="Not helpful"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                            {/* Star Rating */}
                            <div className="flex items-center space-x-0.5 ml-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleRating(message.id, star)}
                                  className="p-0.5 hover:text-yellow-500 text-gray-300 transition-colors"
                                >
                                  <Star className="h-3 w-3" />
                                </button>
                              ))}
                            </div>
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
                            <span className="text-xs text-gray-500">Thank you for your feedback!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!message.isBot && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Advanced Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start items-end space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <Brain className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {config.agent_name} is analyzing...
                      </span>
                      <Sparkles className="h-3 w-3 text-purple-500 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Advanced Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              {/* Quick Actions */}
              {showQuickActions && (
                <div className="mb-3 flex items-center space-x-2">
                  <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200 transition-colors">
                    📊 Analytics
                  </button>
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors">
                    🔍 Deep Search
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors">
                    💡 Suggestions
                  </button>
                </div>
              )}

              <div className="flex items-end space-x-3">
                {/* File Upload */}
                {config.enable_file_upload && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Upload file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                )}

                {/* Quick Actions Toggle */}
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Quick actions"
                >
                  <Zap className="h-5 w-5" />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything... I'm your advanced AI assistant!"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedWidgetRenderer;