import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// --- Sub-componente: Gráfico (sin cambios) ---
const HistorialChart = ({ filter }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
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

    if (loading) return <div className="text-center py-10 text-zinc-500 italic">Dibujando...</div>;
    if (error) return <div className="text-center py-10 text-red-600 italic">{error}</div>;
    if (data.length === 0) return <div className="text-center py-10 text-zinc-500 italic">No hay datos para este período.</div>;
    
    const yAxisTickFormatter = (value) => {
        if (value === 4) return '☀️';
        if (value === 3) return '⛅';
        if (value === 2) return '🌧️';
        return '';
    };
    
    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#666' }} />
                    <YAxis domain={[1.5, 4.5]} ticks={[2, 3, 4]} tickFormatter={yAxisTickFormatter} tick={{ fontSize: 16 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="valor" name="Fluctuación" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

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

    // CAMBIO 1: Nueva función para inyectar el emoji en cada día
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const registroDelDia = registrosCompletos.find(r => r.created_at.startsWith(dateString));
            
            if (registroDelDia) {
                let emoji = '❔';
                if (registroDelDia.estado_general === 'soleado') emoji = '☀️';
                if (registroDelDia.estado_general === 'nublado') emoji = '⛅';
                if (registroDelDia.estado_general === 'lluvioso') emoji = '🌧️';
                // Retornamos un span con el emoji para ponerlo debajo del número
                return <span className="block text-xl mt-1">{emoji}</span>;
            }
        }
        return null;
    };
    
    // Función para manejar el clic en un día (sin cambios)
    const handleDayClick = (date) => {
        const dateString = date.toISOString().split('T')[0];
        const registroDelDia = registrosCompletos.find(r => r.created_at.startsWith(dateString));
        if (registroDelDia) {
            navigate(`/journal/${registroDelDia.id}`);
        }
    };
    
    const filters = [{ key: 'semana', label: '7d' }, { key: 'quince', label: '15d' }, { key: 'mes', label: '1m' }, { key: 'todo', label: 'Todo' }];

    // CAMBIO 2: Eliminamos los estilos CSS para los puntos de color
    const calendarStyles = `
        .react-calendar { border: none; font-family: 'Patrick Hand', sans-serif; }
        /* Hacemos que cada día sea un flexbox en columna para alinear número y emoji */
        .react-calendar__tile { 
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            height: 60px; /* Le damos una altura fija para que no salten */
        }
    `;

    if (isLoadingPage) {
        return (
             <div className="p-2 sm:p-4 h-full w-full flex flex-col">
                <PageHeader title="Tu Historial" />
                <main className="flex-grow flex justify-center items-center">
                    <LoadingSpinner message="Desplegando tus recuerdos..." />
                </main>
            </div>
        )
    }

    return (
        <div className="p-2 sm:p-4 h-full w-full flex flex-col">
            <style>{calendarStyles}</style>
            <PageHeader title="Tu Historial" />
            
            <main className="flex-grow overflow-y-auto mt-4 space-y-6">
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
                    <HistorialChart filter={activeFilter} />
                </section>
                
                <section className="bg-white border border-amber-300 shadow-lg rounded-2xl p-4 sm:p-6">
                    <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4">Calendario de Reflejos</h2>
                    <Calendar
                        className="w-full"
                        // CAMBIO 3: Usamos la nueva prop 'tileContent'
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
            </main>
        </div>
    );
}