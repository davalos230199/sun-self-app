import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, Scatter } from 'recharts';
import { Target } from 'lucide-react';
import LottieIcon from './LottieIcon'; // Tu componente LottieIcon debe estar listo

// IMPORTA TUS ANIMACIONES LOTTIE
import brainAnimation from '../assets/animations/brain-loop.json';
import emotionAnimation from '../assets/animations/emotion-loop.json'; // Asumo que tienes uno para emoción
import bodyAnimation from '../assets/animations/body-loop.json';

const timeToDecimal = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
};

// Componente Personalizado para el Eje Y con Lotties
const CustomYAxisTick = (props) => {
    const { x, y, payload } = props;
    let animationData;
    switch (payload.value) {
        case "Mente": animationData = brainAnimation; break;
        case "Emoción": animationData = emotionAnimation; break;
        case "Cuerpo": animationData = bodyAnimation; break;
        default: return null;
    }
    // Usamos un <g> de SVG para posicionar el Lottie donde recharts espera el tick
    return (
        <g transform={`translate(${x - 40}, ${y - 20})`}>
            <foreignObject width="40" height="40">
                <LottieIcon animationData={animationData} loop={true} />
            </foreignObject>
        </g>
    );
};

// ... (El CustomTooltip se mantiene igual)
const CustomTooltip = ({ active, payload }) => { /* ...código sin cambios... */ };


const CustomShape = (props) => {
    const { cx, cy, payload } = props;
    // Solo dibujamos un ícono si es una meta. Los registros ahora son el final de la línea.
    if (payload.isMeta) {
        return <Target x={cx - 10} y={cy - 10} width={20} height={20} className="text-amber-500 fill-amber-200" />;
    }
    return null;
};

const LottieDiaChart = ({ registro, metas, estado_general }) => {
    const palette = { // Paleta simplificada, puedes expandirla como antes
        path: '#d1d5db',
        axis: '#a1a1aa',
    };
    
    // El "Nacimiento del Día" ocurre a la hora del registro
    const registroHora = timeToDecimal(new Date(registro.created_at).toLocaleTimeString('en-GB'));
    const horaActualDecimal = timeToDecimal(new Date().toLocaleTimeString('en-GB'));
    const categoriasY = ["Cuerpo", "Emoción", "Mente"];

    // La data del "caminito" ahora nace en `registroHora`
    const pathData = {
        Mente: [{ x: registroHora, y: "Mente" }, { x: horaActualDecimal, y: "Mente" }],
        Emoción: [{ x: registroHora, y: "Emoción" }, { x: horaActualDecimal, y: "Emoción" }],
        Cuerpo: [{ x: registroHora, y: "Cuerpo" }, { x: horaActualDecimal, y: "Cuerpo" }],
    };

    const metasData = metas
        .filter(meta => meta.aspecto && timeToDecimal(meta.hora_meta) >= registroHora)
        .map(meta => ({
            x: timeToDecimal(meta.hora_meta),
            y: meta.aspecto.charAt(0).toUpperCase() + meta.aspecto.slice(1),
            label: meta.nombre_meta,
            hora: meta.hora_meta.slice(0, 5),
            isMeta: true,
        }));

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <ComposedChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    {/* ADIÓS A LAS RAYITAS - Sin <CartesianGrid /> */}
                    
                    <XAxis
                        type="number"
                        dataKey="x"
                        domain={[Math.floor(registroHora), 24]} // El eje X empieza cerca de la hora de registro
                        ticks={[...Array(25).keys()].filter(h => h >= Math.floor(registroHora))} // Ticks desde la hora de registro
                        tick={{ fill: palette.axis, fontSize: 12 }}
                        axisLine={{ stroke: palette.axis }}
                        tickLine={{ stroke: palette.axis }}
                    />
                    <YAxis
                        type="category"
                        dataKey="y"
                        domain={categoriasY}
                        axisLine={false} // Quitamos la línea del eje Y
                        tickLine={false} // Quitamos las marquitas del eje Y
                        width={80}
                        // AQUÍ LA MAGIA: Usamos nuestro componente Lottie como etiqueta
                        tick={<CustomYAxisTick />}
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Las 3 líneas del "caminito" que nacen con el registro */}
                    <Line dataKey="y" data={pathData.Mente} stroke={palette.path} strokeWidth={4} strokeDasharray="5 5" dot={false} activeDot={false} />
                    <Line dataKey="y" data={pathData.Emoción} stroke={palette.path} strokeWidth={4} strokeDasharray="5 5" dot={false} activeDot={false} />
                    <Line dataKey="y" data={pathData.Cuerpo} stroke={palette.path} strokeWidth={4} strokeDasharray="5 5" dot={false} activeDot={false} />

                    {/* Las metas que aparecen en el camino */}
                    <Scatter data={metasData} shape={<CustomShape />} />

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LottieDiaChart;