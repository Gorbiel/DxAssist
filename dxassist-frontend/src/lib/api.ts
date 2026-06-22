// src/lib/api.ts
import axios from 'axios';

// Adres backendu - dla przeglądarki używamy localhost:8000
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor dodający token Bearer do każdego żądania
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor obsługujący wygasły token (Refresh Token Logic)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jeśli błąd to 401 i nie próbowaliśmy jeszcze odświeżać
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error("No refresh token available");

        // Strzał po nowy access token
        const res = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = res.data;
        localStorage.setItem('access_token', access);

        // Ponów oryginalne zapytanie z nowym tokenem
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Jeśli refresh też zawiedzie - wyloguj
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;