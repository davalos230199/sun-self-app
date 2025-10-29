import axios from 'axios';
import { supabase } from './supabaseClient';

const baseURL = import.meta.env.VITE_API_URL || 'https://sun-self-backend.onrender.com';

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

// --- PRIMERO USUARIO?
const checkRecordsExistence= () => apiClient.get('/registros/check-existence');

// -- REGISTROS --
const getRegistroDeHoy = () => apiClient.get('/registros/today');
const saveRegistro = (payload) => apiClient.post('/registros', payload);
const getRegistroById= (id) => apiClient.get(`/registros/${id}`);
const getHistorialRegistros = () => apiClient.get('/registros/historial');
const getRegistrosByDate= (date) => apiClient.get(`/registros/by-date/${date}`);
const getResumenSemanal= () => apiClient.get('/registros/historial/resumen-semanal');

// -- DIARIO (antes Hoja de Atrás) --
const getDiario = (periodo = 'hoy') => apiClient.get(`/diario?periodo=${periodo}`);
const saveEntradaDiario = (payload) => apiClient.post('/diario', payload);
const deleteEntradaDiario= (id) => apiClient.delete(`/diario/${id}`);
const getDiarioPorRegistro = (registroId) => apiClient.get(`/diario/registro/${registroId}`);

// -- METAS --
const getMetasHoy = () => apiClient.get('/metas/today');
const createMeta = (payload) => apiClient.post('/metas', payload);
const updateMeta = (id, payload) => apiClient.patch(`/metas/${id}`, payload);
const deleteMeta = (id) => apiClient.delete(`/metas/${id}`);
const getMetasStats = () => apiClient.get('/metas/stats');


// -- SUNNY (IA) --
const generarFraseInteligente = (payload) => apiClient.post('/sunny/generar-frase', payload);
const postToSunny = (payload) => { return apiClient.post('/sunny', payload); };

const getChartData = (filter) => {return apiClient.get(`/registros/chart-data?filter=${filter}`);};
const getRegistroPorFecha = (fecha) => apiClient.get(`/registros/fecha/${fecha}`);

//FRASES HEADER
const getFraseHeader = (category) => apiClient.get(`/frases/random?category=${category}`);

//HABITOS PIXELA
  const getHabitos = () => apiClient.get('/habitos');
  const crearHabito = (payload) => apiClient.post('/habitos/crear', payload);
  const logHabito = (graphID) => apiClient.post(`/habitos/log/${graphID}`);

// --- EXPORTACIÓN UNIFICADA (sin los endpoints de auth manual que ya no existen) ---
const api = { 
  checkRecordsExistence,

  getRegistroDeHoy, 
  saveRegistro, 
  getRegistroById, 
  getHistorialRegistros,
  getRegistrosByDate,
  getResumenSemanal,
  
  getDiario,
  saveEntradaDiario,
  deleteEntradaDiario,
  getDiarioPorRegistro, // 🆕 AGREGAMOS LA NUEVA FUNCIÓN AQUÍ
  
  generarFraseInteligente,
  postToSunny,

  getFraseHeader,

  getChartData,
  getRegistroPorFecha,
  
  getMetasHoy,
  createMeta,
  updateMeta,
  deleteMeta,
  getMetasStats,
  
  getHabitos,
  crearHabito,
  logHabito,
};

export default api;