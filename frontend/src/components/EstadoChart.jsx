import { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './EstadoChart.css';

// Componente para el Tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        let estadoLabel;
        switch (payload[0].value) {
            case 4: estadoLabel = 'Soleado ☀️'; break;
            case 3: estadoLabel = 'Nublado ⛅'; break;
            case 2: estadoLabel = 'Lluvioso 🌧️'; break;
            default: estadoLabel = 'Desconocido';
        }
        return (
            <div className="custom-tooltip">
                <p className="label">{`Fecha: ${label}`}</p>
                <p className="intro">{`Estado: ${estadoLabel}`}</p>
            </div>
        );
    }
    return null;
};

export default function EstadoChart({ filter }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.getChartData(filter);
                setData(response.data);
                setError(null);
            } catch (err) {
                console.error("Error al cargar datos del gráfico:", err);
                setError("No se pudieron cargar los datos de tu fluctuación.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filter]); // Se vuelve a ejecutar cada vez que cambia el filtro

    if (loading) return <p className="chart-message">Dibujando tus fluctuaciones...</p>;
    if (error) return <p className="chart-message error">{error}</p>;
    if (data.length === 0) return <p className="chart-message">No hay suficientes datos para dibujar un gráfico en este período.</p>;

    const yAxisTickFormatter = (value) => {
        switch (value) {
            case 4: return 'Soleado';
            case 3: return 'Nublado';
            case 2: return 'Lluvioso';
            default: return '';
        }
    };

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="fecha" tick={{ fontFamily: 'var(--font-cuerpo)', fontSize: 12 }} />
                    <YAxis 
                        domain={[1.5, 4.5]} // Dominio para centrar los valores 2, 3, 4
                        ticks={[2, 3, 4]}   // Solo mostramos estos ticks
                        tickFormatter={yAxisTickFormatter}
                        tick={{ fontFamily: 'var(--font-cuerpo)', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontFamily: 'var(--font-cuerpo)', fontSize: 14, paddingTop: '20px' }} />
                    <Line 
                        type="monotone" 
                        dataKey="valor" 
                        name="Tu Fluctuación"
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 5, fill: '#8884d8' }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
