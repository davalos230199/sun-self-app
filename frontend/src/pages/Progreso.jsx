// frontend/src/pages/Progreso.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, XAxis } from 'recharts';
import Lottie from 'lottie-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Importamos las animaciones para los iconos
import brainLoopAnimation from '../assets/animations/brain-loop.json';
import emotionLoopAnimation from '../assets/animations/emotion-loop.json';
import bodyLoopAnimation from '../assets/animations/body-loop.json';

// --- Sub-componente para cada "Slide" de Aspecto ---
const AspectoSlide = ({ aspecto, data, color, animacion }) => {
    // Preparamos los datos para el gráfico, usando useMemo para eficiencia
    const chartData = useMemo(() => 
        data.map(d => ({
            // Solo nos interesa el valor del aspecto para el eje Y
            valor: d[aspecto] 
        })).reverse(), // Invertimos para que la línea vaya de izquierda (antiguo) a derecha (nuevo)
    [data, aspecto]);

    return (
        // Cada slide es un Link a una futura sección de detalle
        <Link to="#" className="no-underline text-inherit block">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg border border-zinc-200 h-32">
                {/* Icono a la izquierda */}
                <div className="w-24 h-24 flex-shrink-0">
                    <Lottie animationData={animacion} loop={true} />
                </div>

                {/* Gráfico a la derecha */}
                <div className="w-full h-full">
                    <ResponsiveContainer>
                        <AreaChart data={chartData}>
                            {/* Definimos un degradado para el área */}
                            <defs>
                                <linearGradient id={`color-${aspecto}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            {/* La línea principal del gráfico */}
                            <Area type="monotone" dataKey="valor" stroke={color} strokeWidth={4} fill={`url(#color-${aspecto})`} />
                            {/* Opcional: Eje X minimalista solo con el primer y último valor */}
                            <XAxis dataKey="name" tick={false} axisLine={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Link>
    );
};


export default function Progreso() {
    const [historialSemanal, setHistorialSemanal] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const response = await api.getResumenSemanal();
                // Mapeamos los datos para que sean más fáciles de usar
                const formattedData = response.data.map(reg => ({
                    mente: reg.mente_estado,
                    emocion: reg.emocion_estado,
                    cuerpo: reg.cuerpo_estado
                }));
                setHistorialSemanal(formattedData);
            } catch (error) {
                console.error("Error al cargar el resumen semanal:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistorial();
    }, []);

    if (isLoading) {
        return <LoadingSpinner message="Analizando tu progreso..." />;
    }

    return (
        <main className="h-full overflow-y-auto p-4 space-y-6">
            <h2 className="font-['Patrick_Hand'] text-3xl text-zinc-800 text-center">Tu Fluctuación Semanal</h2>
            
            <AspectoSlide 
                aspecto="mente"
                data={historialSemanal}
                color="#3b82f6" // Azul
                animacion={brainLoopAnimation}
            />
            <AspectoSlide 
                aspecto="emocion"
                data={historialSemanal}
                color="#8b5cf6" // Violeta
                animacion={emotionLoopAnimation}
            />
            <AspectoSlide 
                aspecto="cuerpo"
                data={historialSemanal}
                color="#10b981" // Verde
                animacion={bodyLoopAnimation}
            />
        </main>
    );
}