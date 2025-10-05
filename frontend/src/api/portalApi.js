import axios from 'axios';

const portalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('portal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

portalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('portal_token');
      localStorage.removeItem('portal_user');
      if (!window.location.pathname.startsWith('/portal')) {
        window.location.href = '/portal/login';
      }
    }
    return Promise.reject(error);
  }
);

export default portalApi;
