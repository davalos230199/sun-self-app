import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function GuestRoute() {
    const { user, loading } = useAuth();
    const location = useLocation(); // Obtenemos la ubicación actual, incluyendo el #hash

    // Si todavía estamos verificando la sesión inicial, no hacemos nada
    if (loading) {
        return null;
    }

    // CAMBIO DEFINITIVO: La condición para redirigir ahora es a prueba de fallos.
    // Redirigimos a /home SOLAMENTE si:
    // 1. Hay un usuario.
    // 2. Y la URL NO contiene la señal 'type=recovery', que es única del flujo de cambio de contraseña.
    if (user && !location.hash.includes('type=recovery')) {
        return <Navigate to="/home" replace />;
    }

    // En cualquier otro caso (sin usuario, o durante la recuperación de contraseña),
    // se muestra la página que corresponde.
    return <Outlet />;
}
