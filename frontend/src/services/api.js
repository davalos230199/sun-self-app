import axios from 'axios';
import { supabase } from './supabaseClient';

const baseURL = import.meta.env.VITE_API_URL || 'https://sun-self-backend.onrender.com/api';

const apiClient = axios.create({
    baseURL: baseURL,
    headers: {'Content-Type': 'application/json'}
});

apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    config.headers['X-Client-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- FUNCIONES CORREGIDAS (sin el prefijo /api) ---
const getRegistros = () => { return apiClient.get('/registros'); };
const getRegistroDeHoy = () => { return apiClient.get('/registros/today'); };
const getMetasHoy = () => apiClient.get('/metas/today');
const saveRegistro = (payload) => { return apiClient.post('/registros', payload); };
const getRegistroById = (id) => { return apiClient.get(`/registros/${id}`); };
const saveHojaAtras = (id, texto) => { return apiClient.put(`/registros/${id}/hoja_atras`, { texto }); };
const generarFraseInteligente = (payload) => { return apiClient.post('/sunny/generar-frase', payload); };
const postToSunny = (payload) => { return apiClient.post('/sunny', payload); };
const getMuroEstados = () => { return apiClient.get('/muro/estados'); };
const getInspiracion = (orbe) => { return apiClient.get(`/inspiracion?orbe=${orbe}`); };
const getChartData = (filter) => {return apiClient.get(`/registros/chart-data?filter=${filter}`);};
const getRegistroPorFecha = (fecha) => apiClient.get(`/registros/fecha/${fecha}`);


// --- EXPORTACIÓN UNIFICADA (sin los endpoints de auth manual que ya no existen) ---
const api = { 
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
  getRegistroPorFecha,
  getMetasHoy,
};

export default api;