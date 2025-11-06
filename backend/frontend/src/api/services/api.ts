import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';

// Types
import type {
  User,
  Project,
  Intent,
  IntentsData,
  ChatMessage,
  ChatResponse,
  TrainingResult,
  WidgetConfig,
  EmbedCode,
  SystemStatus,
  PredictionResponse,
  LoginForm,
  RegisterForm,
  ProjectForm,
  IntentForm,
  OTPForm,
  OTPResponse,
} from '../../types';

// API Configuration
// const apiPort = import.meta.env.VITE_API_PORT || '8000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/';


// Main API Service Class 
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleApiError(error: AxiosError) {
    const status = error.response?.status;
    const message = (error.response?.data as any)?.detail || error.message;

    // Don't show toast for certain errors that should be handled by components
    const silentErrors = [401, 404];

    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('auth_token');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        }
        break;
      case 403:
        toast.error('Access denied. You do not have permission to perform this action.');
        break;
      case 404:
        // Let components handle 404 errors
        break;
      case 422:
        toast.error('Validation error. Please check your input.');
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (status && status >= 400 && !silentErrors.includes(status)) {
          toast.error(message || 'An error occurred. Please try again.');
        }
    }
  }

  // Authentication APIs
  async login(credentials: LoginForm): Promise<{ access_token: string; token_type: string; user: User }> {
    const response = await this.client.post('/api/v1/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterForm): Promise<{ access_token: string; token_type: string; user: User }> {
    const response = await this.client.post('/api/v1/auth/register', userData);
    return response.data;
  }


  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/api/v1/auth/me');
    return response.data;
  }

  async sendOtp(email: string): Promise<OTPResponse> {
    const response = await this.client.post('/api/v1/auth/send-otp', { email });
    return response.data;
  }

  async verifyOtp(otpData: OTPForm): Promise<OTPResponse> {
    const response = await this.client.post('/api/v1/auth/verify-otp', otpData);
    return response.data;
  }

  async checkUserExistence(email: string): Promise<{ exists: boolean }> {
    const response = await this.client.post('/api/v1/auth/check-user-existence', { email });
    return response.data;
  }

  async adminRegister(userData: RegisterForm): Promise<{ access_token: string; token_type: string; user: User }> {
    const response = await this.client.post('/api/v1/auth/admin/register', userData);
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await this.client.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.client.post('/api/v1/auth/reset-password', {
      email,
      otp,
      new_password: newPassword,
    });
    return response.data;
  }

  async adminResetPassword(userEmail: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.client.post('/api/v1/auth/admin/reset-password', {
      user_email: userEmail,
      new_password: newPassword,
    });
    return response.data;
  }

  // Account Management APIs
  async getAccountInfo(): Promise<any> {
    const response = await this.client.get('/api/v1/auth/account/info');
    return response.data;
  }

  async deactivateAccount(password: string, reason?: string): Promise<{ message: string; deactivated_at: string }> {
    const response = await this.client.post('/api/v1/auth/account/deactivate', {
      password,
      reason,
    });
    return response.data;
  }

  async initiateAccountDeletion(password: string, confirmation: string): Promise<{ message: string; otp_sent: boolean }> {
    const response = await this.client.post('/api/v1/auth/account/delete/initiate', {
      password,
      confirmation,
    });
    return response.data;
  }

  async deleteAccount(otp: string): Promise<{ message: string; deleted_at: string; projects_deleted: number }> {
    const response = await this.client.delete('/api/v1/auth/account/delete', {
      data: {
        otp,
      },
    });
    return response.data;
  }

  async reactivateAccount(email: string, password: string): Promise<{ access_token: string; token_type: string; user: User }> {
    const response = await this.client.post('/api/v1/auth/account/reactivate', {
      email,
      password,
    });
    return response.data;
  }

  // Project APIs
  async getProjects(): Promise<Project[]> {
    const response = await this.client.get('/api/v1/projects');
    return response.data.projects || response.data; // Handle both formats
  }

  async getProject(projectId: string): Promise<Project> {
    const response = await this.client.get(`/api/v1/projects/${projectId}`);
    return response.data;
  }

  async createProject(projectData: ProjectForm): Promise<Project> {
    const response = await this.client.post('/api/v1/projects', projectData);
    return response.data;
  }

  async updateProject(projectId: string, projectData: Partial<ProjectForm>): Promise<Project> {
    const response = await this.client.put(`/api/v1/projects/${projectId}`, projectData);
    return response.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.client.delete(`/api/v1/projects/${projectId}`);
  }

  // Intent APIs
  async getIntents(projectId: string): Promise<IntentsData> {
    const response = await this.client.get(`/api/v1/projects/${projectId}/intents`);
    return response.data;
  }

  async addIntent(projectId: string, intent: IntentForm): Promise<Intent> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/intents`, intent);
    return response.data;
  }

  async updateIntent(projectId: string, intentTag: string, intent: Partial<IntentForm>): Promise<Intent> {
    const response = await this.client.put(`/api/v1/projects/${projectId}/intents/${intentTag}`, intent);
    return response.data;
  }

  async deleteIntent(projectId: string, intentTag: string): Promise<void> {
    await this.client.delete(`/api/v1/projects/${projectId}/intents/${intentTag}`);
  }

  // Training APIs
  async trainProject(projectId: string): Promise<TrainingResult> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/train`);
    return response.data;
  }

  // Enhanced Model Training APIs
  async selectModelType(projectId: string, modelType: 'basic' | 'medium' | 'advanced'): Promise<any> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/model/select`, { model_type: modelType });
    return response.data;
  }

  async trainBasicModel(projectId: string): Promise<TrainingResult> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/train/basic`);
    return response.data;
  }

  async trainMediumModel(projectId: string): Promise<TrainingResult> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/train/medium`);
    return response.data;
  }

  async trainAdvancedModel(projectId: string): Promise<TrainingResult> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/train/advanced`);
    return response.data;
  }

  async getAvailableModels(): Promise<any> {
    const response = await this.client.get('/api/v1/models/available');
    return response.data;
  }

  async getProjectModelStatus(projectId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/projects/${projectId}/model/status`);
    return response.data;
  }

  async getTrainingProgress(projectId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/projects/${projectId}/training/progress`);
    return response.data;
  }

  // Chat APIs
  async sendMessage(projectId: string, message: ChatMessage): Promise<ChatResponse> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/chat`, message);
    return response.data;
  }

  // Model-Specific Chat APIs
  async chatWithBasicModel(projectId: string, message: ChatMessage): Promise<ChatResponse> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/chat/basic`, message);
    return response.data;
  }

  async chatWithMediumModel(projectId: string, message: ChatMessage): Promise<ChatResponse> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/chat/medium`, message);
    return response.data;
  }

  async chatWithAdvancedModel(projectId: string, message: ChatMessage): Promise<ChatResponse> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/chat/advanced`, message);
    return response.data;
  }

  async chatWithAutoModel(projectId: string, message: ChatMessage): Promise<ChatResponse> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/chat/auto`, message);
    return response.data;
  }

  async compareModels(projectId: string, message: ChatMessage): Promise<any> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/chat/compare`, message);
    return response.data;
  }

  // Widget APIs
  async getWidgetConfig(projectId: string): Promise<WidgetConfig> {
    const response = await this.client.get(`/api/v1/projects/${projectId}/widget/config`);
    return response.data;
  }

  async updateWidgetConfig(projectId: string, config: Partial<WidgetConfig>): Promise<WidgetConfig> {
    const response = await this.client.put(`/api/v1/projects/${projectId}/widget/config`, config);
    return response.data;
  }

  async generateEmbedCode(projectId: string, config: Partial<WidgetConfig>): Promise<EmbedCode> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/widget/embed`, config);
    return response.data;
  }

  async getWidgetPreview(projectId: string): Promise<string> {
    const response = await this.client.get(`/api/v1/projects/${projectId}/widget/preview`);
    return response.data;
  }

  // File Upload APIs
  async uploadIntents(projectId: string, file: File): Promise<{ message: string; imported_count: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(`/api/v1/projects/${projectId}/upload-intents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadWidgetIcon(projectId: string, file: File): Promise<{ icon_url: string }> {
    const formData = new FormData();
    formData.append('icon', file);

    const response = await this.client.post(`/api/v1/projects/${projectId}/widget/upload-icon`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async importIntents(projectId: string, file: File): Promise<{ message: string; imported_count: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(`/api/v1/projects/${projectId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // System APIs
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await this.client.get('/api/v1/status');
    return response.data;
  }

  async getHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('api/v1/health');
    return response.data;
  }

  // Prediction APIs (for compatibility)
  async predictImage(file: File, projectId?: string): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('image', file);
    if (projectId) {
      formData.append('project_id', projectId);
    }

    const response = await this.client.post('/api/v1/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getPredictionHistory(limit = 10): Promise<any[]> {
    const response = await this.client.get(`/api/v1/history?limit=${limit}`);
    return response.data;
  }

  // Configuration APIs
  async getChatbotConfig(projectId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/projects/${projectId}/config`);
    return response.data;
  }

  async updateChatbotConfig(projectId: string, config: any): Promise<any> {
    const response = await this.client.put(`/api/v1/projects/${projectId}/config`, config);
    return response.data;
  }

  // Analytics APIs
  async getProjectAnalytics(projectId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/projects/${projectId}/analytics`);
    return response.data;
  }

  async getDashboardStats(): Promise<any> {
    const response = await this.client.get('/api/v1/dashboard/stats');
    return response.data;
  }

  // Feedback APIs
  async getFeedbackForProject(projectId: string): Promise<any[]> {
    const response = await this.client.get(`/api/v1/projects/${projectId}/feedback`);
    return response.data;
  }

  async submitFeedback(projectId: string, feedbackData: any): Promise<any> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/chat/feedback`, feedbackData);
    return response.data;
  }

  // Payment APIs
  async createPayment(data: any): Promise<any> {
    const response = await this.client.post('/api/v1/payments', data);
    return response.data;
  }

  async initiatePaytmPayment(data: any): Promise<any> {
    const response = await this.client.post('/api/v1/payments/initiate_paytm_payment', data);
    return response.data;
  }

  async getPayment(paymentId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/payments/${paymentId}`);
    return response.data;
  }

  async getUserPayments(): Promise<any[]> {
    const response = await this.client.get('/api/v1/payments');
    return response.data;
  }

  async getProjectPayments(projectId: string): Promise<any[]> {
    const response = await this.client.get(`/api/v1/projects/${projectId}/payments`);
    return response.data;
  }

  async refundPayment(paymentId: string): Promise<any> {
    const response = await this.client.post(`/api/v1/payments/${paymentId}/refund`);
    return response.data;
  }

  async cancelPayment(orderId: string): Promise<any> {
    const response = await this.client.post(`/api/v1/payments/cancel_payment/${orderId}`);
    return response.data;
  }

  async testEmail(): Promise<any> {
    const response = await this.client.post('/api/v1/payments/test_email');
    return response.data;
  }

  // Subscription APIs
  async createSubscription(data: any): Promise<any> {
    const response = await this.client.post('/api/v1/subscriptions', data);
    return response.data;
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/subscriptions/${subscriptionId}`);
    return response.data;
  }

  async getUserSubscriptions(): Promise<{success: boolean, subscriptions: any[]}> {
    const response = await this.client.get('/api/v1/subscriptions');
    return response.data;
  }

  async getProjectSubscription(projectId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/projects/${projectId}/subscription`);
    return response.data;
  }

  async updateSubscription(subscriptionId: string, data: any): Promise<any> {
    const response = await this.client.put(`/api/v1/subscriptions/${subscriptionId}`, data);
    return response.data;
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    const response = await this.client.delete(`/api/v1/subscriptions/${subscriptionId}`);
    return response.data;
  }

  async cancelProjectSubscription(projectId: string): Promise<any> {
    const response = await this.client.post(`/api/v1/projects/${projectId}/cancel-subscription`);
    return response.data;
  }

  // Invoice APIs
  async createInvoice(data: any): Promise<any> {
    const response = await this.client.post('/api/v1/invoices', data);
    return response.data;
  }

  async getInvoice(invoiceId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/invoices/${invoiceId}`);
    return response.data;
  }

  async getUserInvoices(): Promise<any[]> {
    const response = await this.client.get('/api/v1/invoices');
    return response.data;
  }

  async payInvoice(invoiceId: string): Promise<any> {
    const response = await this.client.post(`/api/v1/invoices/${invoiceId}/pay`);
    return response.data;
  }

  async updateInvoice(invoiceId: string, data: any): Promise<any> {
    const response = await this.client.put(`/api/v1/invoices/${invoiceId}`, data);
    return response.data;
  }

  // Order APIs
  async createOrder(data: any): Promise<any> {
    const response = await this.client.post('/api/v1/orders', data);
    return response.data;
  }

  async getOrder(orderId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/orders/${orderId}`);
    return response.data;
  }

  async getUserOrders(): Promise<any[]> {
    const response = await this.client.get('/api/v1/orders');
    return response.data;
  }

  async updateOrderStatus(orderId: string, data: any): Promise<any> {
    const response = await this.client.put(`/api/v1/orders/${orderId}/status`, data);
    return response.data;
  }

  async cancelOrder(orderId: string): Promise<any> {
    const response = await this.client.post(`/api/v1/orders/${orderId}/cancel`);
    return response.data;
  }

  // Paid Projects APIs
  async getPaidProjects(): Promise<any[]> {
    const response = await this.client.get('/api/v1/projects/paid');
    return response.data;
  }

  // Invoice Download API
  async downloadInvoice(invoiceId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/invoices/${invoiceId}/download`);
    return response.data;
  }
}

// Create and export singleton instance
export const apiService = new ApiService();

// Export individual API mo dules for better organization
export const authApi = {
  login: (credentials: LoginForm) => apiService.login(credentials),
  register: (userData: RegisterForm) => apiService.register(userData),
  getCurrentUser: () => apiService.getCurrentUser(),
  sendOtp: (email: string) => apiService.sendOtp(email),
  verifyOtp: (otpData: OTPForm) => apiService.verifyOtp(otpData),
  checkUserExistence: (email: string) => apiService.checkUserExistence(email),
  adminRegister: (userData: RegisterForm) => apiService.adminRegister(userData),
  forgotPassword: (email: string) => apiService.forgotPassword(email),
  resetPassword: (email: string, otp: string, newPassword: string) => apiService.resetPassword(email, otp, newPassword),
  adminResetPassword: (userEmail: string, newPassword: string) => apiService.adminResetPassword(userEmail, newPassword),
  // Account management
  getAccountInfo: () => apiService.getAccountInfo(),
  deactivateAccount: (password: string, reason?: string) => apiService.deactivateAccount(password, reason),
  initiateAccountDeletion: (password: string, confirmation: string) => apiService.initiateAccountDeletion(password, confirmation),
  deleteAccount: (otp: string) => apiService.deleteAccount(otp),
  reactivateAccount: (email: string, password: string) => apiService.reactivateAccount(email, password),
};

export const projectsApi = {
  getAll: () => apiService.getProjects(),
  getById: (id: string) => apiService.getProject(id),
  create: (data: ProjectForm) => apiService.createProject(data),
  update: (id: string, data: Partial<ProjectForm>) => apiService.updateProject(id, data),
  delete: (id: string) => apiService.deleteProject(id),
  train: (id: string) => apiService.trainProject(id),
  getAnalytics: (id: string) => apiService.getProjectAnalytics(id),
  // Enhanced model training
  selectModelType: (id: string, modelType: 'basic' | 'medium' | 'advanced') => apiService.selectModelType(id, modelType),
  trainBasic: (id: string) => apiService.trainBasicModel(id),
  trainMedium: (id: string) => apiService.trainMediumModel(id),
  trainAdvanced: (id: string) => apiService.trainAdvancedModel(id),
  getModelStatus: (id: string) => apiService.getProjectModelStatus(id),
  getTrainingProgress: (id: string) => apiService.getTrainingProgress(id),
};

export const intentsApi = {
  getAll: (projectId: string) => apiService.getIntents(projectId),
  create: (projectId: string, intent: IntentForm) => apiService.addIntent(projectId, intent),
  update: (projectId: string, tag: string, intent: Partial<IntentForm>) =>
    apiService.updateIntent(projectId, tag, intent),
  delete: (projectId: string, tag: string) => apiService.deleteIntent(projectId, tag),
  upload: (projectId: string, file: File) => apiService.uploadIntents(projectId, file),
  import: (projectId: string, file: File) => apiService.importIntents(projectId, file),
};

export const chatApi = {
  sendMessage: (projectId: string, message: ChatMessage) => apiService.sendMessage(projectId, message),
  // Model-specific chat
  chatBasic: (projectId: string, message: ChatMessage) => apiService.chatWithBasicModel(projectId, message),
  chatMedium: (projectId: string, message: ChatMessage) => apiService.chatWithMediumModel(projectId, message),
  chatAdvanced: (projectId: string, message: ChatMessage) => apiService.chatWithAdvancedModel(projectId, message),
  chatAuto: (projectId: string, message: ChatMessage) => apiService.chatWithAutoModel(projectId, message),
  compareModels: (projectId: string, message: ChatMessage) => apiService.compareModels(projectId, message),
};

export const widgetApi = {
  getConfig: (projectId: string) => apiService.getWidgetConfig(projectId),
  updateConfig: (projectId: string, config: Partial<WidgetConfig>) =>
    apiService.updateWidgetConfig(projectId, config),
  generateEmbed: (projectId: string, config: Partial<WidgetConfig>) =>
    apiService.generateEmbedCode(projectId, config),
  getPreview: (projectId: string) => apiService.getWidgetPreview(projectId),
  uploadIcon: (projectId: string, file: File) => apiService.uploadWidgetIcon(projectId, file),
};

export const systemApi = {
  getStatus: () => apiService.getSystemStatus(),
  getHealth: () => apiService.getHealth(),
  getDashboardStats: () => apiService.getDashboardStats(),
  getAvailableModels: () => apiService.getAvailableModels(),
};

export const feedbackApi = {
  getStats: () => apiService.getDashboardStats(), // Using existing dashboard stats for now
  getForProject: (projectId: string) => apiService.getFeedbackForProject(projectId),
  submitFeedback: (projectId: string, feedbackData: any) => apiService.submitFeedback(projectId, feedbackData),
};

export const predictionApi = {
  predict: (file: File, projectId?: string) => apiService.predictImage(file, projectId),
  getHistory: (limit?: number) => apiService.getPredictionHistory(limit),
};

// Payment APIs
export const paymentApi = {
  // Payment endpoints
  createPayment: (data: any) => apiService.createPayment(data),
  initiatePaytmPayment: (data: any) => apiService.initiatePaytmPayment(data),
  getPayment: (paymentId: string) => apiService.getPayment(paymentId),
  getUserPayments: () => apiService.getUserPayments(),
  getProjectPayments: (projectId: string) => apiService.getProjectPayments(projectId),
  refundPayment: (paymentId: string) => apiService.refundPayment(paymentId),
  cancelPayment: (orderId: string) => apiService.cancelPayment(orderId),
  testEmail: () => apiService.testEmail(),

  // Subscription endpoints
  createSubscription: (data: any) => apiService.createSubscription(data),
  getSubscription: (subscriptionId: string) => apiService.getSubscription(subscriptionId),
  getUserSubscriptions: () => apiService.getUserSubscriptions(),
  getProjectSubscription: (projectId: string) => apiService.getProjectSubscription(projectId),
  updateSubscription: (subscriptionId: string, data: any) => apiService.updateSubscription(subscriptionId, data),
  cancelSubscription: (subscriptionId: string) => apiService.cancelSubscription(subscriptionId),
  cancelProjectSubscription: (projectId: string) => apiService.cancelProjectSubscription(projectId),

  // Invoice endpoints
  createInvoice: (data: any) => apiService.createInvoice(data),
  getInvoice: (invoiceId: string) => apiService.getInvoice(invoiceId),
  getUserInvoices: () => apiService.getUserInvoices(),
  payInvoice: (invoiceId: string) => apiService.payInvoice(invoiceId),
  updateInvoice: (invoiceId: string, data: any) => apiService.updateInvoice(invoiceId, data),
  downloadInvoice: (invoiceId: string) => apiService.downloadInvoice(invoiceId),

  // Order endpoints
  createOrder: (data: any) => apiService.createOrder(data),
  getOrder: (orderId: string) => apiService.getOrder(orderId),
  getUserOrders: () => apiService.getUserOrders(),
  updateOrderStatus: (orderId: string, data: any) => apiService.updateOrderStatus(orderId, data),
  cancelOrder: (orderId: string) => apiService.cancelOrder(orderId),

  // Paid Projects endpoints
  getPaidProjects: () => apiService.getPaidProjects(),
};

export default apiService;