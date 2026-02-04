import axios, { AxiosInstance, AxiosError } from 'axios';

// Get backend URL from environment variable
const getBackendUrl = (): string => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Use empty string (relative URL) for Vite proxy in local development
  if (backendUrl && backendUrl.trim() !== '') {
    return backendUrl;
  }
  if (apiUrl && apiUrl.trim() !== '') {
    return apiUrl;
  }
  // Use empty string for local development (uses Vite proxy)
  return '';
};

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: getBackendUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const logApi = (level: 'log' | 'error', message: string, meta?: unknown) => {
  if (meta !== undefined) {
    console[level](`[api] ${message}`, meta);
  } else {
    console[level](`[api] ${message}`);
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const method = (config.method || 'GET').toUpperCase();
    logApi('log', `${method} ${config.baseURL || ''}${config.url || ''}`, {
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    logApi('error', 'Request setup error', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    logApi('log', `Response ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      localStorage.removeItem('authToken');
      // Could emit a logout event here
    }
    logApi('error', `Response error ${error.response?.status || 'UNKNOWN'} ${error.config?.url || ''}`, {
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Helper function for GET requests
export const get = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const response = await api.get<T>(url, { params });
  return response.data;
};

// Helper function for POST requests
export const post = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await api.post<T>(url, data);
  return response.data;
};

// Helper function for PATCH requests
export const patch = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await api.patch<T>(url, data);
  return response.data;
};

// Helper function for DELETE requests
export const del = async <T>(url: string): Promise<T> => {
  const response = await api.delete<T>(url);
  return response.data;
};

export default api;
