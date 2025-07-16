import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function GuestRoute() {
    const { user, loading } = useAuth();
    const location = useLocation(); // 1. Obtenemos la ubicación actual

    // Si todavía estamos verificando la sesión inicial, no hacemos nada para evitar redirecciones incorrectas
    if (loading) {
        return null; // O un componente de carga si lo prefieres
    }

    // 2. CAMBIO CLAVE: La condición para redirigir ahora es más inteligente.
    // Redirigimos a /home SOLAMENTE si hay un usuario Y NO estamos en la página de cambiar contraseña.
    if (user && location.pathname !== '/update-password') {
        return <Navigate to="/home" replace />;
    }

    // En cualquier otro caso (sin usuario, o en la página de cambiar contraseña),
    // simplemente muestra la página que corresponde (Login, Register, o UpdatePassword).
    return <Outlet />;
}
