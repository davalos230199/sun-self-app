import axios from 'axios';
// Asegúrate de que esta importación sea correcta y use llaves si es una exportación nombrada
import { supabase } from './supabaseClient'; 

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// --- SOLUCIÓN DE AUTENTICACIÓN ---
// Esta función se asegura de que el cliente de Supabase conozca al usuario.
const ensureSupabaseAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Le decimos al cliente de Supabase: "Este es el token del usuario actual".
        // Esto sincroniza la sesión entre tu backend y Supabase.
        const { error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: '' // No es necesario para RPC si el access_token es válido
        });
        if (error) {
            console.error('Error al sincronizar la sesión con Supabase:', error);
        }
    }
};

// ... (tu interceptor de axios sin cambios)
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


// --- NUEVAS FUNCIONES PARA MINI-METAS (usando supabase directamente) ---
const getMiniMetas = async (registroId) => {
    await ensureSupabaseAuth(); // Sincronizamos la sesión ANTES de la llamada.
    const { data, error } = await supabase.rpc('get_mini_metas_for_registro', { registro_id_in: registroId });
    if (error) { console.error('Error al obtener mini-metas:', error); throw error; }
    return data;
};

// La función ahora acepta y pasa el 'userId'.
const createMiniMeta = async (descripcion, horaObjetivo, registroId, userId) => {
    await ensureSupabaseAuth(); // Sincronizamos la sesión ANTES de la llamada.
    const { error } = await supabase.rpc('create_mini_meta', { 
        descripcion_in: descripcion, 
        hora_objetivo_in: horaObjetivo, 
        registro_id_in: registroId,
        user_id_in: userId
    });
    if (error) { console.error('Error al crear la mini-meta:', error); throw error; }
    return true;
};

const updateMiniMetaStatus = async (miniMetaId, completada) => {
    await ensureSupabaseAuth(); // Sincronizamos la sesión ANTES de la llamada.
    const { error } = await supabase.rpc('update_mini_meta_status', { mini_meta_id_in: miniMetaId, completada_in: completada });
    if (error) { console.error('Error al actualizar la mini-meta:', error); throw error; }
    return true;
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
  updateMiniMetaStatus
};

export default api;
