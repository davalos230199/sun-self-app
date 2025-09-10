// frontend/src/pages/Tracking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// --- Sub-componente: Gráfico
const HistorialChart = ({ filter }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await new Promise(res => setTimeout(res, 500));
                const response = await api.getChartData(filter);
                setData(response.data);
                setError(null);
            } catch (err) {
                setError("No se pudieron cargar los datos.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filter]);

    if (loading) return <LoadingSpinner message="Dibujando tus días..." />;
    if (error) return <div className="text-center py-10 text-red-600 italic">{error}</div>;
    if (data.length === 0) return <div className="text-center py-10 text-zinc-500 italic">No hay datos para este período.</div>;
    
    const yAxisTickFormatter = (value) => {
        if (value === 4) return '☀️';
        if (value === 3) return '⛅';
        if (value === 2) return '🌧️';
        return '';
    };
    
    return (
        <div className="w-full h-[400px] flex justify-center items-center">
            {loading ? (
                <LoadingSpinner message="Dibujando tus días..." />
            ) : error ? (
                <div className="text-center text-red-600 italic">{error}</div>
            ) : data.length === 0 ? (
                <div className="text-center text-zinc-500 italic">No hay datos para este período.</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#666' }} />
                        <YAxis domain={[1.5, 4.5]} ticks={[2, 3, 4]} tickFormatter={yAxisTickFormatter} tick={{ fontSize: 16 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="valor" name="Fluctuación" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};
const MemoizedHistorialChart = React.memo(HistorialChart);

// --- Componente Principal de la Página ---
export default function Tracking() {
    const [activeFilter, setActiveFilter] = useState('mes');
    const [registrosCompletos, setRegistrosCompletos] = useState([]);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const navigate = useNavigate();

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
    
    const handleDayClick = (date) => {
        // 1. Formateamos la fecha a YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const fechaFormateada = `${year}-${month}-${day}`;

        // 2. Navegamos a la nueva ruta de resumen
        navigate(`/resumen/${fechaFormateada}`);
    };
    
    const filters = [{ key: 'semana', label: '7d' }, { key: 'quince', label: '15d' }, { key: 'mes', label: '1m' }, { key: 'todo', label: 'Todo' }];

    const calendarStyles = `
        .react-calendar { border: none; font-family: 'Patrick Hand', sans-serif; }
        .react-calendar__tile { 
            display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 60px;
        }
    `;

    // CAMBIO: Estructura de return simplificada y sin PageHeader
    return (
        <>
            <style>{calendarStyles}</style>
            <main className="h-full overflow-y-auto bg-zing-50">
                {isLoadingPage ? (
                    <div className="h-full flex justify-center items-center">
                        <LoadingSpinner message="Visitando el pasado..." />
                    </div>
                ) : (
                        // CAMBIO: Div interior que contiene el estilo visual y el espaciado
                    <div className="flex flex-col space-y-6">
                        <section className="bg-white border border-amber-300 shadow-lg rounded-2xl p-4 sm:p-6">
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
                            <MemoizedHistorialChart filter={activeFilter} />
                        </section>
                        
                        <section className="bg-white border border-amber-300 shadow-lg rounded-2xl p-4 sm:p-6">
                            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4">Calendario de Reflejos</h2>
                            <Calendar
                                className="w-full"
                                tileContent={tileContent}
                                onClickDay={handleDayClick}
                            />
                        </section>
                        
                        <section className="bg-white border border-amber-300 shadow-lg rounded-2xl p-4 sm:p-6">
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