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
    register: (username: string, password: string, name: string) =>
        api.post('/api/auth/register', { username, password, name }),
    me: () => api.get('/api/auth/me'),
};

// Departments API
export const departmentsApi = {
    getAll: () => api.get('/api/departments'),
    getById: (id: number) => api.get(`/api/departments/${id}`),
    create: (data: { name: string; description?: string }) =>
        api.post('/api/departments', data),
    update: (id: number, data: { name?: string; description?: string }) =>
        api.put(`/api/departments/${id}`, data),
    delete: (id: number) => api.delete(`/api/departments/${id}`),
};

// Brands API
export const brandsApi = {
    getAll: () => api.get('/api/brands'),
    create: (data: { name: string; description?: string }) =>
        api.post('/api/brands', data),
    update: (id: number, data: { name?: string; description?: string }) =>
        api.put(`/api/brands/${id}`, data),
    delete: (id: number) => api.delete(`/api/brands/${id}`),
};

// Equipment API
export const equipmentApi = {
    getAll: (params?: { status?: string; department_id?: number; brand_id?: number; search?: string }) =>
        api.get('/api/equipment', { params }),
    getById: (id: number) => api.get(`/api/equipment/${id}`),
    create: (data: {
        name: string;
        brand_id?: number | null;
        purchase_date?: string;
        status?: string;
        department_id?: number;
    }) => api.post('/api/equipment', data),
    update: (
        id: number,
        data: {
            name?: string;
            brand_id?: number | null;
            purchase_date?: string;
            status?: string;
            department_id?: number;
        }
    ) => api.put(`/api/equipment/${id}`, data),
    delete: (id: number) => api.delete(`/api/equipment/${id}`),
    getQRCode: (id: number) => api.get(`/api/equipment/${id}/qrcode`),
};

export const publicApi = {
    getEquipment: (id: number) => api.get(`/api/public/equipment/${id}`),
};

export default api;
