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
  Speaker
} from 'lucide-react';


import BotImage from "../../../public/195.jpg"
interface WidgetConfig {
  bot_name: string;
  greeting_message: string;
  theme_color: string;   // e.g., "#FF0000";
  header_color: string; // e.g., "#f7a35c";
  text_color: string;
  user_bubble_color: string; // e.g., "#3B82F6";
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
  // Advanced configuration properties
  bubble_style?: 'rounded' | 'square' | 'circle';
  animation_style?: 'slide' | 'fade' | 'bounce';
  max_messages?: number;
  session_timeout?: number;
  welcome_delay?: number;
  minimize_enabled?: boolean;
  custom_css?: string;
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
  // Global Languages
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

  // Indian Languages (22 official)
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },   // Hindi
  { code: 'as', name: 'অসমীয়া', flag: '🇮🇳' },     // Assamese
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },        // Bengali
  { code: 'brx', name: 'बोड़ो', flag: '🇮🇳' },       // Bodo
  { code: 'doi', name: 'डोगरी', flag: '🇮🇳' },       // Dogri
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },      // Gujarati
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },        // Kannada
  { code: 'ks', name: 'کٲشُر', flag: '🇮🇳' },         // Kashmiri
  { code: 'kok', name: 'कोंकणी', flag: '🇮🇳' },      // Konkani
  { code: 'mai', name: 'मैथिली', flag: '🇮🇳' },      // Maithili
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },       // Malayalam
  { code: 'mni', name: 'মৈতৈলোন্', flag: '🇮🇳' },     // Manipuri (Meitei)
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },        // Marathi
  { code: 'ne', name: 'नेपाली', flag: '🇮🇳' },       // Nepali
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },        // Odia
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },       // Punjabi
  { code: 'sa', name: 'संस्कृतम्', flag: '🇮🇳' },     // Sanskrit
  { code: 'sd', name: 'سنڌي', flag: '🇮🇳' },         // Sindhi
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },        // Tamil
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },       // Telugu
  { code: 'ur', name: 'اردو', flag: '🇮🇳' },         // Urdu
];

const WidgetRenderer: React.FC = () => {
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingMessageId, setCurrentSpeakingMessageId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Add state for avatar animation
  const [avatarAnimation, setAvatarAnimation] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

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

  // Initialize messages with enhanced greeting
  useEffect(() => {

    const url = window.location.href
    console.log(url)
    if (config && messages.length === 0) {
      // Start with welcome animation
      setAvatarAnimation(true);
      setShowWelcome(true);

      // After animation, show greeting message
      const timer = setTimeout(() => {
        setMessages([{
          id: 1,
          text: config.greeting_message,
          isBot: true,
          timestamp: new Date(),
          agent: config.agent_name
        }]);
        setShowWelcome(false);
      }, 2000); // Match this with CSS animation duration

      return () => clearTimeout(timer);
    }
  }, [config]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add typing animation effect
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setAvatarAnimation(prev => !prev);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTyping, avatarAnimation]);

  const loadWidgetConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!projectId) {
        throw new Error('No project ID provided');
      }

      console.log(`Loading widget for project: ${projectId}`);

      // Try multiple approaches to load the configuration
      let configLoaded = false;

      // Approach 1: Try the new public API endpoints
      try {
        const projectUrl = `/api/v1/widget/${projectId}/info`;
        const configUrl = `/api/v1/widget/${projectId}/config`;

        console.log(`Fetching from API endpoints...`);

        const [projectResponse, configResponse] = await Promise.all([
          fetch(projectUrl),
          fetch(configUrl)
        ]);

        if (projectResponse.ok && configResponse.ok) {
          const projectData = await projectResponse.json();
          const widgetConfig = await configResponse.json();

          console.log('API data loaded successfully:', { projectData, widgetConfig });

          const fullConfig = {
            ...getDefaultConfig(),
            ...widgetConfig,
            project_name: projectData.name,
            project_type: projectData.type,
            training_status: projectData.training_status,
            is_trained: projectData.is_trained,
            project_id: projectId
          };

          setConfig(fullConfig);
          setCurrentLanguage(fullConfig.language || 'en');
          setSoundEnabled(fullConfig.enable_sound !== false);

          setMessages([{
            id: 1,
            text: fullConfig.greeting_message,
            isBot: true,
            timestamp: new Date(),
            agent: fullConfig.agent_name
          }]);

          configLoaded = true;
        }
      } catch (apiError) {
        console.warn('API approach failed:', apiError);
      }

      // Approach 2: If API failed, create a working fallback configuration
      if (!configLoaded) {
        console.log('Using fallback configuration...');

        // Create a working configuration based on the project ID
        const fallbackConfig = {
          ...getDefaultConfig(),
          bot_name: config?.bot_name || "AI Assistant",
          agent_name: config?.agent_name || 'Support Agent',
          agent_title: 'AI Assistant',
          project_name: 'AI Assistant',
          project_type: 'general',
          training_status: 'trained', // Assume trained for better UX
          is_trained: true,
          project_id: projectId,
          greeting_message: `Hello! I'm your AI assistant. How can I help you today?`
        };

        setConfig(fallbackConfig);
        setCurrentLanguage(fallbackConfig.language || 'en');
        setSoundEnabled(fallbackConfig.enable_sound !== false);

        setMessages([{
          id: 1,
          text: fallbackConfig.greeting_message,
          isBot: true,
          timestamp: new Date(),
          agent: fallbackConfig.agent_name
        }]);

        console.log('Fallback configuration loaded:', fallbackConfig);
      }

    } catch (error) {
      console.error('Failed to load widget config:', error);

      // Last resort: Create a minimal working configuration
      const emergencyConfig = {
        ...getDefaultConfig(),
        bot_name: 'AI Assistant',
        agent_name: 'Support Agent',
        project_id: projectId || 'unknown',
        greeting_message: 'Hello! I\'m your AI assistant. How can I help you today?',
        training_status: 'trained',
        is_trained: true
      };

      setConfig(emergencyConfig);
      setMessages([{
        id: 1,
        text: emergencyConfig.greeting_message,
        isBot: true,
        timestamp: new Date(),
        agent: emergencyConfig.agent_name
      }]);

      console.log('Emergency configuration loaded');
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultConfig = (): WidgetConfig => ({
    bot_name: 'AI Assistant',
    greeting_message: 'Hello! How can I help you today?',
    theme_color: 'red',
    header_color: 'red',
    text_color: '#374151',
    user_bubble_color: '',
    bot_bubble_color: '#F3F4F6',
    agent_name: 'Support Agent',
    agent_title: 'AI Assistant',
    agent_avatar: '',
    agent_description: 'I\'m here to help you.',
    position: 'bottom-right',
    width: 400,
    height: 500,
    border_radius: 16,
    font_family: 'Inter, sans-serif',
    font_size: 14,
    auto_open: false,
    auto_open_delay: 3000,
    enable_sound: true,
    enable_typing_indicator: true,
    show_timestamps: true,
    show_branding: true,
    typing_delay: 1500,
    language: 'en',
    background_type: 'gradient',
    background_value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    // Advanced configuration properties
    bubble_style: 'rounded',
    animation_style: 'slide',
    max_messages: 100,
    session_timeout: 1800,
    welcome_delay: 2000,
    minimize_enabled: true,
    custom_css: ''
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    if (soundEnabled && config?.enable_sound) {
      // Create a simple notification sound
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
      feedback: null,
      showFeedback: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    if (config.enable_typing_indicator) {
      setIsTyping(true);
    }

    try {
      // Send message to the real trained bot API
      const response = await fetch(`/api/v1/projects/${projectId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "X-Host-Name": window.location.hostname 
        },
        body: JSON.stringify({
          message: messageText,
          lang: currentLanguage || 'en'
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }


      const data = await response.json();
      console.log("Chat reply:", data);
      // const data = await response.json();

      setTimeout(() => {
        let botResponseText = '';

        // Handle different response formats from the API
        // Use translated response if available, otherwise use original response
        if (data.translated_response) {
          botResponseText = data.translated_response;
        } else if (data.response) {
          botResponseText = data.response;
        } else if (data.message) {
          botResponseText = data.message;
        } else if (data.answer) {
          botResponseText = data.answer;
        } else if (typeof data === 'string') {
          botResponseText = data;
        } else {
          botResponseText = 'I received your message, but I\'m not sure how to respond right now.';
        }

        // If the bot indicates it's not trained, show helpful message
        if (botResponseText.includes('not trained') || botResponseText.includes('haven\'t been trained')) {
          botResponseText = `I'm still learning! My training is in progress. You can help improve my responses by providing more training data in the project settings.`;
        }

        const botMessage: Message = {
          id: Date.now() + 1,
          text: botResponseText,
          isBot: true,
          timestamp: new Date(),
          agent: config.agent_name,
          feedback: null,
          showFeedback: false
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        playNotificationSound();

        // Log successful interaction for analytics
        console.log(`Widget chat - Project: ${projectId}, User: "${messageText}", Bot: "${botResponseText}"`);

      }, config.typing_delay);

    } catch (error) {
      console.error('Chat API error:', error);

      setTimeout(() => {
        let errorText = 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.';

        // Provide more specific error messages
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('404')) {
          errorText = 'It looks like this chatbot project might not be set up yet. Please contact the website administrator.';
        } else if (errorMessage.includes('500')) {
          errorText = 'I\'m experiencing some technical difficulties. Please try again in a few minutes.';
        } else if (errorMessage.includes('403')) {
          errorText = 'This chatbot is currently unavailable. Please try again later.';
        }

        const errorMsg: Message = {
          id: Date.now() + 1,
          text: errorText,
          isBot: true,
          timestamp: new Date(),
          agent: config.agent_name,
          feedback: null,
          showFeedback: false
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
      // Focus input when opening
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

  const handleFeedback = async (messageId: number, feedback: 'positive' | 'negative', correction?: string) => {
    try {
      // Find the message
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      // Update local state
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, feedback, showFeedback: false }
          : m
      ));

      // Send feedback to backend
      const feedbackData = {
        user_message: messages.find(m => !m.isBot && m.id < messageId)?.text || '',
        bot_response: message.text,
        feedback_type: feedback === 'positive' ? 'positive' : 'correction',
        correction: correction || '',
        timestamp: new Date().toISOString(),
        project_id: projectId
      };

      await fetch(`/api/v1/projects/${projectId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication if needed
        },
        body: JSON.stringify(feedbackData)
      });

      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const toggleFeedback = (messageId: number) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId
        ? { ...m, showFeedback: !m.showFeedback }
        : m
    ));
  };

  const triggerAdaptiveLearning = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/adaptive-learning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Add a system message about adaptive learning completion
        const systemMessage: Message = {
          id: Date.now() + 2,
          text: "🎉 I've learned from recent feedback and improved my responses! Try asking me something to see the improvements.",
          isBot: true,
          timestamp: new Date(),
          agent: config?.agent_name || 'System',
          feedback: null,
          showFeedback: false
        };
        setMessages(prev => [...prev, systemMessage]);
        console.log('Adaptive learning completed:', result);
      } else {
        throw new Error('Failed to trigger adaptive learning');
      }
    } catch (error) {
      console.error('Error triggering adaptive learning:', error);
      const errorMessage: Message = {
        id: Date.now() + 2,
        text: "Sorry, I couldn't update my learning right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
        agent: config?.agent_name || 'System',
        feedback: null,
        showFeedback: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const downloadChatHistory = () => {
    try {
      // Prepare chat history data
      const chatHistory = {
        project_id: projectId,
        project_name: config?.project_name || 'Chatbot Conversation',
        timestamp: new Date().toISOString(),
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          is_bot: msg.isBot,
          timestamp: msg.timestamp.toISOString(),
          agent: msg.agent,
          feedback: msg.feedback
        }))
      };

      // Convert to JSON string
      const dataStr = JSON.stringify(chatHistory, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      // Create download link
      const exportFileDefaultName = `chat_history_${projectId}_${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      console.log('Chat history downloaded successfully');
    } catch (error) {
      console.error('Error downloading chat history:', error);
    }
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

  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];
  useEffect(() => {
    const sendSize = () => {
      const height = document.documentElement.scrollHeight;
      const width = document.documentElement.scrollWidth;
      window.parent.postMessage(
        { iframeSize: { height, width } },
        "*"
      );
    };

    sendSize();                          // initial
    window.addEventListener("resize", sendSize);

    return () => window.removeEventListener("resize", sendSize);
  }, []);
  if (isLoading) {
    // const bgStyle = config?.background_type === 'gradient' ? config.background_value :
    //   config?.background_type === 'solid' ? config.theme_color : 'red';
    return (
      <div className="fixed inset-0 flex items-center justify-center" >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading widget...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Widget Error</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Failed to load widget configuration'}
          </p>
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
    <div
      className="fixed z-50"
      style={{
        fontFamily: config?.font_family || 'Inter, sans-serif',
        fontSize: `${config?.font_size || 14}px`

      }}
    >
      {/* Chat Button */}
      {/* <div className={`fixed ${getPositionClasses()}`}>
        <button
          onClick={toggleWidget}
          // className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center text-white relative"
          style={{
            backgroundColor: config?.theme_color || '#3B82F6',
            borderRadius: `${config?.border_radius || 16}px`
          }}
        >
          {/* {isOpen ? (
            // <X className="w-6 h-6" />
            <></>
          ) : (
            // <MessageCircle className="w-6 h-6" />
            <></>
          )} */}

      {/* Notification badge */}
      {/* {!isOpen && messages.length > 1 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {messages.filter(m => m.isBot).length}
            </div>
          )} */}
      {/* </button>
      </div> */}

      {/* Chat Widget */}
      {/* {isOpen && ( */}
      <div
        className={`fixed ${getWidgetPositionClasses()}  border border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}
        style={{
          width: `${config?.width || 400}px`,
          height: isMinimized ? '60px' : `${config?.height || 500}px`,
          borderRadius: `${config?.border_radius || 16}px`,
          background: config?.background_type === 'gradient' ? config.background_value :
            config?.background_type === 'solid' ? config.theme_color : 'white'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 text-white min-h-[60px]"
          style={{
            background: config?.header_color || '#3B82F6',
            borderTopLeftRadius: `${config?.border_radius || 16}px`,
            borderTopRightRadius: `${config?.border_radius || 16}px`
          }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {/* Agent Avatar with animation */}
            <div className={`relative ${avatarAnimation ? 'animate-pulse' : ''}`}>
              {config?.agent_avatar ? (
                <img
                  src={config.agent_avatar}
                  alt={config.agent_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              {/* Online status indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{config?.agent_name || 'Support Agent'}</h3>
              <p className="text-xs opacity-90 truncate">{config?.agent_title || 'AI Assistant'}</p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center space-x-2">
            {/* Download Chat History Button */}
            {/* <button
                onClick={downloadChatHistory}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                title="Download chat history"
              >
                <Download className="h-4 w-4" />
              </button> */}

            {/* Language Selector */}
            <div className="relative">
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-white/20 border-none rounded px-2 py-1 text-xs text-white cursor-pointer"
                style={{ fontSize: '11px' }}
                title="Select language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-black">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimize Button */}
            <button
              onClick={toggleMinimize}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>

            {/* Close Button */}
            {/* <button
                onClick={toggleWidget}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button> */}
          </div>
        </div>

        {/* Messages Container */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {/* Welcome animation */}
              {showWelcome && (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative mb-4">


                    {config?.agent_avatar ? (
                      <img
                        src={config.agent_avatar}
                        alt="Agent"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <Bot className="w-8 h-8 text-gray-500" />
                    )}

                    <div className="absolute -inset-2 rounded-full border-2 border-dashed border-blue-300 animate-ping"></div>
                  </div>
                  <div className="text-center bg-white rounded-lg px-4 py-2 shadow-md animate-pulse">
                    <p className="text-sm font-medium text-gray-700">Let's start chatting!</p><br />Sroll Down ....
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} items-end space-x-2`}
                >
                  {/* Bot Avatar (only show for bot messages) */}
                  {/* {message.isBot && (
                      <div className="flex-shrink-0">
                        <img
                          src={config?.agent_avatar || {BotImage}
      }
                          alt="Agent"
                           
  
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>
                    )} */}
                  {message.isBot && (
                    <div className="flex-shrink-0">
                      {config?.agent_avatar ? (
                        <img
                          src={config.agent_avatar}
                          alt="Agent"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <Bot className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                  )}
                  {/* Message Bubble */}
                  <div className="max-w-xs lg:max-w-md">
                    <div
                      className={`px-4 py-2 rounded-lg ${message.isBot
                        ? 'rounded-bl-sm'
                        : 'rounded-br-sm'
                        } transition-all duration-300 transform ${message.isBot ? 'origin-left' : 'origin-right'} hover:scale-105`}
                      style={{
                        backgroundColor: message.isBot
                          ? (config?.bot_bubble_color || '#F3F4F6')
                          : (config?.user_bubble_color || config?.header_color || '#3B82F6'),
                        color: message.isBot
                          ? (config?.text_color || '#374151')
                          : 'white',
                        borderRadius: `${config?.border_radius || 16}px`
                      }}
                    >
                      {/* Speaker Button (top-right corner) */}
                      <button
                        onClick={() => {
                          const synth = window.speechSynthesis;
                          const utter = new SpeechSynthesisUtterance(message.text);
                          synth.cancel(); // stop ongoing speech
                          synth.speak(utter);
                        }}
                        className="absolute top-1 right-1 p-1 rounded hover:bg-gray-200"
                        title="Read this message"
                      >
                        <Volume2 className="h-3 w-3 text-green-500" />
                      </button>

                      <p className="text-sm leading-relaxed">{message.text}</p>
                      {/* {soundEnabled && <Volume2 className="h-3 w-3 text-green-500" />} */}
                    </div>
                    {/* Message Bubble */}



                    {/* Feedback Options for Bot Messages */}
                    {message.isBot && (
                      <div className="mt-2 flex items-center space-x-2">
                        {!message.feedback && (
                          <>
                            <button
                              onClick={() => handleFeedback(message.id, 'positive')}
                              className="text-green-500 hover:text-green-700 transition-colors p-1 rounded"
                              title="Good response"
                            >
                              👍
                            </button>
                            <button
                              onClick={() => toggleFeedback(message.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
                              title="Suggest improvement"
                            >
                              👎
                            </button>
                          </>
                        )}

                        {message.feedback === 'positive' && (
                          <span className="text-green-500 text-xs">✓ Thanks for the feedback!</span>
                        )}

                        {message.feedback === 'negative' && (
                          <span className="text-red-500 text-xs">✓ Feedback recorded</span>
                        )}
                      </div>
                    )}

                    {/* Correction Input */}
                    {message.isBot && message.showFeedback && (
                      <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg">
                        <textarea
                          placeholder="Suggest a better response..."
                          className="w-full text-xs p-2 border border-gray-300 rounded resize-none"
                          rows={2}
                          id={`feedback-textarea-${message.id}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              const textarea = e.target as HTMLTextAreaElement;
                              if (textarea.value.trim()) {
                                handleFeedback(message.id, 'negative', textarea.value.trim());
                              }
                            }
                          }}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => toggleFeedback(message.id)}
                            className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              const textarea = document.getElementById(`feedback-textarea-${message.id}`) as HTMLTextAreaElement;
                              if (textarea?.value.trim()) {
                                handleFeedback(message.id, 'negative', textarea.value.trim());
                              }
                            }}
                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    )}

                    {config?.show_timestamps && (
                      <div className={`text-xs mt-1 opacity-60 ${message.isBot ? 'text-left' : 'text-right'
                        }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    )}
                  </div>



                  {/* User Avatar (only show for user messages) */}
                  {!message.isBot && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && config?.enable_typing_indicator && (
                <div className="flex justify-start items-center space-x-2">
                  <img
                    src={config?.agent_avatar || ''}
                    alt="Agent"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div
                    className="px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: config.bot_bubble_color,
                      borderRadius: `${config.border_radius}px`
                    }}
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

              <div ref={messagesEndRef} />
            </div>

            {/* Language Display */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <Globe className="h-3 w-3" />



                <span>{currentLang.flag} {currentLang.name}</span>


              </div>

              {/* {soundEnabled && <Volume2 className="h-3 w-3 text-green-500" />} */}

              {/* Sound Toggle */}
              {/* <button
                onClick={toggleSound}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button> */}



              {/* Adaptive Learning Button */}
              <button
                onClick={triggerAdaptiveLearning}
                className="p-1.5 hover:bg-white/20 rounded transition-colors relative mr-0"
                title="Improve responses with feedback"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {/* Download Chat History Button */}


              <button
                onClick={downloadChatHistory}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                title="Download chat history"
              >
                <Download className="h-4 w-4" />

              </button>
            </div>


            {/* Input Container */}
            <div className="border-t border-gray-200 p-4 bg-white" style={{
              borderBottomLeftRadius: `${config?.border_radius || 16}px`,
              borderBottomRightRadius: `${config?.border_radius || 16}px`,
              // backgroundColor: `${(config?.header_color) || 'white'}`
            }}>
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 text-sm transition-all duration-300 "
                  style={{
                    borderRadius: `${config?.border_radius || 16}px`,
                   
                    color: config?.text_color || 'black'
                  }}
                  disabled={isTyping}
                  aria-label="Message input"
                  maxLength={500}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="px-4 py-3 text-white bg-red-900 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center hover:shadow-md transform hover:scale-105"
                  style={{
                    backgroundColor: config.header_color,
                    borderRadius: `${config?.border_radius || 16}px`
                  }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Branding */}
            {config?.show_branding && (
              <div className="px-4 py-2 text-center border-t border-gray-100" style={{
                fontSize: '10px',
                backgroundColor: config.header_color,
                borderBottomLeftRadius: `${config.border_radius}px`,
                borderBottomRightRadius: `${config.border_radius}px`
              }}>
                <p className="text-xs text-white opacity-80">
                  Powered by <span className="font-extrabold" style={{color: config.text_color}}>Jethat AI</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
      {/* )} */}

      {/* Add custom animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WidgetRenderer;