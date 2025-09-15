import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Scatter, ComposedChart } from 'recharts';
import { Target, Brain, Heart, Bone } from 'lucide-react';

// Paletas de colores temáticas según el estado del día
const colorPalettes = {
    soleado: { grid: '#fde68a', path: '#fbbf24', text: '#ca8a04' },
    nublado: { grid: '#d1d5db', path: '#9ca3af', text: '#4b5563' },
    lluvioso: { grid: '#93c5fd', path: '#60a5fa', text: '#2563eb' },
    default: { grid: '#e5e7eb', path: '#a1a1aa', text: '#52525b' },
};

const timeToDecimal = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
};

// ... (El componente CustomTooltip se mantiene igual que antes)
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        if (!data.label) return null; // No mostrar tooltip para los puntos del camino
        return (
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm p-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                <p className="font-bold text-gray-900 dark:text-gray-100">{data.label}</p>
                {data.hora && <p className="text-sm text-gray-700 dark:text-gray-300">Hora: {data.hora}</p>}
                {data.detalle && <p className="text-sm text-gray-700 dark:text-gray-300">"{data.detalle}"</p>}
            </div>
        );
    }
    return null;
};


const CustomShape = (props) => {
    const { cx, cy, payload } = props;
    const iconProps = { x: cx - 10, y: cy - 10, width: 20, height: 20, strokeWidth: 1.5 };
    if (payload.isMeta) return <Target {...iconProps} className="text-amber-500 fill-amber-200" />;
    if (payload.isRegistro) {
        switch (payload.y) {
            case "Mente": return <Brain {...iconProps} className="text-blue-500 fill-blue-200" />;
            case "Emoción": return <Heart {...iconProps} className="text-red-500 fill-red-200" />;
            case "Cuerpo": return <Bone {...iconProps} className="text-green-500 fill-green-200" />;
        }
    }
    return null; // No dibuja nada para los puntos intermedios del camino
};

// PASAMOS EL ESTADO_GENERAL COMO PROP PARA DARLE EL TEMA
const LienzoDiaChart = ({ registro, metas, estado_general }) => {
    const palette = colorPalettes[estado_general] || colorPalettes.default;
    const categoriasY = ["Cuerpo", "Emoción", "Mente"];
    const horaActualDecimal = timeToDecimal(new Date().toLocaleTimeString('en-GB'));
    
    // --- DATA PREPARATION ---
    const metasData = metas
        .filter(meta => meta.aspecto)
        .map(meta => ({
            x: timeToDecimal(meta.hora_meta),
            y: meta.aspecto.charAt(0).toUpperCase() + meta.aspecto.slice(1),
            label: meta.nombre_meta,
            hora: meta.hora_meta.slice(0, 5),
            isMeta: true,
        }));

    const registroHora = timeToDecimal(new Date(registro.created_at).toLocaleTimeString('en-GB'));
    const registroData = [
        { x: registroHora, y: "Mente", label: "Registro Mental", detalle: registro.mente, isRegistro: true },
        { x: registroHora, y: "Emoción", label: "Registro Emocional", detalle: registro.emocion, isRegistro: true },
        { x: registroHora, y: "Cuerpo", label: "Registro Corporal", detalle: registro.cuerpo, isRegistro: true },
    ];

    // Datos para la línea del "caminito"
    const pathData = {
        Mente: [{ x: 0, y: "Mente" }, { x: horaActualDecimal, y: "Mente" }],
        Emoción: [{ x: 0, y: "Emoción" }, { x: horaActualDecimal, y: "Emoción" }],
        Cuerpo: [{ x: 0, y: "Cuerpo" }, { x: horaActualDecimal, y: "Cuerpo" }],
    };
    
    // Todos los puntos que deben ser visibles (metas y registros)
    const scatterData = [...registroData, ...metasData];

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                {/* Usamos ComposedChart para combinar líneas y puntos (scatter) */}
                <ComposedChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    {/* El estilo "Crayón" para la rejilla */}
                    <CartesianGrid strokeDasharray="5 5" stroke={palette.grid} />
                    
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="hora"
                        domain={[0, 24]}
                        ticks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
                        tick={{ fill: palette.text, fontSize: 12, fontWeight: 'bold' }}
                        axisLine={{ stroke: palette.grid }}
                        tickLine={{ stroke: palette.text }}
                    />
                    <YAxis
                        type="category"
                        dataKey="y"
                        name="aspecto"
                        domain={categoriasY}
                        tick={{ fill: palette.text, fontSize: 14, fontWeight: 'bold' }}
                        width={80}
                        axisLine={{ stroke: palette.grid }}
                        tickLine={{ stroke: 'none' }}
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Las 3 líneas del "caminito" */}
                    <Line dataKey="y" data={pathData.Mente} stroke={palette.path} strokeWidth={3} dot={false} activeDot={false} isAnimationActive={false} />
                    <Line dataKey="y" data={pathData.Emoción} stroke={palette.path} strokeWidth={3} dot={false} activeDot={false} isAnimationActive={false} />
                    <Line dataKey="y" data={pathData.Cuerpo} stroke={palette.path} strokeWidth={3} dot={false} activeDot={false} isAnimationActive={false} />

                    {/* Los íconos (metas y registros) que van sobre las líneas */}
                    <Scatter data={scatterData} shape={<CustomShape />} />

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LienzoDiaChart;