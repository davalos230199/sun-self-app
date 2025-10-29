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
    RotateCw, Award, TrendingUp, BarChart3, CalendarDays, CheckCircle, XCircle 
} from 'lucide-react';
import Lottie from 'lottie-react';
import brainIcon from '/src/assets/icons/brain.svg';
import emotionIcon from '/src/assets/icons/emotion.svg';
import bodyIcon from '/src/assets/icons/body.svg';
import sunIcon from '/src/assets/icons/sun.svg'; // Asumo que tienes estos
import cloudIcon from '/src/assets/icons/cloud.svg'; // Asumo que tienes estos
import rainIcon from '/src/assets/icons/rain.svg'; // Asumo que tienes estos

// --- ESTILOS DEL CALENDARIO (SIN CAMBIOS) ---
const calendarCustomStyles = `
    .react-calendar { border: none; font-family: 'Patrick Hand', sans-serif; width: 100%; }
    .react-calendar__navigation button { font-size: 1.2rem; font-weight: bold; }
    .react-calendar__month-view__weekdays__weekday { text-align: center; font-weight: bold; }
    .react-calendar__tile { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 60px; font-size: 0.9rem; padding: 2px; border-radius: 8px; }
    .react-calendar__tile--now { background: #ceb552ff; }
    .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background: #fde68a; }
`;

// --- [NUEVO] HELPERS DE LÓGICA ---
const getClimaFromValor = (valor) => {
    if (valor === null || valor === undefined) return null;
    if (valor > 66) return 'soleado';
    if (valor > 33) return 'nublado';
    return 'lluvioso';
};

const ClimaIcon = ({ estado, className = "w-6 h-6" }) => {
    switch (estado) {
        case 'soleado':
            return <img src={sunIcon} alt="Soleado" className={className} />;
        case 'nublado':
            return <img src={cloudIcon} alt="Nublado" className={className} />;
        case 'lluvioso':
            return <img src={rainIcon} alt="Lluvioso" className={className} />;
        default:
            return <div className={`bg-zinc-200 rounded-full ${className}`} />; // Placeholder si no hay estado
    }
};

// --- [COMPONENTE 1 - VERSIÓN FINAL] TARJETA DE METAS (CON TASA) ---
const MetasPlaceholderCard = () => {
    const [stats, setStats] = useState({ completadas: 0, incompletas: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const response = await api.getMetasStats(); 
                if (response.data) {
                    setStats(response.data);
                }
            } catch (err) {
                console.error("Error al cargar stats de metas:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    // --- (FIX VISUAL) ---
    // Helper de número SIN ancho fijo. 
    // El 'items-center' del div padre ahora funcionará.
    const StatNumber = ({ value }) => {
        if (isLoading) {
            return <span className="text-sm font-bold text-zinc-400">...</span>;
        }
        return <span className="text-sm font-bold text-zinc-700">{value}</span>;
    };

    // --- (NUEVA FEATURE) ---
    // Calculamos la tasa de éxito
    const total = stats.completadas + stats.incompletas;
    const tasaExito = total === 0 ? 0 : Math.round((stats.completadas / total) * 100);

    return (
        <div className="bg-white p-3 rounded-xl shadow-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Award size={20} className="text-blue-500 flex-shrink-0" />
                <h3 className="text-lg font-['Patrick_Hand'] text-zinc-800">Metas</h3>
                
                {/* Mostramos la tasa solo si no está cargando y hay metas */}
                {!isLoading && total > 0 && (
                    <span className="text-sm font-bold text-blue-600">({tasaExito}%)</span>
                )}
            </div>

            {/* El layout de los contadores (ahora arreglado) */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                    <CheckCircle size={16} className="text-green-500" />
                    <StatNumber value={stats.completadas} />
                </div>
                <div className="flex items-center space-x-1">
                    <XCircle size={16} className="text-red-500" />
                    <StatNumber value={stats.incompletas} />
                </div>
            </div>
        </div>
    );
};

// --- [NUEVO] COMPONENTE 1: SELECTOR DE VISTA ---
const ViewSwitcher = ({ activeView, setActiveView }) => {
    const views = [
        { key: 'numeros', label: 'Estadísticas', icon: BarChart3 },
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

// --- [COMPONENTE 3 - REDISEÑADO] EL FEED DE ASPECTOS ---
const AspectFeed = ({ historial, aspectoActivo }) => {
    
    // --- CORRECCIÓN DE KEY ---
    const comentarioKey = {
        mente: 'mente_comentario',
        emocion: 'emocion_comentario',
        cuerpo: 'cuerpo_comentario'
    }[aspectoActivo];

    const estadoKey = {
        mente: 'mente_estado', // Corregido
        emocion: 'emocion_estado', // Corregido
        cuerpo: 'cuerpo_estado' // Corregido
    }[aspectoActivo];

    const feedItems = useMemo(() => {
        return historial
            .filter(r => r[comentarioKey] && r[comentarioKey].trim() !== '')
            .map(r => ({
                id: r.id,
                fecha_original: r.created_at, // <-- Guardamos la fecha original para ordenar
                fecha_formateada: new Date(r.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' }),
                comentario: r[comentarioKey],
                estado: getClimaFromValor(r[estadoKey])
            }))
            // --- ORDEN CORREGIDO --- (b - a para descendente)
            .sort((a, b) => new Date(b.fecha_original) - new Date(a.fecha_original))
            // --- LÍMITE AÑADIDO ---
            .slice(0, 15); 
    }, [historial, aspectoActivo, comentarioKey, estadoKey]);

    if (feedItems.length === 0) {
        return <p className="text-center text-zinc-500 mt-6 scroll-snap-align-start">No hay comentarios escritos para este aspecto.</p>;
    }

    return (
        <div className="space-y-4 mt-6">
            {feedItems.map(item => (
                // --- REDISEÑO VISUAL "MÁS ÉNFASIS" ---
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-lg flex space-x-4 items-center scroll-snap-align-start">
                    <div className="flex-shrink-0">
                        <ClimaIcon estado={item.estado} className="w-12 h-12" />
                    </div>
                    <blockquote className="flex-grow">
                        <p className="text-sm font-semibold text-zinc-800 italic">
                            "{item.comentario}"
                        </p>
                        <cite className="text-xs text-zinc-500 mt-2 block italic">
                            {item.fecha_formateada}
                        </cite>
                    </blockquote>
                </div>
            ))}
            {historial.filter(r => r[comentarioKey] && r[comentarioKey].trim() !== '').length > 15 && (
                <p className="text-center text-zinc-500 text-sm py-4 scroll-snap-align-start">Mostrando los 15 más recientes.</p>
            )}
        </div>
    );
};

// --- [COMPONENTE 4 - PURIFICADO] EL SELECTOR DE ASPECTOS ---
const AspectSquare = ({ icon, isActive, onClick }) => (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center justify-center p-1 rounded-2xl shadow-lg transition-all aspect-square ${
            isActive ? 'bg-amber-100 border-2 border-amber-400' : 'bg-white'
        }`}
    >
        <img src={icon} alt="aspecto" className="w-16 h-16" />
    </button>
);

// --- [COMPONENTE 5 - PURIFICADO] VISTA DE "ESTADÍSTICAS" ---
const StatsView = ({ historial }) => {
    const [aspectoActivo, setAspectoActivo] = useState('mente'); // 'mente' por defecto

    return (
        <div className="space-y-4">
            {/* 1. Los 3 Selectores Cuadrados */}
            <div className="grid grid-cols-3 gap-4">
                <AspectSquare
                    icon={brainIcon}
                    isActive={aspectoActivo === 'mente'}
                    onClick={() => setAspectoActivo('mente')}
                />
                <AspectSquare
                    icon={emotionIcon}
                    isActive={aspectoActivo === 'emocion'}
                    onClick={() => setAspectoActivo('emocion')}
                />
                <AspectSquare
                    icon={bodyIcon}
                    isActive={aspectoActivo === 'cuerpo'}
                    onClick={() => setAspectoActivo('cuerpo')}
                />
            </div>
            {/* 2. El Feed Cronológico */}
            <AspectFeed historial={historial} aspectoActivo={aspectoActivo} />
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
    const { activeStartDate, setActiveStartDate } = useTracking();
    const [historial, setHistorial] =useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('numeros');

    // --- Carga de Datos (Sin cambios) ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const historialData = await api.getHistorialRegistros();
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

    // --- Memo para el Calendario (Sin cambios) ---
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

    // --- Helper de renderizado de Vista Activa (Sin cambios) ---
    const renderActiveView = () => {
        switch (activeView) {
            case 'numeros':
                return <StatsView historial={historial} />;
            case 'grafico':
                return <ChartView historial={historial} />;
            case 'calendario':
                return <CalendarView 
                            registrosMap={registrosMap} 
                            activeStartDate={activeStartDate} 
                            setActiveStartDate={setActiveStartDate} 
                        />;
            default:
                return <StatsView historial={historial} />;
        }
    }

    // --- [NUEVO] RETURN PRINCIPAL (CON LAYOUT FIJO) ---
    return (
        <>
            <style>{calendarCustomStyles}</style>
            <div className="flex flex-col h-full">

                {/* 1. CONTENIDO FIJO (NO SCROLLEA) */}
                <div className="flex-shrink-0 space-y-4">
                    <MetasPlaceholderCard />
                    <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />
                </div>

                {/* 2. CONTENIDO DINÁMICO (SCROLLEA) */}
                <div className="flex-grow overflow-y-auto mt-4 space-y-4 pb-4 scroll-snap-type: y proximity;">
                    {renderActiveView()}
                </div>
            
            </div>
        </>
    );
}