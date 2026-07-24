import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('tiffinbox_user');
  if (stored) {
    const user = JSON.parse(stored);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

// Most newer API routes return { success, data }, while a few older routes
// return their payload directly. Keep the UI on one consistent shape.
api.interceptors.response.use((response) => {
  const body = response.data;
  if (body && typeof body === 'object' && body.success === true && 'data' in body) {
    response.data = body.data;
  }
  return response;
});

export default api;
