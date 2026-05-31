import axios from 'axios';

const api = axios.create({
    baseURL: 'https://company-3qjr.onrender.com/api',
});

// Add a request interceptor to include the token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
