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

// 1. Creamos un nuevo componente "inteligente" para la ruta raíz
const RootHandler = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Mientras se verifica la sesión inicial, no hacemos nada para evitar errores
    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Iniciando...</div>;
    }

    // Si detectamos que la URL contiene un token de recuperación de contraseña...
    if (location.hash.includes('type=recovery')) {
        // ...redirigimos al usuario a la página correcta para que pueda cambiar su clave.
        // Navigate preservará el #hash en la URL, que es lo que necesita UpdatePassword.jsx
        return <Navigate to="/update-password" replace />;
    }

    // Si ya hay un usuario logueado, lo mandamos a home
    if (user) {
        return <Navigate to="/home" replace />;
    }

    // En cualquier otro caso (sin usuario, sin token de recuperación), lo mandamos a login
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
            { path: 'muro', element: <MuroDeSoles /> },
            { path: 'settings', element: <Settings /> },
            { path: 'journal/:id', element: <Journal /> },
        ],
    },
    // 2. CAMBIO CLAVE: La ruta raíz ahora usa nuestro nuevo componente "inteligente"
    {
        path: '/',
        element: <RootHandler />,
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
