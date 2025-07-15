import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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

// CAMBIO: Se reestructura el router para ser más claro y evitar conflictos.
// Ahora hay un grupo para rutas de invitados y otro para rutas protegidas.
const router = createBrowserRouter([
    // Grupo de rutas para invitados (usuarios no autenticados)
    {
        element: <GuestRoute />,
        children: [
            {
                path: 'login',
                element: <Auth />,
            },
            {
                path: 'register',
                element: <Auth />,
            },
            {
                path: 'update-password',
                element: <UpdatePassword />,
            },
        ],
    },
    // Grupo de rutas protegidas (usuarios autenticados)
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: 'home',
                element: <Home />,
            },
            {
                path: 'tracking',
                element: <Tracking />,
            },
            {
                path: 'sunny',
                element: <Sunny />,
            },
            {
                path: 'muro',
                element: <MuroDeSoles />,
            },
            {
                path: 'settings',
                element: <Settings />,
            },
            {
                path: 'journal/:id',
                element: <Journal />,
            },
        ],
    },
    // Redirección para la ruta raíz. Debe ir al final para no interferir.
    {
        path: '/',
        element: <Navigate to="/login" replace />,
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
