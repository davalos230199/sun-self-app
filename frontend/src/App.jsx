// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HeaderProvider } from './contexts/HeaderContext';
import { DiaProvider } from './contexts/DiaContext';
import { TrackingProvider } from './contexts/TrackingContext';

// Rutas de Autenticación
import GuestRoute from './components/auth/guestroute';
import ProtectedRoute from './components/auth/protectedroute';

// Layout de la App
import AppLayout from './components/estructure/AppLayout';

// --- Páginas Públicas (Nuevas) ---
import Landing from './pages/Landing'; // LA NUEVA LANDING
import Auth from './pages/Auth';         // LA PÁGINA DE LOGIN
import Filosofia from './pages/Filosofia';

// --- Páginas Privadas (Tus páginas existentes) ---
import Home from './pages/Home';
import Journal from './pages/Journal';
import MetasPage from './pages/MetasPage';
import Progreso from './pages/Progreso';
import ResumenDia from './pages/ResumenDia';
import Settings from './pages/Settings';
import Sunny from './pages/Sunny';
import Tracking from './pages/Tracking';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Rutas Públicas / Invitado --- */}
          <Route 
            path="/" 
            element={<GuestRoute><Landing /></GuestRoute>} 
          />
          <Route 
            path="/login" 
            element={<GuestRoute><Auth /></GuestRoute>} 
          />
          <Route 
            path="/filosofia" 
            element={<GuestRoute><Filosofia /></GuestRoute>} 
          />

          {/* --- Rutas Privadas / Protegidas (Tu App) --- */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <HeaderProvider>
                  <DiaProvider>
                    <TrackingProvider>
                      <AppLayout />
                    </TrackingProvider>
                  </DiaProvider>
                </HeaderProvider>
              </ProtectedRoute>
            }
          >
            {/* Rutas anidadas dentro de AppLayout */}
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            
            {/* --- INICIO DE CORRECCIÓN --- */}
            
            {/* Ruta para escribir un nuevo journal */}
            <Route path="journal" element={<Journal />} />
            
            {/* [AÑADIDO] Ruta para ver un journal/registro específico por ID */}
            {/* Asumo que la página 'Journal' también maneja la vista de un registro existente */}
            <Route path="journal/:id" element={<Journal />} /> 
            
            {/* Ruta para ver el resumen de un día específico */}
            <Route path="resumen/:date" element={<ResumenDia />} />
            
            {/* --- FIN DE CORRECCIÓN --- */}
            
            <Route path="tracking" element={<Tracking />} />
            <Route path="metas" element={<MetasPage />} />
            <Route path="progreso" element={<Progreso />} />
            <Route path="sunny" element={<Sunny />} />
            <Route path="settings" element={<Settings />} />
            
            {/* [ELIMINADO] Saqué 'journal' y 'resumen' de aquí abajo para ponerlos
                agrupados y con la corrección de 'journal/:id' */}

          </Route>
          
          <Route path="/home" element={<Navigate to="/app/home" replace />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;