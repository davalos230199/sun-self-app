
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');

  // Si no hay token, redirigimos al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  // Si hay token, mostramos la página que el usuario quería ver.
  // <Outlet /> es el marcador de posición para la página hija (Home, Tracking, etc.)
  return <Outlet />;
}