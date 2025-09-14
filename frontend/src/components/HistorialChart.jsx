// frontend/src/components/HistorialChart.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// La línea que causaba el error (`import "./EstadoChart.css";`) ha sido eliminada.

const yAxisTickFormatter = (value) => {
    if (value === 4) return '☀️';
    if (value === 3) return '⛅';
    if (value === 2) return '🌧️';
    return '';
};

const HistorialChart = ({ filter, estadoGeneral }) => {
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

    if (loading) return <LoadingSpinner message="Dibujando tus días..." estadoGeneral={estadoGeneral} />;
    if (error) return <div className="text-center py-10 text-red-600 italic">{error}</div>;
    if (data.length === 0) return <div className="text-center py-10 text-zinc-500 italic">No hay datos para este período.</div>;

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

export default React.memo(HistorialChart);