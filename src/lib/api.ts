import axios from 'axios';

// In production, this should come from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // Check if we are in the browser
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to unwrap API envelope and handle errors
api.interceptors.response.use(
    (response) => {
        // Unwrap the { success, data, timestamp } envelope from TransformInterceptor
        if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
            response.data = response.data.data;
        }
        return response;
    },
    async (error) => {
        // If 401, redirect to login
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
