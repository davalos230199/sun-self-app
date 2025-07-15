import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Auth from './pages/Auth'; // <-- CAMBIO: Importamos el nuevo componente unificado
import Home from './pages/home';
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
      // CAMBIO: Ambas rutas ahora apuntan al mismo componente Auth
      { path: '/login', element: <Auth /> },
      { path: '/register', element: <Auth /> }
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
      { path: '/journal/:id', element: <Journal /> },
      { path: '/update-password', element: <UpdatePassword />}
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
