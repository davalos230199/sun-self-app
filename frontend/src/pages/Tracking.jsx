import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '/src/contexts/AuthContext.jsx';
import { useHeader } from '/src/contexts/HeaderContext.jsx';
import { useTracking } from '/src/contexts/TrackingContext.jsx'; 
import api from '/src/services/api.js';

// --- COMPONENTES VISUALES ---
import HistorialChart from '/src/components/HistorialChart.jsx'; // Modificado
import Calendar from 'react-calendar';
import CalendarTile from '/src/components/CalendarTile.jsx';
import 'react-calendar/dist/Calendar.css';
import LoadingSpinner from '/src/components/LoadingSpinner.jsx';

// --- ICONOS Y ANIMACIONES ---
import { 
    RotateCw, Brain, Activity, Heart, Zap, Award, 
    TrendingUp, BarChart3, CalendarDays, Eye, CheckCircle, XCircle 
} from 'lucide-react';
import Lottie from 'lottie-react';
import brainIcon from '/src/assets/icons/brain.svg';
import emotionIcon from '/src/assets/icons/emotion.svg';
import bodyIcon from '/src/assets/icons/body.svg';
import sunIcon from '/src/assets/icons/sun.svg'; // Asumo que tienes estos
import cloudIcon from '/src/assets/icons/cloud.svg'; // Asumo que tienes estos
import rainIcon from '/src/assets/icons/rain.svg'; // Asumo que tienes estos
import sunLoopAnimation from '/src/assets/animations/sun-loop.json';
import cloudLoopAnimation from '/src/assets/animations/cloud-loop.json';
import rainLoopAnimation from '/src/assets/animations/rain-loop.json';

// --- ESTILOS DEL CALENDARIO (SIN CAMBIOS) ---
const calendarCustomStyles = `
    .react-calendar { border: none; font-family: 'Patrick Hand', sans-serif; width: 100%; }
    .react-calendar__navigation button { font-size: 1.2rem; font-weight: bold; }
    .react-calendar__month-view__weekdays__weekday { text-align: center; font-weight: bold; }
    .react-calendar__tile { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 60px; font-size: 0.9rem; padding: 2px; border-radius: 8px; }
    .react-calendar__tile--now { background: #ceb552ff; }
    .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background: #fde68a; }
`;

// --- WIDGET DE PERFIL (EL ESPEJO) (SIN CAMBIOS) ---
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

// --- WIDGET DE ESTADÍSTICAS RÁPIDAS (SIN CAMBIOS) ---
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

// --- [NUEVO] COMPONENTE 1: SELECTOR DE VISTA ---
const ViewSwitcher = ({ activeView, setActiveView }) => {
    const views = [
        { key: 'numeros', label: 'Números', icon: BarChart3 },
        { key: 'grafico', label: 'Gráfico', icon: TrendingUp },
        { key: 'calendario', label: 'Calendario', icon: CalendarDays },
    ];

    return (
        <div className="flex justify-around items-center bg-white p-2 rounded-xl shadow">
            {views.map(view => (
                <button
                    key={view.key}
                    onClick={() => setActiveView(view.key)}
                    className={`flex flex-col items-center justify-center w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                        activeView === view.key 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'text-zinc-500 hover:bg-zinc-100'
                    }`}
                >
                    <view.icon size={20} />
                    <span className="text-xs font-semibold mt-1">{view.label}</span>
                </button>
            ))}
        </div>
    );
};

// --- [NUEVO] COMPONENTE 2: DASHBOARD DE "NÚMEROS" ---
const StatsDashboard = ({ historial }) => {
    const stats = useMemo(() => {
        // Filtramos por los últimos 30 días
        const hoy = new Date();
        const hace30Dias = new Date(hoy.setDate(hoy.getDate() - 30));
        
        const historial30Dias = historial.filter(r => new Date(r.created_at) >= hace30Dias);

        // Contadores
        const data = {
            mente: { soleado: 0, nublado: 0, lluvioso: 0 },
            emocion: { soleado: 0, nublado: 0, lluvioso: 0 },
            cuerpo: { soleado: 0, nublado: 0, lluvioso: 0 },
            metas: { completadas: 0, incompletas: 0 } // Placeholder
        };

        historial30Dias.forEach(r => {
            if (r.estado_mente) data.mente[r.estado_mente]++;
            if (r.estado_emocion) data.emocion[r.estado_emocion]++;
            if (r.estado_cuerpo) data.cuerpo[r.estado_cuerpo]++;
            
            // Lógica de Metas (cuando esté)
            // if (r.meta_completada === true) data.metas.completadas++;
            // if (r.meta_completada === false) data.metas.incompletas++;
        });
        
        // Hardcodeo de metas (como pediste, para el futuro)
        data.metas.completadas = 0; // Cambiar cuando la lógica exista
        data.metas.incompletas = 0; // Cambiar cuando la lógica exista

        return data;
    }, [historial]);

    const StatCard = ({ title, icon, data }) => (
        <div className="bg-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
                <img src={icon} alt={title} className="w-8 h-8" />
                <h3 className="text-xl font-['Patrick_Hand'] text-zinc-800">{title}</h3>
            </div>
            <div className="flex justify-around items-center text-center">
                <div className="flex flex-col items-center">
                    <img src={sunIcon} alt="Soleado" className="w-6 h-6" />
                    <span className="text-lg font-bold text-zinc-700">{data.soleado}</span>
                </div>
                <div className="flex flex-col items-center">
                    <img src={cloudIcon} alt="Nublado" className="w-6 h-6" />
                    <span className="text-lg font-bold text-zinc-700">{data.nublado}</span>
                </div>
                <div className="flex flex-col items-center">
                    <img src={rainIcon} alt="Lluvioso" className="w-6 h-6" />
                    <span className="text-lg font-bold text-zinc-700">{data.lluvioso}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">Resumen (Últimos 30 días)</h2>
            <StatCard title="Mente" icon={brainIcon} data={stats.mente} />
            <StatCard title="Emoción" icon={emotionIcon} data={stats.emocion} />
            <StatCard title="Cuerpo" icon={bodyIcon} data={stats.cuerpo} />
            
            {/* Tarjeta de Metas (Placeholder) */}
            <div className="bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                    <Award size={24} className="text-blue-500" />
                    <h3 className="text-xl font-['Patrick_Hand'] text-zinc-800">Metas (Próximamente)</h3>
                </div>
                <div className="flex justify-around items-center text-center">
                    <div className="flex flex-col items-center">
                        <CheckCircle size={24} className="text-green-500" />
                        <span className="text-lg font-bold text-zinc-700">{stats.metas.completadas}</span>
                        <span className="text-xs text-zinc-500">Completadas</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <XCircle size={24} className="text-red-500" />
                        <span className="text-lg font-bold text-zinc-700">{stats.metas.incompletas}</span>
                        <span className="text-xs text-zinc-500">Incompletas</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- [NUEVO] COMPONENTE 3: VISTA DE "GRÁFICO" (MODIFICADA) ---
const ChartView = ({ historial }) => {
    const [activeDateFilter, setActiveDateFilter] = useState('semana');
    const [aspectVisibility, setAspectVisibility] = useState({ mente: true, emocion: true, cuerpo: true });

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

    // --- MODIFICACIÓN CLAVE: "Max" ahora es "30d" ---
    const dateFilters = [
        { key: 'dia', label: '1d' }, 
        { key: 'semana', label: '7d' }, 
        { key: 'quince', label: '15d' }, 
        { key: 'mes', label: '30d' } // Antes: { key: 'todo', label: 'Max' }
    ];
    
    const aspectFilters = [
        { key: 'mente', icon: brainIcon }, 
        { key: 'emocion', icon: emotionIcon }, 
        { key: 'cuerpo', icon: bodyIcon }
    ];

    if (historial.length === 0) {
        return <div className="text-center text-zinc-500 p-4">No hay datos suficientes para el gráfico.</div>
    }

    return (
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
    );
};

// --- [NUEVO] COMPONENTE 4: VISTA DE "CALENDARIO" (MODIFICADA) ---
const CalendarView = ({ registrosMap, activeStartDate, setActiveStartDate }) => {
    const navigate = useNavigate();

    const handleDayClick = (date) => {
        const dateString = date.toISOString().split('T')[0];
        navigate(`/app/resumen/${dateString}`);
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateKey = date.toISOString().split('T')[0];
            const registroDelDia = registrosMap.get(dateKey);
            return <CalendarTile registro={registroDelDia} date={date} />;
        }
        return null;
    };

    // --- NUEVO: Botón "Ayer" ---
    const handleGoToYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateString = yesterday.toISOString().split('T')[0];
        navigate(`/app/resumen/${dateString}`);
    };

    // --- NUEVO: Botón "Hoy" ---
    const handleGoToToday = () => {
        setActiveStartDate(new Date());
    };

    return (
        <section className="bg-amber-50 border border-amber-400 shadow-lg rounded-2xl p-4">
            
            {/* --- NUEVO: Barra de navegación estilo "Promiedos" --- */}
            <div className="flex items-center justify-center gap-4 mb-4">
                <button
                    onClick={handleGoToYesterday}
                    className="px-4 py-2 bg-white rounded-full shadow text-zinc-700 font-semibold"
                >
                    Ayer
                </button>
                <button
                    onClick={handleGoToToday}
                    className="px-6 py-2 bg-amber-400 text-white rounded-full shadow-lg font-bold"
                >
                    Hoy
                </button>
            </div>
            
            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4 text-center">Tu Historial</h2>
            <Calendar
                onClickDay={handleDayClick}
                tileContent={tileContent}
                maxDate={new Date()}
                activeStartDate={activeStartDate} 
                onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
            />
        </section>
    );
};


// --- COMPONENTE PRINCIPAL (REESTRUCTURADO) ---
export default function Tracking() {
    // --- Estados ---
    const { user } = useAuth();
    const { setIsHeaderVisible } = useHeader();
    const { activeStartDate, setActiveStartDate } = useTracking();
    
    const [historial, setHistorial] = useState([]);
    const [resumenSemanal, setResumenSemanal] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- NUEVO ESTADO: Vista activa del dashboard ---
    const [activeView, setActiveView] = useState('numeros'); // Default: 'numeros'

    // --- Hooks de Efecto ---

    // UNIFICAMOS LA CARGA DE DATOS (SIN CAMBIOS)
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
    }, []);

    // --- Lógica de Componente (Memos) ---

    // Mapa de registros para el calendario (SIN CAMBIOS)
    const registrosMap = useMemo(() => {
        const map = new Map();
        historial.forEach(r => {
            const dateKey = r.created_at.split('T')[0];
            map.set(dateKey, r);
        });
        return map;
    }, [historial]);


    // --- Renderizado Condicional (Loading/Error) ---

    if (isLoading) {
        return <LoadingSpinner message="Construyendo tu espejo..." />;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    // --- [NUEVO] Helper de renderizado ---
    const renderActiveView = () => {
        switch (activeView) {
            case 'numeros':
                return <StatsDashboard historial={historial} />;
            case 'grafico':
                return <ChartView historial={historial} />;
            case 'calendario':
                return <CalendarView 
                            registrosMap={registrosMap} 
                            activeStartDate={activeStartDate} 
                            setActiveStartDate={setActiveStartDate} 
                        />;
            default:
                return <StatsDashboard historial={historial} />;
        }
    }

    // --- 7. EL NUEVO RETURN (EL DASHBOARD CONSTRUIDO) ---
 return (
    <>
        <style>{calendarCustomStyles}</style>

        <div className="flex flex-col h-full space-y-4">

            {/* 3. EL SELECTOR DE VISTA */}
            <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />

            {/* 4. EL CONTENIDO DINÁMICO */}
            <div className="mt-4">
                {renderActiveView()}
            </div>
        
        </div>
    </>
);
}

