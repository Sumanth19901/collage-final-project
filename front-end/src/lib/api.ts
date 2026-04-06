import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: unknown) => api.post('/auth/register/', data),
  login: (data: unknown) => api.post('/auth/login/', data),
  sendOtp: (email: string) => api.post('/auth/send-otp/', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp/', { email, otp }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: unknown) => api.patch('/auth/profile/', data),
};

export const resumeApi = {
  upload: (formData: FormData) => api.post('/resume/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  analyze: (resumeId: string) => api.post('/resume/analyze/', { resumeId }),
  downloadOptimized: () => api.get('/resume/download-optimized/'),
};

export const skillsApi = {
  getGapAnalysis: () => api.get('/skills/gap-analysis/'),
};

export const roadmapApi = {
  generate: (targetRole: string) => api.get('/roadmap/generate/', { params: { targetRole } }),
};

export const interviewApi = {
  getQuestions: (role: string) => api.get('/interview/mock/', { params: { role } }),
  evaluate: (interviewId: string, answers: unknown) => api.post('/interview/evaluate/', { interviewId, answers }),
};

export const placementApi = {
  predict: () => api.get('/placement/predict/'),
};

export const advancedApi = {
  multimodalInterview: (transcript: string) => api.post('/advanced/interview/', { transcript }),
  contextualEmbeddings: (resume_text: string, job_description: string) => api.post('/advanced/embed/', { resume_text, job_description }),
  agenticTracker: (command: string) => api.post('/advanced/tracker/', { command }),
  shadowAudit: (resume_text: string, linkedin_data: string) => api.post('/advanced/audit/', { resume_text, linkedin_data }),
};

export default api;
