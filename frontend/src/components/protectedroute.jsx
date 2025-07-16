import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // 1. Usamos el hook de nuestro nuevo contexto
import AppLayout from './AppLayout'; // 2. Importamos tu componente de layout

export default function ProtectedRoute() {
    // 3. Obtenemos el usuario y el estado de carga del contexto global
    const { user, loading } = useAuth();

    // Si todavía estamos verificando la sesión, no mostramos nada para evitar parpadeos
    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Verificando tu sesión...</div>;
    }

    // Si, después de cargar, no hay usuario, redirigimos al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 4. ¡AQUÍ ESTÁ LA MAGIA! Si hay un usuario, renderizamos tu AppLayout
    //    y le pasamos la información del usuario, restaurando todo el diseño.
    return <AppLayout user={user} />;
}
