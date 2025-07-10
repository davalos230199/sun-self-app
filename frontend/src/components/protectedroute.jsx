// frontend/src/components/protectedroute.jsx
import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

// Creamos una instancia de API aquí para que el guardián sea autónomo
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // Guardaremos los datos del usuario aquí

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Añadimos el token a la cabecera para esta petición
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        // El guardián llama a /api/auth/me para verificar el token
        const response = await api.get('/api/auth/me');
        setIsAuthenticated(true);
        setUser(response.data.user); // Guardamos al usuario verificado
      } catch (error) {
        // Si hay un error, el token es inválido. Lo borramos.
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        // Pase lo que pase, terminamos de cargar
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 1. Mientras verificamos, mostramos un mensaje de carga
  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Verificando tu sesión...</div>;
  }

  // 2. Si terminó de cargar y no está autenticado, lo enviamos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. ¡Éxito! Mostramos la página solicitada (Home, etc.)
  // y le pasamos los datos del usuario a través del "contexto" del Outlet.
  return <Outlet context={{ user }} />;
}
