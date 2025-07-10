// frontend/src/App.jsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from './pages/Login'; // <-- Directo a Login
import Register from './pages/Register'; // <-- Directo a Register
import Home from './pages/home';
import Tracking from './pages/Tracking';
import Sunny from './pages/Sunny';
import Settings from './pages/Settings'; // <-- Importamos la nueva página
import ProtectedRoute from './components/protectedroute';
import GuestRoute from './components/guestroute';
import Journal from './pages/Journal'; // <-- Importamos la nueva página

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/',
    element: <GuestRoute />,
    children: [
      // Eliminamos LoginScene, ahora las rutas son limpias
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { path: '/home', element: <Home /> },
      { path: '/tracking', element: <Tracking /> },
      { path: '/sunny', element: <Sunny /> },
      { path: '/settings', element: <Settings /> }, // <-- Añadimos la nueva ruta
      { path: '/journal/:id', element: <Journal /> } // <-- AÑADIMOS LA NUEVA RUTA
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
