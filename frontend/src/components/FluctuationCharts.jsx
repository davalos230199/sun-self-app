import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import './FluctuationCharts.css';

// Colores definidos para cada estado
const COLOR_MAP = {
    'soleado': '#FFD700', // Amarillo
    'nublado': '#87CEEB', // Azul Cielo
    'lluvioso': '#00008B', // Azul Marino
};

export default function FluctuationCharts() {
    const [fullData, setFullData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroTiempo, setFiltroTiempo] = useState('todo');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.getRegistros();
                
                // Procesamos los datos para incluirlos en el gráfico de torta
                const processedData = response.data.map(registro => ({
                    ...registro,
                    fecha: new Date(registro.created_at),
                    estado_general: registro.estado_general || 'nublado' // Valor por defecto para evitar errores
                }));
                
                setFullData(processedData);
                setError(null);
            } catch (err) {
                console.error("Error al cargar datos:", err);
                setError("No se pudieron cargar tus datos.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    // Lógica para filtrar los datos según el selector de tiempo
    const datosFiltrados = useMemo(() => {
        const ahora = new Date();
        const unMesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
        const quinceDiasAtras = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000);
        const unaSemanaAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (filtroTiempo === 'mes') {
            return fullData.filter(d => d.fecha >= unMesAtras);
        }
        if (filtroTiempo === 'quince') {
            return fullData.filter(d => d.fecha >= quinceDiasAtras);
        }
        if (filtroTiempo === 'semana') {
            return fullData.filter(d => d.fecha >= unaSemanaAtras);
        }
        return fullData;
    }, [fullData, filtroTiempo]);

    // Preparamos los datos para el gráfico de torta
    const pieData = useMemo(() => {
        const counts = datosFiltrados.reduce((acc, entry) => {
            const estado = entry.estado_general;
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {});
        
        return Object.keys(counts).map(estado => ({
            name: `${estado.charAt(0).toUpperCase() + estado.slice(1)}`, // Capitaliza el nombre
            value: counts[estado]
        }));
    }, [datosFiltrados]);

    if (loading) return <p className="chart-message">Dibujando tu historial...</p>;
    if (error) return <p className="chart-message error">{error}</p>;

    return (
        <div className="analysis-container">
            {/* Contenedor para los selectores */}
            <div className="selectors-wrapper">
                <div className="tiempo-selector">
                    <button className={`tiempo-btn ${filtroTiempo === 'todo' ? 'active' : ''}`} onClick={() => setFiltroTiempo('todo')}>Todo</button>
                    <button className={`tiempo-btn ${filtroTiempo === 'mes' ? 'active' : ''}`} onClick={() => setFiltroTiempo('mes')}>Último Mes</button>
                    <button className={`tiempo-btn ${filtroTiempo === 'quince' ? 'active' : ''}`} onClick={() => setFiltroTiempo('quince')}>Últimos 15 Días</button>
                    <button className={`tiempo-btn ${filtroTiempo === 'semana' ? 'active' : ''}`} onClick={() => setFiltroTiempo('semana')}>Última Semana</button>
                </div>
            </div>

            {pieData.length === 0 ? (
                <p className="chart-message">No hay datos para el período seleccionado.</p>
            ) : (
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label
                            >
                                {
                                    pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.name.toLowerCase()]} />
                                    ))
                                }
                            </Pie>
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
