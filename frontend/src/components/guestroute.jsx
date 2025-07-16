// src/components/guestroute.jsx (Código completo)

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // <-- Usa nuestro hook

export default function GuestRoute() {
    const { user, loading } = useAuth(); // Obtiene el usuario y el estado de carga del contexto
    const location = useLocation();

    // Si aún estamos verificando la sesión inicial, no mostramos nada para evitar redirecciones incorrectas
    if (loading) {
        return null; // O un componente de carga si lo prefieres
    }

    // Si hay un usuario y NO está en la página de cambiar contraseña, lo redirigimos a home
    if (user && location.pathname !== '/update-password') {
        return <Navigate to="/home" replace />;
    }

    // De lo contrario, muestra la página de invitado (Login, Register, UpdatePassword)
    return <Outlet />;
}