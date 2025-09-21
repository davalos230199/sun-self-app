import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDia } from '../../contexts/DiaContext';
import { useHeader } from '../../contexts/HeaderContext';
import PageHeader from './PageHeader';
import Navbar from './Navbar';
import LoadingSpinner from '../LoadingSpinner';

const getPageTitle = (pathname, tieneRegistro) => {
    switch (true) { // Usamos 'true' para poder evaluar condiciones con startsWith
        case pathname === '/home':
            return tieneRegistro ? "Tu Día" : "¿Cómo estás hoy?";
        case pathname === '/metas':
            return "Tus Metas del Día";
        case pathname === '/sunny':
            return "Sunny";
        case pathname === '/muro':
            return "Cielo Sun Self";
        case pathname === '/settings':
            return "Ajustes y Filosofía";
        case pathname.startsWith('/journal'):
            return "Tu Diario";
        case pathname.startsWith('/tracking'):
            return "Tus registros";
        case pathname.startsWith('/resumen'):
            return "Resumen del Día";
        default:
            return "Sun Self";
    }
};

export default function AppLayout() {
    const location = useLocation();
    const { registroDeHoy, isLoading } = useDia(); 
    const { title: contextTitle, setTitle: setContextTitle, showBackButton: contextShowBackButton, setShowBackButton: setContextShowBackButton } = useHeader();
    const pathShouldHaveBackButton = ['/tracking', '/journal', '/filosofia', '/resumen'].some(path => location.pathname.startsWith(path));
    const finalShowBackButton = pathShouldHaveBackButton && contextShowBackButton;

    React.useEffect(() => {
        // Al cambiar de ruta, reseteamos los estados del header
        setContextTitle(null);
        setContextShowBackButton(true); // Lo re-habilitamos por defecto
    }, [location.pathname, setContextTitle, setContextShowBackButton]);

    const finalTitle = contextTitle || getPageTitle(location.pathname, !!registroDeHoy);


    return (
        <div className="h-[100dvh] w-screen bg-blue-300 p-2 pb-4sm:p-4">
        <div className="h-full w-full max-w-lg mx-auto bg-amber-50 shadow-lg rounded-2xl flex flex-col overflow-hidden">
            <div className="p-2 sm:p-4 pb-0">
                <PageHeader
                    title={finalTitle}
                    registroDeHoy={registroDeHoy}
                    showBackButton={finalShowBackButton}
                />
            </div>
            
            <main className="flex-1 overflow-y-auto p-2 sm:p-4 pt-4 flex flex-col">
                {isLoading ? (
                    <LoadingSpinner 
                        message="Preparando tu día..." 
                        estadoGeneral={registroDeHoy?.estado_general} 
                    />
                ) : (
                    <Outlet />
                )}
            </main>
            <Navbar />
        </div>
        </div>
    );
};
