import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Tracking from './pages/Tracking';
import Sunny from './pages/Sunny';
import Settings from './pages/Settings';
import ProtectedRoute from './components/protectedroute';
import GuestRoute from './components/guestroute';
import Journal from './pages/Journal';
import MuroDeSoles from './pages/MuroDeSoles';
import UpdatePassword from './pages/UpdatePassword';
import MiniMetasPage from './pages/MiniMetasPage'; 
import Filosofia from './pages/Filosofia';
import ResumenDia from './pages/ResumenDia';

const RootHandler = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [isRecovery, setIsRecovery] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (location.hash.includes('type=recovery')) {
            setIsRecovery(true);
        }
        setHasChecked(true);
    }, [location.hash]); // Se ejecuta si el hash de la URL cambia

    // Mientras se verifica la sesión inicial o el hash, mostramos un estado de carga
    if (loading || !hasChecked) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Iniciando...</div>;
    }

    // Si es un flujo de recuperación, renderizamos el componente y detenemos cualquier otra lógica
    if (isRecovery) {
        return <UpdatePassword />;
    }

    // Si hay un usuario (y no es un flujo de recuperación), lo llevamos a home
    if (user) {
        return <Navigate to="/home" replace />;
    }

    // Por defecto, si no hay usuario ni es recuperación, va al login
    return <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
    // Grupo de rutas para invitados (usuarios no autenticados)
    {
        element: <GuestRoute />,
        children: [
            { path: 'login', element: <Auth /> },
            { path: 'register', element: <Auth /> },
            { path: 'update-password', element: <UpdatePassword /> },
        ],
    },
    // Grupo de rutas protegidas (usuarios autenticados)
    {
        element: <ProtectedRoute />,
        children: [
            { path: 'home', element: <Home /> },
            { path: 'tracking', element: <Tracking /> },
            { path: 'sunny', element: <Sunny /> },
            { path: 'settings', element: <Settings /> },
            { path: 'journal/:id', element: <Journal /> },
            { path: 'muro', element: <MuroDeSoles /> },
            { path: 'metas', element: <MiniMetasPage /> },
            { path: 'filosofia', element: <Filosofia /> },
            { path: 'resumen/:fecha', element: <ResumenDia /> },
        ],
    },
    // La ruta raíz ahora usa nuestro nuevo componente "inteligente"
    {
        path: '/',
        element: <RootHandler />,
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
