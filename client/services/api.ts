import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxied by Next.js
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Helper to get descriptive error messages
export const getErrorMessage = (error: any): string => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        if (error.message.includes('Network Error')) {
            return "Unable to connect to the server. Please check your internet connection.";
        }
        return error.message;
    }
    return "An unexpected error occurred. Please try again later.";
};

export default api;
