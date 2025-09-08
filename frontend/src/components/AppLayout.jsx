// frontend/src/components/AppLayout.jsx

import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from './PageHeader'; // CAMBIO: Importamos PageHeader aquí

// --- Componente Navbar (sin cambios, lo omito por brevedad) ---
const HomeIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const MetasIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const SunnyIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const SettingsIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const MuroIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

function Navbar() {
  const getLinkClassName = ({ isActive }) => {
    const baseStyle = "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200";
    return `${baseStyle} ${
      isActive 
        ? 'text-amber-500' // Icono y texto activos en ámbar
        : 'text-zinc-400 hover:text-zinc-700' // Inactivos en gris, con hover
    }`;
  };
  return (
    <nav className="flex-shrink-0 w-full h-20 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)] border-t border-amber-300 flex justify-around items-stretch px-2">
      <NavLink to="/home" className={getLinkClassName}><HomeIcon /><span className="text-xs font-semibold">Home</span></NavLink>
      <NavLink to="/metas" className={getLinkClassName}><MetasIcon /><span className="text-xs font-semibold">Metas</span></NavLink>
      <NavLink to="/sunny" className={getLinkClassName}><SunnyIcon /><span className="text-xs font-semibold">Sunny</span></NavLink>
      <NavLink to="/muro" className={getLinkClassName}><MuroIcon /><span className="text-xs font-semibold">Muro</span></NavLink>
      <NavLink to="/settings" className={getLinkClassName}><SettingsIcon /><span className="text-xs font-semibold">Ajustes</span></NavLink>
    </nav>
  );
}

export default function AppLayout() {
    const { user } = useAuth(); // Usamos el hook de autenticación
    const location = useLocation();

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
        <div className="h-[100dvh] w-screen bg-zinc-100 p-2 sm:p-4">
            <div className="h-full w-full max-w-lg mx-auto bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden">
                
                {/* CAMBIO: PageHeader ahora vive aquí y es consistente en todas las páginas */}
                <div className="p-2 sm:p-4 pb-0">
                    <PageHeader
                        title={getPageTitle(location.pathname, !!registroDeHoy)}
                        registroDeHoy={registroDeHoy}
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