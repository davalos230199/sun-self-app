import { Outlet, useLocation } from 'react-router-dom';
import { useDia } from '../contexts/DiaContext';
import PageHeader from './PageHeader';
import Navbar from './Navbar';
import LoadingSpinner from './LoadingSpinner';

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

export default function AppLayout() {
    const location = useLocation();
    const { registroDeHoy, isLoading } = useDia(); 
    const pathsWithBackButton = ['/tracking', '/journal', '/filosofia', '/resumen'];
    const showBackButton = pathsWithBackButton.some(path => location.pathname.startsWith(path));

    return (
        <div className="h-[100dvh] w-screen bg-amber-100 p-2 sm:p-4">
        <div className="h-full w-full max-w-lg mx-auto bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden">
            <div className="p-2 sm:p-4 pb-0">
                <PageHeader
                    title={getPageTitle(location.pathname, !!registroDeHoy)}
                    registroDeHoy={registroDeHoy}
                    showBackButton={showBackButton}
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
