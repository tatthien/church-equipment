import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),
  me: () => api.get('/api/auth/me'),
};

// Departments API
export const departmentsApi = {
  getAll: (params?: { page?: number; limit?: number }) => api.get('/api/departments', { params }),
  getById: (id: string) => api.get(`/api/departments/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post('/api/departments', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/api/departments/${id}`, data),
  delete: (id: string) => api.delete(`/api/departments/${id}`),
};

// Brands API
export const brandsApi = {
  getAll: (params?: { page?: number; limit?: number }) => api.get('/api/brands', { params }),
  create: (data: { name: string; description?: string }) =>
    api.post('/api/brands', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/api/brands/${id}`, data),
  delete: (id: string) => api.delete(`/api/brands/${id}`),
};

// Equipment API
export const equipmentApi = {
  getAll: (params?: { status?: string; department_id?: number; brand_id?: number; search?: string }) =>
    api.get('/api/equipment', { params }),
  getById: (id: string) => api.get(`/api/equipment/${id}`),
  create: (data: {
    name: string;
    brandId?: string | null;
    purchaseDate?: string;
    status?: string;
    departmentId?: string | null;
  }) => api.post('/api/equipment', data),
  update: (
    id: number,
    data: {
      name?: string;
      brandId?: number | null;
      purchaseDate?: string;
      status?: string;
      departmentId?: number;
    }
  ) => api.put(`/api/equipment/${id}`, data),
  delete: (id: string) => api.delete(`/api/equipment/${id}`),
  getQRCode: (id: string) => api.get(`/api/equipment/${id}/qrcode`),
};

export const publicApi = {
  getEquipment: (id: string) => api.get(`/api/public/equipment/${id}`),
};

export default api;
