// frontend/src/components/GuestRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';

export default function GuestRoute() {
  const token = localStorage.getItem('token');

  // Si SÍ hay un token, redirigimos a la página de inicio
  if (token) {
    return <Navigate to="/home" replace />;
  }

  // Si NO hay token, dejamos que el usuario vea la página (ej: Login)
  return <Outlet />;
}