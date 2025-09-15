import axios from 'axios';
// Asegúrate de que esta importación sea correcta y use llaves si es una exportación nombrada
import { supabase } from './supabaseClient'; 

// CAMBIO: Añadimos una URL de respaldo directamente en el código.
// Esto hace que la configuración sea más robusta.
const baseURL = import.meta.env.VITE_API_URL || 'https://sun-self-backend.onrender.com';

const apiClient = axios.create({baseURL: baseURL, headers: {'Content-Type': 'application/json'}});

// Función para sincronizar la sesión de Supabase
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    config.headers['X-Client-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// --- FUNCIONES EXISTENTES (usando apiClient) ---
const register = (userData) => { return apiClient.post('/api/auth/register', userData); };
const login = (credentials) => { return apiClient.post('/api/auth/login', credentials); };
const getMe = () => { return apiClient.get('/api/auth/me'); };
const getRegistros = () => { return apiClient.get('/api/registros'); };
const getRegistroDeHoy = () => { return apiClient.get('/api/registros/today'); };
const getMetasHoy = () => apiClient.get('/api/metas/today');
const saveRegistro = (payload) => { return apiClient.post('/api/registros', payload); };
const getRegistroById = (id) => { return apiClient.get(`/api/registros/${id}`); };
const saveHojaAtras = (id, texto) => { return apiClient.put(`/api/registros/${id}/hoja_atras`, { texto }); };
const generarFraseInteligente = (payload) => { return apiClient.post('/api/sunny/generar-frase', payload); };
const postToSunny = (payload) => { return apiClient.post('/api/sunny', payload); };
const getMuroEstados = () => { return apiClient.get('/api/muro/estados'); };
const getInspiracion = (orbe) => { return apiClient.get(`/api/inspiracion?orbe=${orbe}`); };
const forgotPassword = (payload) => apiClient.post('/api/auth/forgot-password', payload);
const updatePassword = (payload) => apiClient.post('/api/auth/update-password', payload);
const getChartData = (filter) => {return apiClient.get(`/api/registros/chart-data?filter=${filter}`);};
const getRegistroPorFecha = (fecha) => apiClient.get(`/api/registros/fecha/${fecha}`);

// --- NUEVAS FUNCIONES PARA MINI-METAS (AHORA USANDO apiClient) ---

// Llama a: GET /api/minimetas/for-registro/:registroId
const getMiniMetas = (registroId) => {
    // No necesita 'await' aquí, apiClient devuelve la promesa
    return apiClient.get(`/api/minimetas/for-registro/${registroId}`);
};

// Llama a: POST /api/minimetas
const createMiniMeta = (payload) => {
    // El payload debe ser un objeto: { descripcion, registro_id }
    return apiClient.post('/api/minimetas', payload);
};

// Llama a: PATCH /api/minimetas/:id
const updateMiniMetaStatus = (miniMetaId, completada) => {
    // El payload es: { completada: true/false }
    return apiClient.patch(`/api/minimetas/${miniMetaId}`, { completada });
};

// Llama a: DELETE /api/minimetas/:id
const deleteMiniMeta = (miniMetaId) => {
    return apiClient.delete(`/api/minimetas/${miniMetaId}`);
};

// --- EXPORTACIÓN UNIFICADA ---
const api = { 
  register, 
  login, 
  getMe, 
  getRegistros, 
  getRegistroDeHoy, 
  saveRegistro, 
  getRegistroById, 
  saveHojaAtras,
  generarFraseInteligente,
  postToSunny,
  getMuroEstados,
  getInspiracion,
  getChartData,
  forgotPassword,
  updatePassword,
  getMiniMetas,
  createMiniMeta,
  updateMiniMetaStatus,
  deleteMiniMeta,
  getRegistroPorFecha,
  getMetasHoy,
};

export default api;
