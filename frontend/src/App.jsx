// frontend/src/App.jsx

import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from 'react-router-dom';

// Pages
import LoginScene from './pages/loginscene';
import Home from './pages/home';
import Tracking from './pages/tracking';
import Couch from './pages/couch';
import Register from './pages/register'; // <-- 1. Importa la página de registro

// Route Components
import ProtectedRoute from './components/protectedroute';
import GuestRoute from './components/guestroute'; // <-- 1. Importa el nuevo guardián

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    // 2. Ruta para invitados (no logueados)
    path: '/',
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        element: <LoginScene />
      },
      // 1. Pagina de Registro
      { 
        path: '/register',
        element: <Register />
      }
    ]
  },
  {
    // 3. Ruta para usuarios logueados
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { path: '/home', element: <Home /> },
      { path: '/tracking', element: <Tracking /> },
      { path: '/couch', element: <Couch /> }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;