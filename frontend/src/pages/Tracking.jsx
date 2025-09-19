import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Estilos base del calendario
import HistorialChart from '../components/HistorialChart'; // Asumimos que este componente existe

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
        background: #fef3c7; /* Ámbar claro */
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

    // 1. Hook para buscar los datos del historial cuando se monta la página
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

    // 2. Función para renderizar el contenido de cada día en el calendario
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            // Buscamos si hay un registro para la fecha actual del tile
            const registroDelDia = historial.find(r => {
                const registroDate = new Date(r.created_at);
                return registroDate.getFullYear() === date.getFullYear() &&
                       registroDate.getMonth() === date.getMonth() &&
                       registroDate.getDate() === date.getDate();
            });

            if (registroDelDia) {
                let emoji = '❔';
                if (registroDelDia.estado_general === 'soleado') emoji = '☀️';
                if (registroDelDia.estado_general === 'nublado') emoji = '⛅';
                if (registroDelDia.estado_general === 'lluvioso') emoji = '🌧️';
                return <span className="block text-2xl mt-1">{emoji}</span>;
            }
        }
        return null;
    };
    
    // 3. Función para manejar el clic en un día (sin cambios)
    const handleDayClick = (date) => {
        const dateString = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        navigate(`/resumen/${dateString}`);
    };

    if (isLoading) {
        return <LoadingSpinner message="Revisando tus anales..." />;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <>
            <style>{calendarCustomStyles}</style>
            <div className="space-y-6 animate-fade-in">
                {/* Sección del Calendario */}
                <section className="bg-white border border-amber-200 shadow-lg rounded-2xl p-4">
                    <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4 text-center">Tu Viaje Interior</h2>
                    <Calendar
                        onClickDay={handleDayClick}
                        tileContent={tileContent}
                        maxDate={new Date()} // No se pueden seleccionar días futuros
                    />
                </section>
                
                {/* Sección del Gráfico */}
                {historial.length > 0 && (
                     <section className="bg-white border border-amber-200 shadow-lg rounded-2xl p-4">
                        <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4 text-center">La Marea de tu Ser</h2>
                        {/* El componente del gráfico ahora recibe todo el historial */}
                        <HistorialChart data={historial} />
                     </section>
                )}
            </div>
        </>
    );
}