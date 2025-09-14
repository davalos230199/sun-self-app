import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DiaProvider, useDia } from '../contexts/DiaContext';
import PageHeader from './PageHeader';
import Navbar from './Navbar';
import LoadingSpinner from './LoadingSpinner';

// Función helper para determinar el título de la página.
// La mantenemos aquí ya que está directamente relacionada con el Layout.
const getPageTitle = (pathname, tieneRegistro) => {
    switch (true) { // Usamos 'true' para poder evaluar condiciones con startsWith
        case pathname === '/home':
            return tieneRegistro ? "Tu Día" : "¿Cómo estás hoy?";
        case pathname === '/metas':
            return "Tus Metas del Día";
        case pathname === '/sunny':
            return "Habla con Sunny";
        case pathname === '/muro':
            return "Muro de Soles";
        case pathname === '/settings':
            return "Ajustes y Filosofía";
        case pathname.startsWith('/journal'):
            return "La Hoja de Atrás";
        case pathname.startsWith('/tracking'):
            return "Tu Diario";
        case pathname.startsWith('/resumen'):
            return "Resumen del Día";
        default:
            return "Sun Self";
    }
};

// Este es un sub-componente que vive dentro de AppLayout.
// Su propósito es poder "consumir" el contexto que el componente principal "provee".
const LayoutContent = () => {
    const location = useLocation();
    
    // Obtenemos todos los datos del día desde nuestro nuevo hook centralizado.
    // Ya no necesitamos 'useState' ni 'useEffect' aquí.
    const { registroDeHoy, isLoading } = useDia(); 

    // La lógica para decidir si mostrar el botón de atrás se queda aquí.
    const pathsWithBackButton = ['/tracking', '/journal', '/filosofia', '/resumen'];
    const showBackButton = pathsWithBackButton.some(path => location.pathname.startsWith(path));

    return (
        <div className="h-full w-full max-w-lg mx-auto bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden">
            
            <div className="p-2 sm:p-4 pb-0">
                <PageHeader
                    title={getPageTitle(location.pathname, !!registroDeHoy)}
                    registroDeHoy={registroDeHoy}
                    showBackButton={showBackButton}
                />
            </div>
            
            <main className="flex-1 overflow-y-auto p-2 sm:p-4 pt-4 flex flex-col">
                {/* Si el contexto está cargando los datos, mostramos un spinner general */}
                {isLoading ? (
                    <LoadingSpinner 
                        message="Preparando tu día..." 
                        estadoGeneral={registroDeHoy?.estado_general} 
                    />
                ) : (
                    // Cuando termina, renderizamos la página correspondiente (Home, Sunny, etc.)
                    // Ya no necesita el prop "context", porque las páginas usarán useDia() directamente.
                    <Outlet />
                )}
            </main>
            
            <Navbar />
        </div>
    );
};


// Este es el componente principal que exportamos.
// Su único trabajo ahora es proveer el contexto a sus hijos.
export default function AppLayout() {
    return (
        <div className="h-[100dvh] w-screen bg-amber-100 p-2 sm:p-4">
            {/* Envolvemos nuestro layout en el DiaProvider.
              Ahora, todos los componentes dentro de LayoutContent (incluyendo el Outlet y 
              todas las páginas que renderiza) pueden usar el hook `useDia()` para 
              acceder a los datos del día.
            */}
            <DiaProvider>
                <LayoutContent />
            </DiaProvider>
        </div>
    );
}