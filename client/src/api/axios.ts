import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('coffee_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Сессия устарела или токен недействителен. Перенаправление на вход.');

      localStorage.removeItem('coffee_token');
      localStorage.removeItem('coffee_user');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
