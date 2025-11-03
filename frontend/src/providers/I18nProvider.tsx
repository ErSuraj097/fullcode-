import React, { ReactNode } from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Supported languages with their details
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
  { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.projects': 'Projects',
      'nav.prediction': 'Prediction',
      'nav.settings': 'Settings',
      'nav.logout': 'Logout',
      
      // Common
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.create': 'Create',
      'common.update': 'Update',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.import': 'Import',
      'common.upload': 'Upload',
      'common.download': 'Download',
      'common.preview': 'Preview',
      'common.configure': 'Configure',
      'common.manage': 'Manage',
      'common.test': 'Test',
      'common.train': 'Train',
      'common.deploy': 'Deploy',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.finish': 'Finish',
      'common.close': 'Close',
      'common.open': 'Open',
      'common.view': 'View',
      'common.copy': 'Copy',
      'common.paste': 'Paste',
      'common.clear': 'Clear',
      'common.reset': 'Reset',
      'common.refresh': 'Refresh',
      'common.retry': 'Retry',
      'common.confirm': 'Confirm',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.ok': 'OK',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.warning': 'Warning',
      'common.info': 'Information',
      
      // Authentication
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.logout': 'Logout',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.name': 'Full Name',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.rememberMe': 'Remember Me',
      'auth.signIn': 'Sign In',
      'auth.signUp': 'Sign Up',
      'auth.createAccount': 'Create Account',
      'auth.haveAccount': 'Already have an account?',
      'auth.noAccount': "Don't have an account?",
      'auth.welcomeBack': 'Welcome back!',
      'auth.getStarted': 'Get started today',
      
      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.welcome': 'Welcome back, {{name}}!',
      'dashboard.subtitle': 'Manage your chatbot projects and track their performance',
      'dashboard.totalProjects': 'Total Projects',
      'dashboard.trainedModels': 'Trained Models',
      'dashboard.avgAccuracy': 'Average Accuracy',
      'dashboard.systemStatus': 'System Status',
      'dashboard.recentProjects': 'Recent Projects',
      'dashboard.noProjects': 'No projects',
      'dashboard.noProjectsDesc': 'Get started by creating a new chatbot project.',
      'dashboard.createFirst': 'Create your first project',
      
      // Projects
      'projects.title': 'Projects',
      'projects.subtitle': 'Manage your chatbot projects',
      'projects.newProject': 'New Project',
      'projects.projectName': 'Project Name',
      'projects.projectDescription': 'Description',
      'projects.projectType': 'Project Type',
      'projects.created': 'Created',
      'projects.status': 'Status',
      'projects.accuracy': 'Accuracy',
      'projects.actions': 'Actions',
      'projects.noProjects': 'No projects found',
      'projects.searchPlaceholder': 'Search projects...',
      
      // Project Detail
      'project.details': 'Project Details',
      'project.intents': 'Intents',
      'project.training': 'Training',
      'project.chat': 'Test Chat',
      'project.widget': 'Widget',
      'project.settings': 'Settings',
      'project.analytics': 'Analytics',
      'project.trainingStatus': 'Training Status',
      'project.modelType': 'Model Type',
      'project.lastTrained': 'Last Trained',
      'project.trainModel': 'Train Model',
      'project.addIntent': 'Add Intent',
      'project.intentTag': 'Intent Tag',
      'project.patterns': 'Patterns',
      'project.responses': 'Responses',
      'project.addPattern': 'Add Pattern',
      'project.addResponse': 'Add Response',
      
      // Widget Configuration
      'widget.title': 'Widget Configuration',
      'widget.subtitle': 'Customize your chatbot widget',
      'widget.appearance': 'Appearance',
      'widget.behavior': 'Behavior',
      'widget.advanced': 'Advanced',
      'widget.preview': 'Preview',
      'widget.embedCode': 'Embed Code',
      'widget.position': 'Position',
      'widget.theme': 'Theme',
      'widget.colors': 'Colors',
      'widget.botName': 'Bot Name',
      'widget.greeting': 'Greeting Message',
      'widget.avatar': 'Avatar',
      'widget.autoOpen': 'Auto Open',
      'widget.sound': 'Enable Sound',
      'widget.typing': 'Typing Indicator',
      'widget.timestamps': 'Show Timestamps',
      'widget.branding': 'Show Branding',
      
      // Chat
      'chat.title': 'Test Chat',
      'chat.subtitle': 'Test your chatbot',
      'chat.placeholder': 'Type your message...',
      'chat.send': 'Send',
      'chat.clear': 'Clear Chat',
      'chat.export': 'Export Chat',
      'chat.noMessages': 'No messages yet',
      'chat.startConversation': 'Start a conversation',
      'chat.botTyping': 'Bot is typing...',
      
      // Settings
      'settings.title': 'Settings',
      'settings.profile': 'Profile',
      'settings.account': 'Account',
      'settings.preferences': 'Preferences',
      'settings.language': 'Language',
      'settings.theme': 'Theme',
      'settings.notifications': 'Notifications',
      'settings.security': 'Security',
      'settings.billing': 'Billing',
      'settings.api': 'API Keys',
      
      // Errors
      'error.generic': 'Something went wrong. Please try again.',
      'error.network': 'Network error. Please check your connection.',
      'error.unauthorized': 'You are not authorized to perform this action.',
      'error.notFound': 'The requested resource was not found.',
      'error.validation': 'Please check your input and try again.',
      'error.server': 'Server error. Please try again later.',
      
      // Success Messages
      'success.saved': 'Changes saved successfully',
      'success.created': 'Created successfully',
      'success.updated': 'Updated successfully',
      'success.deleted': 'Deleted successfully',
      'success.uploaded': 'Uploaded successfully',
      'success.trained': 'Model trained successfully',
      'success.deployed': 'Deployed successfully',
      
      // Landing Page
      'landing.title': 'Multilingual AI Chatbots for India',
      'landing.subtitle': 'Create intelligent chatbots that speak 22+ Indian languages with voice support, beautiful customization, and enterprise-grade reliability.',
      'landing.getStarted': 'Get Started Free',
      'landing.watchDemo': 'Watch Demo',
      'landing.features': 'Features',
      'landing.pricing': 'Pricing',
      'landing.testimonials': 'Testimonials',
      'landing.contact': 'Contact',
    },
  },
  hi: {
    translation: {
      // Navigation
      'nav.dashboard': 'डैशबोर्ड',
      'nav.projects': 'प्रोजेक्ट्स',
      'nav.prediction': 'भविष्यवाणी',
      'nav.settings': 'सेटिंग्स',
      'nav.logout': 'लॉगआउट',
      
      // Common
      'common.loading': 'लोड हो रहा है...',
      'common.save': 'सेव करें',
      'common.cancel': 'रद्द करें',
      'common.delete': 'डिलीट करें',
      'common.edit': 'एडिट करें',
      'common.create': 'बनाएं',
      'common.update': 'अपडेट करें',
      'common.search': 'खोजें',
      'common.back': 'वापस',
      'common.next': 'अगला',
      'common.close': 'बंद करें',
      
      // Authentication
      'auth.login': 'लॉगिन',
      'auth.register': 'रजिस्टर',
      'auth.email': 'ईमेल',
      'auth.password': 'पासवर्ड',
      'auth.name': 'पूरा नाम',
      'auth.signIn': 'साइन इन',
      'auth.signUp': 'साइन अप',
      'auth.welcomeBack': 'वापस स्वागत है!',
      
      // Dashboard
      'dashboard.title': 'डैशबोर्ड',
      'dashboard.welcome': 'वापस स्वागत है, {{name}}!',
      'dashboard.totalProjects': 'कुल प्रोजेक्ट्स',
      'dashboard.trainedModels': 'प्रशिक्षित मॉडल',
      'dashboard.avgAccuracy': 'औसत सटीकता',
      'dashboard.recentProjects': 'हाल की प्रोजेक्ट्स',
      
      // Add more Hindi translations as needed
    },
  },
  // Add more languages as needed
};

// Initialize i18n
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default i18n;