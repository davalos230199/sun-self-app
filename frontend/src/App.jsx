// frontend/src/App.jsx

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Pages
import LoginScene from './pages/loginscene';
import Home from './pages/home';
import Tracking from './pages/tracking';
import Sunny from './pages/Sunny'; // <-- CAMBIADO DE 'Couch' A 'Sunny'
import Register from './pages/register';

// Route Components
import ProtectedRoute from './components/protectedroute';
import GuestRoute from './components/guestroute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/',
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginScene /> },
      { path: '/register', element: <Register /> }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { path: '/home', element: <Home /> },
      { path: '/tracking', element: <Tracking /> },
      { path: '/sunny', element: <Sunny /> } // <-- CAMBIADO DE '/couch' A '/sunny'
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
