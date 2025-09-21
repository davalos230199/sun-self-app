import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


// --- 1. Importamos los SVGs estáticos ---
import sunIcon from '../assets/icons/sun.svg';
import cloudIcon from '../assets/icons/cloud.svg';
import rainIcon from '../assets/icons/rain.svg';

const COLORS = { mente: '#3b82f6', emocion: '#8b5cf6', cuerpo: '#10b981', grid: '#e5e7eb' };

export default function HistorialChart({ data, filter, visibility }) {
    
    const processedData = useMemo(() => {
        // ... (lógica de procesamiento de datos no cambia) ...
        const endDate = new Date();
        let startDate = new Date();
        
        switch (filter) {
            case 'dia': startDate.setDate(endDate.getDate() - 1); break;
            case 'semana': startDate.setDate(endDate.getDate() - 7); break;
            case 'quince': startDate.setDate(endDate.getDate() - 15); break;
            case 'todo':
            default: startDate = new Date(0);
        }

        const filteredByDate = data.filter(item => new Date(item.created_at) >= startDate && new Date(item.created_at) <= endDate);
        const groupedByDay = filteredByDate.reduce((acc, curr) => {
            const day = new Date(curr.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            if (!acc[day]) acc[day] = [];
            acc[day].push(curr);
            return acc;
        }, {});
        
        return Object.keys(groupedByDay).map(day => {
            const dayEntries = groupedByDay[day];
            const avg = (key) => dayEntries.reduce((sum, entry) => sum + entry[key], 0) / dayEntries.length;
            return { name: day, mente: avg('mente_estado'), emocion: avg('emocion_estado'), cuerpo: avg('cuerpo_estado') };
        });
    }, [data, filter]);

    if (!processedData || processedData.length === 0) {
        return <div className="text-center text-zinc-500 py-10">No hay datos para mostrar en este período.</div>;
    }

    return (
        <div className="relative w-full h-[350px]">
                <div className="absolute top-0 left-0 w-8 h-full z-10">
                {/* --- 2. Reemplazamos Lottie por <img> --- */}
                <div className="absolute w-10 h-10" style={{ top: '12%', transform: 'translateY(-50%)' }} title="Soleado (83)">
                    <img src={sunIcon} alt="Soleado" />
                </div>
                <div className="absolute w-10 h-10" style={{ top: '45%', transform: 'translateY(-50%)' }} title="Nublado (50)">
                    <img src={cloudIcon} alt="Nublado" />
                </div>
                <div className="absolute w-10 h-10" style={{ top: '78%', transform: 'translateY(-50%)' }} title="Lluvioso (16)">
                    <img src={rainIcon} alt="Lluvioso" />
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                    <XAxis dataKey="name" tick={{ fontFamily: 'Patrick Hand', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontFamily: 'Patrick Hand', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '0.75rem', borderColor: '#fcd34d', fontFamily: 'Patrick Hand' }} />
                    {/* Las líneas ahora usan la prop 'visibility' que viene de Tracking.jsx */}
                    <Line type="monotone" dataKey="mente" stroke={COLORS.mente} strokeWidth={3} dot={false} activeDot={{ r: 6 }} hide={!visibility.mente} />
                    <Line type="monotone" dataKey="emocion" stroke={COLORS.emocion} strokeWidth={3} dot={false} activeDot={{ r: 6 }} hide={!visibility.emocion} />
                    <Line type="monotone" dataKey="cuerpo" stroke={COLORS.cuerpo} strokeWidth={3} dot={false} activeDot={{ r: 6 }} hide={!visibility.cuerpo} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}