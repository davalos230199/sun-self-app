import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHeader } from '../contexts/HeaderContext';
import { useTracking } from '../contexts/TrackingContext'; 
import api from '../services/api'

// --- 1. COMPONENTES VISUALES ---
import HistorialChart from '../components/HistorialChart';
import Calendar from 'react-calendar';
import CalendarTile from '../components/CalendarTile';
import 'react-calendar/dist/Calendar.css';
import LoadingSpinner from '../components/LoadingSpinner';

// --- 2. ICONOS Y ANIMACIONES ---
import { RotateCw, Brain, Activity, Heart, Zap, Award } from 'lucide-react';
import Lottie from 'lottie-react';
import brainIcon from '../assets/icons/brain.svg';
import emotionIcon from '../assets/icons/emotion.svg';
import bodyIcon from '../assets/icons/body.svg';
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';

// --- 3. ESTILOS DEL CALENDARIO (SIN CAMBIOS) ---
const calendarCustomStyles = `
    .react-calendar { border: none; font-family: 'Patrick Hand', sans-serif; width: 100%; }
    .react-calendar__navigation button { font-size: 1.2rem; font-weight: bold; }
    .react-calendar__month-view__weekdays__weekday { text-align: center; font-weight: bold; }
    .react-calendar__tile { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 60px; font-size: 0.9rem; padding: 2px; border-radius: 8px; }
    .react-calendar__tile--now { background: #ceb552ff; }
    .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background: #fde68a; }
`;

// --- 4. WIDGET DE PERFIL (EL ESPEJO) (SIN CAMBIOS) ---
const ProfileWidget = ({ user, resumen }) => {
    const getPromedio = () => {
        if (!resumen || resumen.length === 0) return { icon: cloudLoopAnimation, text: 'Neutral' };
        const valor = { soleado: 2, nublado: 1, lluvioso: 0 };
        const suma = resumen.reduce((acc, dia) => acc + valor[dia.estado_general], 0);
        const avg = suma / resumen.length;
        if (avg > 1.5) return { icon: sunLoopAnimation, text: 'Tendencia Soleada' };
        if (avg < 0.5) return { icon: rainLoopAnimation, text: 'Tendencia Lluviosa' };
        return { icon: cloudLoopAnimation, text: 'Tendencia Variable' };
    };
    const promedio = getPromedio();
    return (
        <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-lg">
            <div className="w-20 h-20 flex-shrink-0">
                <Lottie animationData={promedio.icon} loop={true} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-zinc-800">Hola, {user.username}</h2>
                <p className="text-sm font-semibold text-zinc-500">{promedio.text} en los últimos 7 días</p>
            </div>
        </div>
    );
};

// --- 5. WIDGET DE ESTADÍSTICAS RÁPIDAS (SIN CAMBIOS) ---
const StatsWidget = ({ historial }) => {
    // Lógica simple de racha (placeholder)
    const racha = historial.length > 0 ? "1 Día" : "0 Días"; // Placeholder
    const mejorAspecto = "Mente"; // Placeholder

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow text-center">
                <Zap size={24} className="mx-auto text-yellow-500" />
                <p className="text-2xl font-bold">{racha}</p>
                <p className="text-xs text-zinc-500">Racha Actual</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow text-center">
                <Brain size={24} className="mx-auto text-blue-500" />
                <p className="text-2xl font-bold">{mejorAspecto}</p>
                <p className="text-xs text-zinc-500">Tu Foco</p>
            </div>
        </div>
    )
}

// --- 6. COMPONENTE PRINCIPAL (REESTRUCTURADO) ---
export default function Tracking() {
    // --- Estados ---
    const { user } = useAuth();
    const { setIsHeaderVisible } = useHeader();
    const { activeStartDate, setActiveStartDate } = useTracking();
    const navigate = useNavigate();

    const [historial, setHistorial] = useState([]);
    const [resumenSemanal, setResumenSemanal] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [activeDateFilter, setActiveDateFilter] = useState('semana');
    const [aspectVisibility, setAspectVisibility] = useState({ mente: true, emocion: true, cuerpo: true });

    // --- Hooks de Efecto ---

    // Oculta el header de AppLayout en esta página
    useEffect(() => {
        setIsHeaderVisible(false);
        return () => setIsHeaderVisible(true);
    }, [setIsHeaderVisible]);

    // UNIFICAMOS LA CARGA DE DATOS
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [resumenData, historialData] = await Promise.all([
                    api.getResumenSemanal(),
                    api.getHistorialRegistros()
                ]);
                setResumenSemanal(resumenData.data || []);
                setHistorial(historialData.data || []);
            } catch (err) {
                console.error("Error cargando datos del perfil:", err);
                setError("No se pudo cargar tu espejo. Inténtalo de nuevo.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []); // Array vacío, se ejecuta solo una vez

    // --- Lógica de Componente (Manejadores, Memos) ---

    const handleAspectClick = (dataKey) => {
        const isOnlyOneVisible = aspectVisibility[dataKey] && Object.values(aspectVisibility).filter(v => v).length === 1;
        if (isOnlyOneVisible) {
            setAspectVisibility({ mente: true, emocion: true, cuerpo: true });
        } else {
            setAspectVisibility({
                mente: dataKey === 'mente',
                emocion: dataKey === 'emocion',
                cuerpo: dataKey === 'cuerpo',
            });
        }
    };
    const handleResetAspects = () => {
        setAspectVisibility({ mente: true, emocion: true, cuerpo: true });
    };

    const registrosMap = useMemo(() => {
        const map = new Map();
        historial.forEach(r => {
            const dateKey = r.created_at.split('T')[0];
            map.set(dateKey, r);
        });
        return map;
    }, [historial]);

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateKey = date.toISOString().split('T')[0];
            const registroDelDia = registrosMap.get(dateKey);
            return <CalendarTile registro={registroDelDia} date={date} />;
        }
        return null;
    };
    
    const handleDayClick = (date) => {
        const dateString = date.toISOString().split('T')[0];
        navigate(`/resumen/${dateString}`);
    };

    const dateFilters = [{ key: 'dia', label: '1d' }, { key: 'semana', label: '7d' }, { key: 'quince', label: '15d' }, { key: 'todo', label: 'Max' }];
    const aspectFilters = [
        { key: 'mente', icon: brainIcon }, 
        { key: 'emocion', icon: emotionIcon }, 
        { key: 'cuerpo', icon: bodyIcon }
    ];

    // --- Renderizado Condicional ---

    if (isLoading) {
        return <LoadingSpinner message="Construyendo tu espejo..." />;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    // --- 7. EL NUEVO RETURN (EL ESPEJO CONSTRUIDO) ---
    return (
        <>
            <style>{calendarCustomStyles}</style>
            
            {/* 🟡 ESTE ES EL NUEVO ORDEN LÓGICO */}
            <div className="flex flex-col h-full space-y-4">

                {/* 1. EL ESPEJO (PERFIL) */}
                <ProfileWidget user={user} resumen={resumenSemanal} />

                {/* 2. LAS ESTADÍSTICAS RÁPIDAS */}
                <StatsWidget historial={historial} />

                {/* 3. LA RADIOGRAFÍA (GRÁFICO) - Mantenemos tu lógica de sección */}
                {historial.length > 0 && (
                    <section className="bg-white border border-amber-400 shadow-lg rounded-2xl p-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">Fluctuación</h2>
                            <div className="flex items-center gap-1 bg-white border-none rounded-full p-1">
                                {dateFilters.map(filter => (
                                    <button 
                                        key={filter.key} 
                                        onClick={() => setActiveDateFilter(filter.key)} 
                                        className={`px-3 py-1 font-['Patrick_Hand'] font-size: 1.2rem font-semibold rounded-full transition-colors border-none ${activeDateFilter === filter.key ? 'focus:bg-amber-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-600'}`}>
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <HistorialChart 
                                data={historial} 
                                filter={activeDateFilter}
                                visibility={aspectVisibility}
                            />
                        </div> 
                        <div className="flex justify-end gap-4 bg-white border-none rounded-full p-1">
                            {aspectFilters.map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => handleAspectClick(filter.key)}
                                    title={`Filtrar por ${filter.key}`}
                                    className={`transition-all border-none rounded-full ${aspectVisibility[filter.key] ? 'focus:bg-amber-100 rounded-full shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                                >
                                    <div className="w-8 h-8"><img src={filter.icon} alt={filter.key} /></div>
                                </button>
                            ))}
                            <button onClick={handleResetAspects} title="Mostrar todos" className="border-none rounded-full">
                                <RotateCw size={16} className="text-red-500" />
                            </button>
                        </div>
                    </section>
                )}
                
                {/* 4. LA HISTORIA (CALENDARIO) */}
                <section className="bg-amber-50 border border-amber-400 shadow-lg rounded-2xl p-4">
                    <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4 text-center">Tu Historial</h2>
                    <Calendar
                        onClickDay={handleDayClick}
                        tileContent={tileContent}
                        maxDate={new Date()}
                        activeStartDate={activeStartDate} 
                        onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                    />
                </section>
            
            </div>
        </>
    );
}