import axios from 'axios';
import store from '../store'; // importer le store directement
import { useAuthStore } from '../stores/auth';

const url = import.meta.env.VITE_APP_LOCAL === 'true'
  ? import.meta.env.VITE_API_BASE_URL_LOCAL
  : import.meta.env.VITE_API_BASE_URL;

// Créer une instance axios
const apiClient = axios.create({
  baseURL: url,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
  timeout: 10000,
});

// Intercepteur de requête
apiClient.interceptors.request.use(
  (config) => {
    store.commit('SET_LOADING', true);
    // Align with auth store which saves token under 'token'
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    store.commit('SET_LOADING', false);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
apiClient.interceptors.response.use(
  (response) => {
    store.commit('SET_LOADING', false);
    return response.data;
  },
  (error) => {
    store.commit('SET_LOADING', false);
    if (error.response) {
      console.error('Response error:', error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        const authStore = useAuthStore();
        const hasToken = !!(authStore?.token || localStorage.getItem('token'));
        if (hasToken) {
          authStore.logout();
        }
      }

    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default {
  get(resource, paramsOrConfig = {}) {
    // If the argument already contains a 'params' key, treat it as an axios config object.
    // Otherwise, treat it as the query parameters themselves and wrap it in a 'params' key.
    const config = paramsOrConfig.params ? paramsOrConfig : { params: paramsOrConfig };
    return apiClient.get(resource, config);
  },

  post(resource, data, config = {}) {
    return apiClient.post(resource, data, config);
  },

  put(resource, data) {
    return apiClient.put(resource, data);
  },

  patch(resource, data) {
    return apiClient.patch(resource, data);
  },

  delete(resource) {
    return apiClient.delete(resource);
  },

  setAuthToken(token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  clearAuthToken() {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};
