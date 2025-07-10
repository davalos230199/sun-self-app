// frontend/src/components/protectedroute.jsx
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import AppLayout from './AppLayout';

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // 1. Necesitamos el estado del usuario aquí para poder pasarlo hacia abajo.
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.getMe();
        setIsAuthenticated(true);
        // 2. Guardamos los datos del usuario cuando la verificación es exitosa.
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Verificando tu sesión...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. ¡AQUÍ ESTÁ EL ARREGLO! Pasamos los datos del usuario como una prop a nuestro AppLayout.
  return <AppLayout user={user} />;
}
