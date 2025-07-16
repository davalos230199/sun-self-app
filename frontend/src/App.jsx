import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
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

// El componente "inteligente" para la ruta raíz, ahora corregido
const RootHandler = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Iniciando...</div>;
    }

    // CAMBIO CLAVE: En lugar de redirigir, renderizamos el componente directamente.
    // Si la URL contiene la señal de recuperación...
    if (location.hash.includes('type=recovery')) {
        // ...mostramos la página para actualizar la contraseña.
        // Esto preserva la URL completa, incluyendo el token en el hash.
        return <UpdatePassword />;
    }

    // La lógica de redirección normal se mantiene para los otros casos.
    if (user) {
        return <Navigate to="/home" replace />;
    }

    return <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
    // Grupo de rutas para invitados (usuarios no autenticados)
    {
        element: <GuestRoute />,
        children: [
            { path: 'login', element: <Auth /> },
            { path: 'register', element: <Auth /> },
            // CAMBIO: Ya no necesitamos esta ruta aquí porque la maneja el RootHandler.
            // La dejamos por si el usuario navega manualmente, pero el flujo principal ya no la usa.
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
