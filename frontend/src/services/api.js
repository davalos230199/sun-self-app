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
    config.headers['X-Client-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- FUNCIONES EXISTENTES ---
export const register = (userData) => { return apiClient.post('/api/auth/register', userData); };
export const login = (credentials) => { return apiClient.post('/api/auth/login', credentials); };
export const getMe = () => { return apiClient.get('/api/auth/me'); };
export const getRegistros = () => { return apiClient.get('/api/registros'); };
export const getRegistroDeHoy = () => { return apiClient.get('/api/registros/today'); };
export const saveRegistro = (payload) => { return apiClient.post('/api/registros', payload); };
export const getRegistroById = (id) => { return apiClient.get(`/api/registros/${id}`); };
export const saveHojaAtras = (id, texto) => { return apiClient.put(`/api/registros/${id}/hoja_atras`, { texto }); };
export const generarFraseInteligente = (payload) => { return apiClient.post('/api/sunny/generar-frase', payload); };
export const postToSunny = (payload) => { return apiClient.post('/api/sunny', payload); };
export const getMuroEstados = () => { return apiClient.get('/api/muro/estados'); };
export const getInspiracion = (orbe) => { return apiClient.get(`/api/inspiracion?orbe=${orbe}`); };
export const forgotPassword = (payload) => apiClient.post('/api/auth/forgot-password', payload);

// --- CAMBIO: NUEVA FUNCIÓN PARA LOS DATOS DEL GRÁFICO ---
export const getChartData = (filter) => {
  // Pasamos el filtro como un query param
  return apiClient.get(`/api/registros/chart-data?filter=${filter}`);
};

// --- CAMBIO: AÑADIMOS LA NUEVA FUNCIÓN AL OBJETO API ---
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
  forgotPassword // <-- Añadir aquí // <-- Exportamos la nueva función
};

export default api;
