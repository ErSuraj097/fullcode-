// Core Types
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  training_status: 'untrained' | 'training' | 'trained' | 'error';
  model_type?: 'basic' | 'advanced';
  accuracy?: number;
  config: ChatbotConfig;
}

export interface ChatbotConfig {
  greeting_enabled: boolean;
  greeting_message: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  avatar: string;
  bot_name: string;
  agent_role: string;
  chattiness: 'concise' | 'balanced' | 'detailed';
  language: string;
  theme_color: string;
  background_type: 'solid' | 'gradient' | 'image';
  font_family: string;
  bubble_style: 'rounded' | 'square' | 'modern';
  button_color: string;
  icon_color: string;
}

export interface Intent {
  tag: string;
  patterns: string[];
  responses: string[];
}

export interface IntentsData {
  intents: Intent[];
}

export interface ChatMessage {
  message: string;
  lang: string;
}

export interface ChatResponse {
  response: string;
  confidence: number;
  intent?: string;
  model_type?: string;
  config?: ChatbotConfig;
}

export interface TrainingResult {
  message: string;
  model_type: string;
  accuracy: number;
  training_result?: any;
}

// Widget Configuration
export interface WidgetConfig {
  project_id: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme_color: string;
  bot_name: string;
  greeting_message: string;
  width: number;
  height: number;
  border_radius: number;
  show_branding: boolean;
  auto_open: boolean;
  auto_open_delay: number;
  bubble_style: 'rounded' | 'square' | 'circle';
  animation_style: 'slide' | 'fade' | 'bounce';
  font_family: string;
  font_size: number;
  enable_sound: boolean;
  enable_typing_indicator: boolean;
  max_messages: number;
  session_timeout: number;
  agent_name: string;
  agent_avatar: string;
  show_timestamps: boolean;
  typing_delay: number;
  custom_css: string;
  welcome_delay: number;
  minimize_enabled: boolean;
  header_color: string;
  text_color: string;
  user_bubble_color: string;
  bot_bubble_color: string;
}

export interface EmbedCode {
  html: string;
  javascript: string;
  css: string;
  iframe_url: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp?: string;
}

export interface OTPForm {
  email: string;
  otp: string;
}

export interface OTPResponse {
  message: string;
}

export interface ProjectForm {
  name: string;
  description: string;
  type: string;
}

export interface IntentForm {
  tag: string;
  patterns: string[];
  responses: string[];
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Language Support
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface Translation {
  [key: string]: string | Translation;
}

// Theme Types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

// Analytics Types
export interface Analytics {
  totalProjects: number;
  trainedModels: number;
  averageAccuracy: number;
  totalConversations: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

// System Status
export interface SystemStatus {
  status: string;
  uptime: number;
  models_loaded: number;
  active_sessions: number;
  memory_usage: number;
  cpu_usage: number;
  last_updated: string;
}

// Prediction Types
export interface PredictionRequest {
  image: File;
  project_id?: string;
}

export interface PredictionResponse {
  predicted_text: string;
  confidence: number;
  processing_time: number;
  timestamp: string;
}

export interface PredictionHistory {
  id: string;
  predicted_text: string;
  confidence: number;
  timestamp: string;
  processing_time: number;
  user_id?: string;
  project_id?: string;
}

// Utility Types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';