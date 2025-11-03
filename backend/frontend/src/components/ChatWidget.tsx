import React, { useState, useEffect, useRef } from 'react';
import { projectsApi } from '../api/projects';
import { ChatMessage as ChatMessageType, WidgetConfig } from '../types';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

interface ChatWidgetProps {
  projectId: string;
  config?: Partial<WidgetConfig>;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  confidence?: number;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  projectId,
  config: propConfig
}) => {
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default config values
  const defaultConfig: WidgetConfig = {
    project_id: projectId,
    position: 'bottom-right',
    theme_color: '#3B82F6',
    bot_name: 'Chatbot',
    greeting_message: 'Hello! How can I help you today?',
    width: 320,
    height: 480,
    border_radius: 16,
    show_branding: true,
    auto_open: false,
    auto_open_delay: 3000,
    bubble_style: 'rounded',
    animation_style: 'slide',
    font_family: 'Inter, sans-serif',
    font_size: 14,
    enable_sound: false,
    enable_typing_indicator: true,
    max_messages: 100,
    session_timeout: 1800,
    agent_name: 'Support Agent',
    agent_avatar: '',
    show_timestamps: true,
    typing_delay: 1500,
    custom_css: '',
    welcome_delay: 2000,
    minimize_enabled: true,
    header_color: '#3B82F6',
    text_color: '#374151',
    user_bubble_color: '#3B82F6',
    bot_bubble_color: '#F3F4F6'
  };

  // Parse URL parameters
  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      theme: urlParams.get('theme'),
      position: urlParams.get('position') as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
      autoOpen: urlParams.get('autoOpen') === 'true',
      lang: urlParams.get('lang'),
      type: urlParams.get('type'),
      width: urlParams.get('width') ? parseInt(urlParams.get('width')!) : undefined,
      height: urlParams.get('height') ? parseInt(urlParams.get('height')!) : undefined,
      borderRadius: urlParams.get('borderRadius') ? parseInt(urlParams.get('borderRadius')!) : undefined,
      fontSize: urlParams.get('fontSize') ? parseInt(urlParams.get('fontSize')!) : undefined,
      headerColor: urlParams.get('headerColor'),
      userBubbleColor: urlParams.get('userBubbleColor'),
      botBubbleColor: urlParams.get('botBubbleColor'),
      textColor: urlParams.get('textColor'),
      agentName: urlParams.get('agentName'),
      greetingMessage: urlParams.get('greetingMessage'),
      showTimestamps: urlParams.get('showTimestamps') === 'true',
      enableTypingIndicator: urlParams.get('enableTypingIndicator') === 'true',
      fontFamily: urlParams.get('fontFamily'),
      minimizeEnabled: urlParams.get('minimizeEnabled') === 'true'
    };
  };

  // Fetch widget configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await projectsApi.getWidgetConfig(projectId);
        const urlParams = getUrlParams();

        // Merge configs: default < backend < props < URL params
        const config = {
          ...defaultConfig,
          ...response.data,
          ...propConfig,
          // URL params override everything
          ...(urlParams.theme && { theme_color: urlParams.theme }),
          ...(urlParams.position && { position: urlParams.position }),
          ...(urlParams.autoOpen !== undefined && { auto_open: urlParams.autoOpen }),
          ...(urlParams.lang && { language: urlParams.lang }),
          ...(urlParams.width && { width: urlParams.width }),
          ...(urlParams.height && { height: urlParams.height }),
          ...(urlParams.borderRadius && { border_radius: urlParams.borderRadius }),
          ...(urlParams.fontSize && { font_size: urlParams.fontSize }),
          ...(urlParams.headerColor && { header_color: urlParams.headerColor }),
          ...(urlParams.userBubbleColor && { user_bubble_color: urlParams.userBubbleColor }),
          ...(urlParams.botBubbleColor && { bot_bubble_color: urlParams.botBubbleColor }),
          ...(urlParams.textColor && { text_color: urlParams.textColor }),
          ...(urlParams.agentName && { agent_name: urlParams.agentName }),
          ...(urlParams.greetingMessage && { greeting_message: urlParams.greetingMessage }),
          ...(urlParams.showTimestamps !== undefined && { show_timestamps: urlParams.showTimestamps }),
          ...(urlParams.enableTypingIndicator !== undefined && { enable_typing_indicator: urlParams.enableTypingIndicator }),
          ...(urlParams.fontFamily && { font_family: urlParams.fontFamily }),
          ...(urlParams.minimizeEnabled !== undefined && { minimize_enabled: urlParams.minimizeEnabled })
        };

        setWidgetConfig(config);

        // Add greeting message
        if (config.greeting_message) {
          setMessages([{
            id: '1',
            text: config.greeting_message,
            isBot: true,
            timestamp: new Date()
          }]);
        }

        // Auto open widget
        if (config.auto_open) {
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, config.auto_open_delay);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Failed to fetch widget config:', error);
        // Use default config with URL params
        const urlParams = getUrlParams();
        const config = {
          ...defaultConfig,
          ...propConfig,
          ...(urlParams.theme && { theme_color: urlParams.theme }),
          ...(urlParams.position && { position: urlParams.position }),
          ...(urlParams.autoOpen !== undefined && { auto_open: urlParams.autoOpen })
        };
        setWidgetConfig(config);
        if (config.greeting_message) {
          setMessages([{
            id: '1',
            text: config.greeting_message,
            isBot: true,
            timestamp: new Date()
          }]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [projectId, propConfig]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || !widgetConfig) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const chatMessage: ChatMessageType = {
        message: inputMessage,
        lang: 'en'
      };

      const response = await projectsApi.chat(projectId, chatMessage);

      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          isBot: true,
          timestamp: new Date(),
          confidence: response.data.confidence
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);

        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }, widgetConfig.typing_delay);
    } catch {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const minimizeWidget = () => {
    setIsMinimized(true);
  };

  const getPositionClasses = () => {
    if (!widgetConfig) return 'bottom-4 right-4';
    switch (widgetConfig.position) {
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
    if (!widgetConfig) return 'bottom-20 right-4';
    switch (widgetConfig.position) {
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

  if (isLoading || !widgetConfig) {
    return null; // Or a loading spinner
  }

  return (
    <div className="fixed z-50">
      {/* Chat Button */}
      <div className={`fixed ${getPositionClasses()}`}>
        <button
          onClick={toggleWidget}
          className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center text-white"
          style={{ backgroundColor: widgetConfig.theme_color }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={`fixed ${getWidgetPositionClasses()} bg-white shadow-2xl border border-gray-200 flex flex-col transform transition-all duration-300 ${
            isMinimized ? 'h-12' : ''
          }`}
          style={{
            width: widgetConfig.width,
            height: isMinimized ? 48 : widgetConfig.height,
            borderRadius: widgetConfig.border_radius,
            fontFamily: widgetConfig.font_family,
            fontSize: widgetConfig.font_size
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 text-white rounded-t-lg"
            style={{ backgroundColor: widgetConfig.header_color }}
          >
            <div className="flex items-center space-x-2">
              {widgetConfig.agent_avatar ? (
                <img
                  src={widgetConfig.agent_avatar}
                  alt="Agent"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-sm">{widgetConfig.agent_name}</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {widgetConfig.minimize_enabled && (
                <button
                  onClick={minimizeWidget}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={toggleWidget}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.isBot
                          ? ''
                          : 'text-white'
                      }`}
                      style={
                        message.isBot
                          ? { backgroundColor: widgetConfig.bot_bubble_color, color: widgetConfig.text_color }
                          : { backgroundColor: widgetConfig.user_bubble_color }
                      }
                    >
                      {message.text}
                      {widgetConfig.show_timestamps && (
                        <div className={`text-xs mt-1 ${message.isBot ? 'opacity-60' : 'opacity-75'}`}>
                          {message.timestamp.toLocaleTimeString()}
                          {message.confidence && (
                            <span className="ml-2">({Math.round(message.confidence * 100)}%)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && widgetConfig.enable_typing_indicator && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      {widgetConfig.agent_avatar && (
                        <img
                          src={widgetConfig.agent_avatar}
                          alt="Agent"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <div
                        className="px-3 py-2 rounded-lg"
                        style={{ backgroundColor: widgetConfig.bot_bubble_color }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">{widgetConfig.agent_name} is typing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-3">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
                    style={{
                      fontFamily: widgetConfig.font_family,
                      fontSize: widgetConfig.font_size,
                      borderRadius: widgetConfig.border_radius
                    }}
                    disabled={isTyping && widgetConfig.enable_typing_indicator}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || (isTyping && widgetConfig.enable_typing_indicator)}
                    className="p-2 rounded-lg text-white disabled:opacity-50"
                    style={{
                      backgroundColor: widgetConfig.user_bubble_color,
                      borderRadius: widgetConfig.border_radius
                    }}
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;