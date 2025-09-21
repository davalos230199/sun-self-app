import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { DiaProvider } from './contexts/DiaContext';
import { TrackingProvider } from './contexts/TrackingContext';
import { HeaderProvider } from './contexts/HeaderContext'; // Importa el HeaderProvider

// Layouts y Rutas
import AppLayout from './components/estructure/AppLayout';
import ProtectedRoute from './components/auth/protectedroute';
import GuestRoute from './components/auth/guestroute';

// Páginas
import Auth from './pages/Auth';
import Filosofia from './pages/Filosofia';
import Home from './pages/Home';
import Journal from './pages/Journal';
import MuroDeSoles from './pages/MuroDeSoles';
import ResumenDia from './pages/ResumenDia';
import Settings from './pages/Settings';
import Sunny from './pages/Sunny';
import Tracking from './pages/Tracking';
import MetasPage from './pages/MetasPage';


const router = createBrowserRouter([
    {
        // RUTA PÚBLICA (no logueados)
    path: '/',
    element: (
      <GuestRoute>
        <Auth />
      </GuestRoute>
    ),
  },
    {
    // GRUPO DE RUTAS PROTEGIDAS (logueados)
    element: (
      <ProtectedRoute>
            <DiaProvider>
                <HeaderProvider> {/* Envolver AppLayout */}
                    <AppLayout />
                </HeaderProvider>
            </DiaProvider>
        </ProtectedRoute>
    ),
            // Las rutas hijas heredan la protección y el layout.
        children: [
            { path: 'home', element: <Home /> },
            { path: 'tracking', element: <TrackingProvider><Tracking /></TrackingProvider> }, 
            { path: 'sunny', element: <Sunny /> },
            { path: 'settings', element: <Settings /> },
            { path: 'journal/:id', element: <Journal /> },
            { path: 'muro', element: <MuroDeSoles /> },
            { path: 'metas', element: <MetasPage /> },
            { path: 'filosofia', element: <Filosofia /> },
            { path: 'resumen/:date', element: <ResumenDia /> },
        ],
    },
]);

function App() {
  return <RouterProvider router={router} />;    
}
export default App;
