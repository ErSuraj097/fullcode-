import axios from 'axios';
import { Project, Intent, IntentsData, ChatMessage, ChatResponse, TrainingResult, ChatbotConfig } from '../types';



// const apiPort = import.meta.env.VITE_API_PORT || '8000';
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/';

export const projectsApi = {
  // Projects
  getProjects: () => axios.get<Project[]>('/api/v1/projects'),

  createProject: (data: { name: string; type?: string; description?: string }) =>
    axios.post<Project>('/api/v1/projects', data),

  getProject: (id: string) => axios.get<Project>(`/api/v1/projects/${id}`),

  updateProject: (id: string, data: { name?: string; type?: string; description?: string }) =>
    axios.put<Project>(`/api/v1/projects/${id}`, data),

  deleteProject: (id: string) => axios.delete(`/api/v1/projects/${id}`),

  // Intents
  getIntents: (projectId: string) => axios.get<IntentsData>(`/api/v1/projects/${projectId}/intents`),

  addIntent: (projectId: string, intent: Intent) =>
    axios.post<Intent>(`/api/v1/projects/${projectId}/intents`, intent),

  updateIntent: (projectId: string, tag: string, intent: Partial<Intent>) =>
    axios.put(`/api/v1/projects/${projectId}/intents/${tag}`, intent),

  deleteIntent: (projectId: string, tag: string) =>
    axios.delete(`/api/v1/projects/${projectId}/intents/${tag}`),

  // Training
  trainProject: (projectId: string) => axios.post<TrainingResult>(`/api/v1/projects/${projectId}/train`),

  // Chat
  chat: (projectId: string, message: ChatMessage) =>
    axios.post<ChatResponse>(`/api/v1/projects/${projectId}/chat`, message),

  // Configuration
  getConfig: (projectId: string) => axios.get<ChatbotConfig>(`/api/v1/projects/${projectId}/config`),

  updateConfig: (projectId: string, config: ChatbotConfig) =>
    axios.put<ChatbotConfig>(`/api/v1/projects/${projectId}/config`, config),

  // File Import
  importFile: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`/api/v1/projects/${projectId}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Bulk Intent Upload
  uploadIntents: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`/api/v1/projects/${projectId}/upload-intents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Upload widget icon/avatar - NOT USED
  // uploadWidgetIcon: (projectId: string, file: File) => {
  //   const formData = new FormData();
  //   formData.append('icon', file);
  //   return axios.post(`/api/v1/projects/${projectId}/widget/upload-icon`, formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' }
  //   });
  // },

  // Health/Status
  getHealth: () => axios.get('/api/v1/health'),

  // Prediction endpoints
  predict: (image: File, projectId?: string) => {
    const formData = new FormData();
    formData.append('image', image);
    if (projectId) formData.append('project_id', projectId);
    return axios.post('/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getStatus: () => axios.get('/status'),

  getHistory: (limit?: number) => axios.get(`/history${limit ? `?limit=${limit}` : ''}`),

  // Widget endpoints
  getWidgetConfig: (projectId: string) =>
    axios.get(`/api/v1/widget/${projectId}/config`),

  // updateWidgetConfig: (projectId: string, config: any) =>
  //   axios.put(`/api/v1/widget/${projectId}/config`, config),
};
