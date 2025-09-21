import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTracking } from '../contexts/TrackingContext'; 
import LoadingSpinner from '../components/LoadingSpinner';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import HistorialChart from '../components/HistorialChart';
import { RotateCw } from 'lucide-react'; // Importamos el icono de reset
import CalendarTile from '../components/CalendarTile';

// --- 1. Importamos los SVGs estáticos para los filtros ---
import brainIcon from '../assets/icons/brain.svg';
import emotionIcon from '../assets/icons/emotion.svg';
import bodyIcon from '../assets/icons/body.svg';


// Estilos específicos para el calendario, ahora fuera del return para más limpieza
const calendarCustomStyles = `
    .react-calendar { 
        border: none; 
        font-family: 'Patrick Hand', sans-serif; 
        width: 100%;
    }
    .react-calendar__navigation button {
        font-size: 1.2rem;
        font-weight: bold;
    }
    .react-calendar__month-view__weekdays__weekday {
        text-align: center;
        font-weight: bold;
    }
    .react-calendar__tile { 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: flex-start; 
        height: 60px;
        font-size: 0.9rem;
        padding: 2px;
        border-radius: 8px; /* Bordes redondeados */
    }
    .react-calendar__tile--now { /* Estilo para el día de hoy */
        background: #ceb552ff; /* Ámbar claro */
    }
    .react-calendar__tile:enabled:hover,
    .react-calendar__tile:enabled:focus {
        background: #fde68a; /* Ámbar más oscuro al pasar el ratón */
    }
`;

export default function Tracking() {
    const [historial, setHistorial] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [activeDateFilter, setActiveDateFilter] = useState('semana');
    const [aspectVisibility, setAspectVisibility] = useState({ mente: true, emocion: true, cuerpo: true });
    const { activeStartDate, setActiveStartDate } = useTracking(); // Usar el contexto

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

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                setIsLoading(true);
                // Usamos la nueva ruta del API
                const response = await api.getHistorialRegistros(); 
                setHistorial(response.data || []);
            } catch (err) {
                console.error("Error al cargar el historial:", err);
                setError("No se pudo cargar tu historial. Inténtalo de nuevo.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistorial();
    }, []); // El array vacío asegura que se ejecute solo una vez

    const registrosMap = useMemo(() => {
            const map = new Map();
            historial.forEach(r => {
            // Usamos una clave simple YYYY-MM-DD para cada día
            const dateKey = r.created_at.split('T')[0];
            map.set(dateKey, r);
            });
            return map;
        }, [historial]);

    // 2. Función para renderizar el contenido de cada día en el calendario
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateKey = date.toISOString().split('T')[0];
            const registroDelDia = registrosMap.get(dateKey); // Búsqueda instantánea en el mapa

            // Pasamos los datos a nuestro componente optimizado
            return <CalendarTile registro={registroDelDia} date={date} />;
        }
        return null;
    };
    
    // 3. Función para manejar el clic en un día (sin cambios)
    const handleDayClick = (date) => {
    const dateString = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        navigate(`/resumen/${dateString}`);
    };

    const dateFilters = [{ key: 'dia', label: '1d' }, { key: 'semana', label: '7d' }, { key: 'quince', label: '15d' }, { key: 'todo', label: 'Max' }];
     const aspectFilters = [
        { key: 'mente', icon: brainIcon }, 
        { key: 'emocion', icon: emotionIcon }, 
        { key: 'cuerpo', icon: bodyIcon }
    ];

    if (isLoading) {
        return <LoadingSpinner message="Cargando tus dias..." />;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        
         <>
            <style>{calendarCustomStyles}</style>
            <div className="h-full overflow-y-auto space-y-6 animate-fade-in snap-y snap-mandatory">
                <section className="bg-amber-50 border border-amber-400 shadow-lg rounded-2xl p-4 snap-start">
                    <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4 text-center">Tu Calendario</h2>
                    <Calendar
                        onClickDay={handleDayClick}
                        tileContent={tileContent}
                        maxDate={new Date()}
                        activeStartDate={activeStartDate} // Leer desde el contexto
                        onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)} // Escribir al contexto
                    />
                </section>
                
            {historial.length > 0 && (
                     <section className="bg-white border border-amber-400 shadow-lg rounded-2xl p-4 snap-start">
                        {/* Contenedor del Título y Filtro de Fechas */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">Fluctuación</h2>
                            <div className="flex items-center gap-1 bg-white border-none rounded-full p-1">
                                {dateFilters.map(filter => (
                                    <button 
                                        key={filter.key} 
                                        onClick={() => setActiveDateFilter(filter.key)} 
                                        className={`px-3 py-1 font-size: 1.2rem font-semibold rounded-full transition-colors border-none ${activeDateFilter === filter.key ? 'focus:bg-amber-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-600'}`}>
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Contenedor Relativo para el Gráfico y el nuevo Filtro de Aspectos */}
                        <div className="relative">
                            <HistorialChart 
                                data={historial} 
                                filter={activeDateFilter}
                                visibility={aspectVisibility} // Pasamos la visibilidad como prop
                            />
                            {/* --- EL NUEVO FILTRO DE ASPECTOS, POSICIONADO AQUÍ --- */}
                            <div className="flex justify-between">
                            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800"></h2>
                            <div className="flex justify-between gap-1 bg-white-100 -mt-8">
                                {aspectFilters.map(filter => (
                                    <button
                                        key={filter.key}
                                        onClick={() => handleAspectClick(filter.key)}
                                        title={`Filtrar por ${filter.key}`}
                                        className={`transition-all border-none rounded-full  ${aspectVisibility[filter.key] ? 'focus:bg-amber-100 shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                    <div className="w-6 h-6"><img src={filter.icon} alt={filter.key} /></div>
                                    </button>
                                ))}
                                <button onClick={handleResetAspects} title="Mostrar todos" className="border-none  rounded-full">
                                <RotateCw size={16} className="text-red-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                     </section>
                )}
            </div>
        </>
    );
}