// frontend/src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // CLAVE: Usamos la API de Internacionalización para obtener el nombre de la zona horaria.
    // Es mucho más preciso que el simple offset.
    config.headers['X-Client-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// El resto del archivo no cambia
export const register = (userData) => { return apiClient.post('/api/auth/register', userData); };
export const login = (credentials) => { return apiClient.post('/api/auth/login', credentials); };
export const getMe = () => { return apiClient.get('/api/auth/me'); };
export const getRegistros = () => { return apiClient.get('/api/registros'); };
export const getRegistroDeHoy = () => { return apiClient.get('/api/registros/today'); };
export const saveRegistro = (payload) => { return apiClient.post('/api/registros', payload); };
export const getRegistroById = (id) => { return apiClient.get(`/api/registros/${id}`); };
export const saveHojaAtras = (id, texto) => { return apiClient.put(`/api/registros/${id}/hoja_atras`, { texto }); };
const api = { register, login, getMe, getRegistros, getRegistroDeHoy, saveRegistro, getRegistroById, saveHojaAtras };
export default api;
