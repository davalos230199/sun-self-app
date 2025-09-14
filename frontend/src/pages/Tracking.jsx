import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useDia } from '../contexts/DiaContext'; // 1. Importamos el hook de nuestro contexto
import LoadingSpinner from '../components/LoadingSpinner';
import HistorialChart from '../components/HistorialChart'; // 2. Importamos el gráfico desde su nuevo archivo
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Estilos para el calendario

// --- Componente Principal de la Página ---
export default function Tracking() {
    // 3. Obtenemos el registro de hoy desde el contexto para usar su estado general
    const { registroDeHoy } = useDia(); 
    
    // Estados locales específicos de esta página
    const [activeFilter, setActiveFilter] = useState('mes');
    const [registrosCompletos, setRegistrosCompletos] = useState([]);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const navigate = useNavigate();
    const mainContainerRef = useRef(null);

    // Este efecto carga todos los registros para poder colorear el calendario
    useEffect(() => {
        const fetchAllRegistros = async () => {
            try {
                const response = await api.getRegistros();
                setRegistrosCompletos(response.data || []);
            } catch (error) {
                console.error("Error al cargar registros para el calendario:", error);
            } finally {
                setIsLoadingPage(false);
            }
        };
        fetchAllRegistros();
    }, []);

    // Este efecto asegura que la página siempre inicie desde arriba
    useEffect(() => {
        if (mainContainerRef.current) {
            mainContainerRef.current.scrollTop = 0;
        }
    }, []);

    // Función para añadir emojis a los días con registro en el calendario
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toISOString().split('T')[0];
            const registroDelDia = registrosCompletos.find(r => r.created_at.startsWith(dateString));
            if (registroDelDia) {
                let emoji = '❔';
                if (registroDelDia.estado_general === 'soleado') emoji = '☀️';
                if (registroDelDia.estado_general === 'nublado') emoji = '⛅';
                if (registroDelDia.estado_general === 'lluvioso') emoji = '🌧️';
                return <span className="block text-xl mt-1">{emoji}</span>;
            }
        }
        return null;
    };
    
    // Función para manejar el clic en un día del calendario
    const handleDayClick = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const fechaFormateada = `${year}-${month}-${day}`;
        navigate(`/resumen/${fechaFormateada}`);
    };
    
    const filters = [{ key: 'semana', label: '7d' }, { key: 'quince', label: '15d' }, { key: 'mes', label: '1m' }, { key: 'todo', label: 'Todo' }];

    // Estilos personalizados para el calendario
    const calendarStyles = `
        .react-calendar { border: none; font-family: 'Patrick Hand', sans-serif; }
        .react-calendar__tile { 
            display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 60px;
        }
    `;

    return (
        <>
            <style>{calendarStyles}</style>
            <main ref={mainContainerRef} className="h-full overflow-y-auto bg-zinc-50 snap-y snap-mandatory">
                {isLoadingPage ? (
                    <div className="h-full flex justify-center items-center">
                        {/* 4. El spinner ahora usa el estado del día desde el contexto */}
                        <LoadingSpinner 
                            message="Observando el pasado..." 
                            estadoGeneral={registroDeHoy?.estado_general}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col space-y-6">
                        {/* Sección del Calendario */}
                        <section className="bg-white border border-amber-300 shadow-lg rounded-2xl p-4 sm:p-6 snap-start">
                            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4">Calendario de Reflejos</h2>
                            <Calendar
                                className="w-full"
                                tileContent={tileContent}
                                onClickDay={handleDayClick}
                            />
                        </section>
                        
                        {/* Sección del Gráfico */}
                        <section className="bg-white border border-amber-300 shadow-lg rounded-2xl p-4 sm:p-6 snap-start">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">Tu Fluctuación</h2>
                                <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 rounded-full p-1">
                                    {filters.map(filter => (
                                        <button key={filter.key} onClick={() => setActiveFilter(filter.key)} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeFilter === filter.key ? 'bg-white text-amber-600 shadow-sm' : 'text-zinc-500 hover:bg-zinc-200/50'}`}>
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* 5. Llamamos al componente del gráfico y le pasamos el estado del día */}
                            <HistorialChart 
                                filter={activeFilter} 
                                estadoGeneral={registroDeHoy?.estado_general} 
                            />
                        </section>
                        
                        {/* Sección de Recuerdos (Platzhalter) */}
                        <section className="bg-white border border-amber-300 shadow-lg rounded-2xl p-4 sm:p-6 snap-start">
                            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4">Tus Recuerdos</h2>
                            <div className="text-center py-10 text-zinc-400 italic">
                                (Próximamente: La 'Lista de Recuerdos' recuperada vivirá aquí)
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </>
    );
}