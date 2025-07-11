// frontend/src/services/api.js
import axios from 'axios';

// 1. Creamos la instancia de Axios UNA SOLA VEZ en toda la aplicación.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 2. Usamos el interceptor para inyectar el token en cada petición.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Creamos y exportamos una función para cada endpoint de nuestro backend.
// Los componentes llamarán a estas funciones en lugar de usar axios directamente.

// --- Funciones de Autenticación ---
export const register = (userData) => {
  return apiClient.post('/api/auth/register', userData);
};

export const login = (credentials) => {
  return apiClient.post('/api/auth/login', credentials);
};

export const getMe = () => {
  return apiClient.get('/api/auth/me');
};

// --- Funciones de Registros ---
export const getRegistros = () => {
  return apiClient.get('/api/registros');
};

export const getRegistroDeHoy = () => {
  return apiClient.get('/api/registros/today');
};

export const saveRegistro = (estados) => {
  return apiClient.post('/api/registros', estados);
};

// --- Nueva Función para "La Hoja de Atrás" ---
export const saveHojaAtras = (id, texto) => {
  return apiClient.put(`/api/registros/${id}/hoja_atras`, { texto });
};

// --- Nueva Función para obtener un solo registro hoja de atras ---
export const getRegistroById = (id) => {
  return apiClient.get(`/api/registros/${id}`);
};

// --- Funciones de Sunny ---
export const postToSunny = (message) => {
  return apiClient.post('/api/sunny', { message });
};

// Exportamos un objeto con todas nuestras funciones para que sea fácil de importar.
const api = {
  register,
  login,
  getMe,
  getRegistros,
  getRegistroDeHoy,
  saveRegistro,
  postToSunny,
  saveHojaAtras,
  getRegistroById,
};

export default api;
