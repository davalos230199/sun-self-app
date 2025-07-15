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

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />
    },
    {
        path: '/',
        element: <GuestRoute />,
        children: [
            { path: '/login', element: <Auth /> },
            { path: '/register', element: <Auth /> },
            // CAMBIO: La ruta para actualizar la contraseña ahora vive aquí,
            // dentro de las rutas para invitados. Esto evita que ProtectedRoute
            // se ejecute y queme el token.
            { path: '/update-password', element: <UpdatePassword /> }
        ]
    },
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            { path: '/home', element: <Home /> },
            { path: '/tracking', element: <Tracking /> },
            { path: '/sunny', element: <Sunny /> },
            { path: '/muro', element: <MuroDeSoles /> },
            { path: '/settings', element: <Settings /> },
            { path: '/journal/:id', element: <Journal /> }
        ]
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
