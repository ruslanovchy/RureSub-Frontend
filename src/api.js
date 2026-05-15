import axios from 'axios';
import { globalNavigate } from './App';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

export const refreshApi = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(response => response, async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            const { data } = await refreshApi.post('auth/refresh');

            localStorage.setItem('accessToken', data.token);
            originalRequest.headers.Authorization = `Bearer ${data.token}`

            return api(originalRequest);
        }
        catch (refreshError) {
            globalNavigate('/');
            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
});