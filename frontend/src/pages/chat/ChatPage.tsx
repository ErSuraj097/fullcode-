import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  Bot, 
  User, 
  RefreshCw,
  Download,
  Trash2,
  Globe,
  Volume2,
  VolumeX,
  Settings,
  Zap,
  Clock,
} from 'lucide-react';
import { projectsApi, chatApi, feedbackApi } from '../../api/services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { cn } from '../../utils/cn';
import { toast } from 'react-toastify';
import { SUPPORTED_LANGUAGES } from '../../providers/I18nProvider';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  confidence?: number;
  intent?: string;
  language?: string;
}

const ChatPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t, i18n } = useTranslation();
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: (message: { message: string; lang: string }) => 
      chatApi.sendMessage(projectId!, message),
    onSuccess: async (response) => {
      // Use translated response if available, otherwise use original response
      const responseText = response.translated_response || response.response;
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: responseText,
        isBot: true,
        timestamp: new Date(),
        confidence: response.confidence,
        intent: response.intent,
        language: selectedLanguage,
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Submit feedback for the last user message and bot response
      try {
        const lastUserMessage = messages.slice().reverse().find(msg => !msg.isBot);
        if (lastUserMessage) {
          const feedbackData = {
            user_message: lastUserMessage.text,
            bot_response: responseText,
            feedback_type: "rating", // default feedback type, can be extended
            rating: null, // placeholder for rating, can be updated later
            project_id: projectId,
            intent: response.intent,
            timestamp: Date.now(),
          };
          await feedbackApi.submitFeedback(projectId!, feedbackData);
        }
      } catch (error) {
        console.error("Failed to submit feedback:", error);
      }
      
      // Play sound notification
      if (soundEnabled) {
        playNotificationSound();
      }
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      toast.error('Failed to send message');
    },
  });

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    scrollToBottomIfNeeded();
  }, [messages]);

  // Auto-scroll to bottom on typing indicator
  useEffect(() => {
    if (isTyping) {
      scrollToBottomIfNeeded();
    }
  }, [isTyping]);

  // Add welcome message
  useEffect(() => {
    if (project && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: project.config?.greeting_message || 'Hello! How can I help you today?',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [project]);

  const scrollToBottomIfNeeded = () => {
    const container = messagesContainerRef.current;
    if (container && messagesEndRef.current) {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100; // Tolerance for near-bottom
      if (isAtBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const playNotificationSound = () => {
    // Create a simple notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
      language: selectedLanguage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Send message to API
    chatMutation.mutate({
      message: inputMessage,
      lang: selectedLanguage,
    });
  };

  const clearChat = () => {
    setMessages([]);
    if (project) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: project.config?.greeting_message || 'Hello! How can I help you today?',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const exportChat = () => {
    const chatData = messages.map(msg => ({
      timestamp: msg.timestamp.toISOString(),
      sender: msg.isBot ? 'Bot' : 'User',
      message: msg.text,
      confidence: msg.confidence,
      intent: msg.intent,
      language: msg.language,
    }));

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${project?.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading chat..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] h-[calc(100vh-12rem)] flex flex-col overflow-hidden">
      {/* Header - Made sticky with background and z-index for visibility */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 mb-6">
        <div className="flex items-center justify-between py-4 px-2">
          <div className="flex items-center space-x-4">
            <Link 
              to={`/app/projects/${projectId}`} 
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Chat</h1>
              <p className="text-gray-600 dark:text-gray-400">{project.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                soundEnabled
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              )}
              title={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            {/* Export Chat */}
            <button
              onClick={exportChat}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Export chat"
            >
              <Download className="h-5 w-5" />
            </button>

            {/* Clear Chat */}
            <button
              onClick={clearChat}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Clear chat"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Training Status Warning */}
      {(project.training_status !== 'trained' && project.training_status !== 'training') && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <p className="text-yellow-800 dark:text-yellow-400 text-sm flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            ⚠️ This chatbot hasn't been trained yet. Responses may be limited or generic.
          </p>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Start a conversation</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Send a message to test your chatbot in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start space-x-3',
                  message.isBot ? 'justify-start' : 'justify-end'
                )}
              >
                {message.isBot && (
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                
                <div
                  className={cn(
                    'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                    message.isBot
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'bg-blue-600 text-white'
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.confidence && (
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>{Math.round(message.confidence * 100)}%</span>
                      </div>
                    )}
                  </div>
                  
                  {message.intent && (
                    <div className="mt-1">
                      <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                        {message.intent}
                      </span>
                    </div>
                  )}
                </div>

                {!message.isBot && (
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
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

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  scrollToBottomIfNeeded();
                }}
                onFocus={() => {
                  scrollToBottomIfNeeded();
                }}
                placeholder={`Type your message in ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}...`}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={chatMutation.isPending}
              />
              <div className="absolute right-3 top-3 text-xs text-gray-400">
                {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag}
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || chatMutation.isPending}
              className={cn(
                'px-6 py-3 rounded-lg font-medium transition-colors',
                inputMessage.trim() && !chatMutation.isPending
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              )}
            >
              {chatMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;