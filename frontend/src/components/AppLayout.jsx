// frontend/src/components/AppLayout.jsx

import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from './PageHeader'; // CAMBIO: Importamos PageHeader aquí
import Navbar from './Navbar';

export default function AppLayout() {
    const { user } = useAuth(); // Usamos el hook de autenticación
    const location = useLocation();
    const pathsWithBackButton = ['/tracking', '/journal', '/filosofia', '/resumen'];
    const showBackButton = pathsWithBackButton.some(path => location.pathname.startsWith(path));

    // --- LÓGICA MOVIDA DESDE Home.jsx ---
    const [isLoading, setIsLoading] = useState(true);
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    const [fraseDelDia, setFraseDelDia] = useState('');
    const [isLoadingAdicional, setIsLoadingAdicional] = useState(false);

    const cargarDatosDelDia = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const registroResponse = await api.getRegistroDeHoy();
            const registro = registroResponse?.data?.registro || null;
            setRegistroDeHoy(registro);

            if (registro) {
                setIsLoadingAdicional(true);
                const [metasResponse, fraseResult] = await Promise.all([
                    api.getMiniMetas(registro.id),
                    registro.frase_sunny 
                        ? Promise.resolve(registro.frase_sunny) 
                        : api.generarFraseInteligente({
                            registroId: registro.id,
                            mente_estat: registro.mente_estat,
                            emocion_estat: registro.emocion_estat,
                            cuerpo_estat: registro.cuerpo_estat,
                            meta_del_dia: registro.meta_del_dia,
                        }).then(res => res.data.frase).catch(() => "Hoy, las palabras descansan.")
                ]);
                
                setMiniMetas(metasResponse?.data || []);
                setFraseDelDia(fraseResult);
                setIsLoadingAdicional(false);
            } else {
                setMiniMetas([]);
                setFraseDelDia('');
            }
        } catch (error) {
            console.error("Error al cargar datos del día en AppLayout:", error);
            setRegistroDeHoy(null);
            setMiniMetas([]);
            setFraseDelDia('');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        cargarDatosDelDia();
    }, [cargarDatosDelDia]);
    // --- FIN DE LA LÓGICA MOVIDA ---

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (isAuthPage) {
        return <Outlet />;
    }

    // NUEVO: Creamos un objeto de contexto para pasar a las páginas hijas
    const outletContext = {
        user,
        isLoading,
        registroDeHoy,
        setRegistroDeHoy, // Pasamos la función para que Home pueda modificar el estado
        miniMetas,
        fraseDelDia,
        isLoadingAdicional,
        cargarDatosDelDia // Pasamos la función para que Home pueda recargar los datos
    };

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
                
                <main className="flex-1 overflow-y-auto p-2 sm:p-4 pt-4"> 
                    <Outlet context={outletContext} />
                </main>
                
                <Navbar />
            </div>
        </div>
    );
}

// NUEVO: Función helper para determinar el título del PageHeader
const getPageTitle = (pathname, tieneRegistro) => {
    switch (pathname) {
        case '/home':
            return tieneRegistro ? "Tu Día" : "¿Cómo estás hoy?";
        case '/metas':
            return "Tus Metas del Día";
        case '/sunny':
            return "Habla con Sunny";
        case '/muro':
            return "Muro de Soles";
        case '/settings':
            return "Ajustes y Filosofía";
        default:
            return "Sun Self";
    }
};