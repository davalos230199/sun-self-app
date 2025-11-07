// frontend/src/pages/Tracking.jsx (MODIFICADO)

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTracking } from '/src/contexts/TrackingContext.jsx'; 
import api from '/src/services/api.js';

// --- NUEVO LADRILLO ---
import SlideDeRegistro from '../components/SlideDeRegistro'; // <-- 1. IMPORTAMOS EL NUEVO LADRILLO

// --- COMPONENTES VISUALES ---
import HistorialChart from '/src/components/HistorialChart.jsx';
import Calendar from 'react-calendar';
import CalendarTile from '/src/components/CalendarTile.jsx';
import 'react-calendar/dist/Calendar.css';
import LoadingSpinner from '/src/components/LoadingSpinner.jsx';

// --- ICONOS Y ANIMACIONES ---
import { 
    RotateCw, Award, TrendingUp, BarChart3, CalendarDays, CheckCircle, XCircle 
} from 'lucide-react';
// (Ya no necesitamos brainIcon, emotionIcon, bodyIcon aquí)
import sunIcon from '/src/assets/icons/sun.svg'; // (Lo dejamos por si lo usa CalendarTile)
import cloudIcon from '/src/assets/icons/cloud.svg'; // (Lo dejamos por si lo usa CalendarTile)
import rainIcon from '/src/assets/icons/rain.svg'; // (Lo dejamos por si lo usa CalendarTile)
// --- [NUEVO] Importamos los iconos para el gráfico (si SlideDeRegistro no los exporta) ---
import brainIcon from '/src/assets/icons/brain.svg';
import emotionIcon from '/src/assets/icons/emotion.svg';
import bodyIcon from '/src/assets/icons/body.svg';


// --- ESTILOS DEL CALENDARIO (SIN CAMBIOS) ---
const calendarCustomStyles = `
    .react-calendar { border: none; font-family: 'Patrick Hand', sans-serif; width: 100%; }
    .react-calendar__navigation button { font-size: 1.2rem; font-weight: bold; }
    .react-calendar__month-view__weekdays__weekday { text-align: center; font-weight: bold; }
    .react-calendar__tile { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 60px; font-size: 0.9rem; padding: 2px; border-radius: 8px; }
    .react-calendar__tile--now { background: #ceb552ff; }
    .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background: #fde68a; }
`;

// --- [ELIMINADO] ---
// getClimaFromValor y ClimaIcon ya no son necesarios aquí.
// Viven dentro de SlideDeRegistro.

// --- DonutChart (SIN CAMBIOS) ---
const DonutChart = ({ progress, size = 40 }) => {
    // ... (código sin cambios)
    const strokeWidth = 4;
    const radius = (size / 2) - (strokeWidth / 2);
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            <circle stroke="#e5e7eb" fill="transparent" strokeWidth={strokeWidth} r={radius} cx={size / 2} cy={size / 2} />
            <circle
                stroke="#48bb78" // tailwind: green-500
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset} 
                strokeLinecap="round"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="10px" fontWeight="bold" fill="#374151" className="transform rotate-90" transform-origin="center" >
                {`${progress}%`}
            </text>
        </svg>
    );
};

// --- MetasStatsCard (SIN CAMBIOS) ---
const MetasStatsCard = () => {
    // ... (código sin cambios)
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

    const StatNumber = ({ value }) => {
        if (isLoading) {
            return <span className="text-sm font-bold text-zinc-400">...</span>;
        }
        return <span className="text-sm font-bold text-zinc-700">{value}</span>;
    };

    const total = stats.completadas + stats.incompletas;
    const tasaExito = total === 0 ? 0 : Math.round((stats.completadas / total) * 100);

    return (
        <Link to="/app/historial-metas" className="no-underline">
            <div className="bg-white p-3 rounded-xl shadow-lg flex items-center justify-between transition-transform duration-200 hover:scale-[1.02] cursor-pointer">
                <div className="flex items-center space-x-3">
                    <Award size={24} className="text-blue-500 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-['Patrick_Hand'] text-zinc-800">Metas</h3>
                        <div className="flex space-x-4">
                            <div className="flex items-center space-x-1">
                                <CheckCircle size={14} className="text-green-500" />
                                <StatNumber value={stats.completadas} />
                            </div>
                            <div className="flex items-center space-x-1">
                                <XCircle size={14} className="text-red-500" />
                                <StatNumber value={stats.incompletas} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    {!isLoading && total > 0 ? (
                        <DonutChart progress={tasaExito} />
                    ) : (
                        <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                            {isLoading && <span className="text-xs font-bold text-zinc-400">...</span>}
                            {!isLoading && total === 0 && <Award size={16} className="text-zinc-400" />}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

// --- ViewSwitcher (SIN CAMBIOS) ---
const ViewSwitcher = ({ activeView, setActiveView }) => {
    // ... (código sin cambios)
    const views = [
        { key: 'grafico', label: 'Gráfico', icon: TrendingUp },
        { key: 'numeros', label: 'Registros', icon: BarChart3 }, // <-- 2. CAMBIAMOS EL LABEL
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

const ChartView = ({ historial }) => {
    // ... (código sin cambios)
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

    const dateFilters = [
        { key: 'dia', label: '1d' }, 
        { key: 'semana', label: '7d' }, 
        { key: 'quince', label: '15d' }, 
        { key: 'mes', label: '30d' }
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
        <section className="bg-white h-full shadow-lg rounded-2xl p-4">
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
            
            <div className="flex justify-end gap-3 bg-white border-none rounded-full mr-4">
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

            <div className="relative">
                <HistorialChart 
                    data={historial} 
                    filter={activeDateFilter}
                    visibility={aspectVisibility}
                />        
            </div> 
        </section>
    );
};


// --- CalendarView (SIN CAMBIOS) ---
const CalendarView = ({ registrosMap, activeStartDate, setActiveStartDate }) => {
    // ... (código sin cambios)
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

    return (
        <section className="bg-amber-50 border border-amber-400 shadow-lg rounded-2xl p-4">
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

    const { activeStartDate, setActiveStartDate } = useTracking();
    const [error, setError] = useState(null); // (Mantenemos el error por si acaso)
    const [activeView, setActiveView] = useState('numeros');

    // --- DATOS DEL CONTEXTO (SIN CAMBIOS) ---
    const { historial, isLoadingHistorial } = useTracking();
    const [visibleCount, setVisibleCount] = useState(30);
    
    // --- 3. [NUEVO] ESTADO PARA EL ACORDEÓN ---
    const [expandedId, setExpandedId] = useState(null);
    const handleToggle = (id) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    // --- Memo para el Calendario (SIN CAMBIOS) ---
    const registrosMap = useMemo(() => {
        const map = new Map();
        historial.forEach(r => {
            const dateKey = r.created_at.split('T')[0];
            map.set(dateKey, r);
        });
        return map;
    }, [historial]);

    if (isLoadingHistorial) {
        return <LoadingSpinner message="Construyendo tu espejo..." />;
    }

    // --- Helper de renderizado (MODIFICADO) ---
    const renderActiveView = () => {
        switch (activeView) {
            
            // --- 4. [AQUÍ ESTÁ LA MODIFICACIÓN] ---
            case 'numeros':
                if (historial.length === 0) {
                    return <p className="text-center text-zinc-500 italic p-4">No hay registros en tu historial.</p>;
                }
                // Ordenamos por fecha (más nuevo primero)
                const historialOrdenado = [...historial].reverse();
                const itemsVisibles = historialOrdenado.slice(0, visibleCount);
                const hayMasParaCargar = historialOrdenado.length > visibleCount;

            return (
                    <div className="space-y-4"> 
                        {itemsVisibles.map(registro => (
                            <SlideDeRegistro 
                                key={registro.id} 
                                registro={registro} 
                                isExpanded={expandedId === registro.id}
                                onToggle={() => handleToggle(registro.id)}
                            />
                        ))}
                        
                        {/* --- 3. [NUEVO] Botón Cargar Más --- */}
                        {hayMasParaCargar && (
                            <button
                                onClick={() => setVisibleCount(prev => prev + 30)} // Carga 30 más
                                className="w-full p-3 bg-white border border-zinc-200 rounded-xl shadow text-zinc-700 font-semibold font-['Patrick_Hand'] text-lg hover:bg-zinc-50"
                            >
                                Cargar Más Registros
                            </button>
                        )}
                    </div>
                );
            
            case 'grafico':
                return <ChartView historial={historial} />;
            
            case 'calendario':
                return <CalendarView 
                            registrosMap={registrosMap} 
                            activeStartDate={activeStartDate} 
                            setActiveStartDate={setActiveStartDate} 
                        />;
            
            default:
                return null; // El caso 'numeros' es el default ahora
        }
    }

    // --- RETURN PRINCIPAL (SIN CAMBIOS) ---
    return (
        <>
            <style>{calendarCustomStyles}</style>
            <div className="flex flex-col h-full">

                {/* 1. CONTENIDO FIJO (NO SCROLLEA) */}
                <div className="flex-shrink-0 space-y-4">
                    <MetasStatsCard />
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