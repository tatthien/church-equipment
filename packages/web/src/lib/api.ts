import axios from 'axios'
import {
  LoginRequest, LoginResponse, UserResponse,
  BrandResponse, CreateBrandRequest,
  DepartmentResponse, CreateDepartmentRequest,
  EquipmentResponse, CreateEquipmentRequest,
} from '@/types/schemas'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/auth/login', data),
  me: () => api.get<UserResponse>('/api/auth/me'),
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Departments API
export const departmentsApi = {
  getAll: (params?: { page?: number; limit?: number }) => api.get<PaginatedResponse<DepartmentResponse>>('/api/departments', { params }),
  getById: (id: string) => api.get<DepartmentResponse>(`/api/departments/${id}`),
  create: (data: CreateDepartmentRequest) =>
    api.post<DepartmentResponse>('/api/departments', data),
  update: (id: string, data: Partial<CreateDepartmentRequest>) =>
    api.put<DepartmentResponse>(`/api/departments/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/api/departments/${id}`),
}

// Brands API
export const brandsApi = {
  getAll: (params?: { page?: number; limit?: number }) => api.get<PaginatedResponse<BrandResponse>>('/api/brands', { params }),
  create: (data: CreateBrandRequest) =>
    api.post<BrandResponse>('/api/brands', data),
  update: (id: string, data: Partial<CreateBrandRequest>) =>
    api.put<BrandResponse>(`/api/brands/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/api/brands/${id}`),
}

// Equipment API
export const equipmentApi = {
  getAll: (params?: { status?: string; departmentId?: string; brandId?: string; search?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<EquipmentResponse>>('/api/equipment', { params }),
  getById: (id: string) => api.get<EquipmentResponse>(`/api/equipment/${id}`),
  create: (data: CreateEquipmentRequest) => api.post<void>('/api/equipment', data),
  update: (
    id: string,
    data: Partial<CreateEquipmentRequest>,
  ) => api.put<void>(`/api/equipment/${id}`, data),
  delete: (id: string) => api.delete<void>(`/api/equipment/${id}`),
  getQRCode: (id: string) => api.get<{ qrCode: string }>(`/api/equipment/${id}/qrcode`),
}

export const publicApi = {
  getEquipment: (id: string) => api.get<EquipmentResponse & { brand_name?: string; department_name?: string }>(`/api/public/equipment/${id}`),
}

export default api
