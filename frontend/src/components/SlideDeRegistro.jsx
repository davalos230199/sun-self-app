// frontend/src/components/SlideDeRegistro.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// --- Animaciones Requeridas ---
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import brainLoopAnimation from '../assets/animations/brain-loop.json';
import emotionLoopAnimation from '../assets/animations/emotion-loop.json';
import bodyLoopAnimation from '../assets/animations/body-loop.json';

// --- Sub-componente: Ícono del Clima ---
// (Lógica interna para mantener el componente limpio)
const ClimaIcon = ({ estadoGeneral }) => {
    const anim = estadoGeneral === 'soleado' 
        ? sunLoopAnimation 
        : estadoGeneral === 'lluvioso' 
        ? rainLoopAnimation 
        : cloudLoopAnimation;
    return <Lottie animationData={anim} loop={true} />;
};

// --- Sub-componente: Fila de Comentario ---
// (Lógica interna para mantener el componente limpio)
const ComentarioItem = ({ anim, text }) => (
    <div className="flex items-center gap-2 text-left">
        <div className="w-8 h-8 flex-shrink-0 -ml-1">
            <Lottie animationData={anim} loop={true} />
        </div>
        <p className="text-sm font-['Patrick_Hand'] lowercase italic text-zinc-600">"{text || '...'}"</p>
    </div>
);

// --- Componente Principal ---
// Recibe UN solo registro (sea 'registroDeHoy' o 'historial[i]')
export default function SlideDeRegistro({ registro }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Helper para la fecha (usado en Tracking)
    const getDiaLabel = (fechaRegistro) => {
        const hoy = new Date();
        const ayer = new Date();
        ayer.setDate(hoy.getDate() - 1);
        const fecha = new Date(fechaRegistro);

        if (fecha.toDateString() === hoy.toDateString()) return "Hoy";
        if (fecha.toDateString() === ayer.toDateString()) return "Ayer";
        
        let diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
        return diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1).replace('.', '');
    };

    // Si por alguna razón no hay registro, no mostramos nada.
    if (!registro) {
        return null; 
    }

    const fechaLabel = getDiaLabel(registro.created_at);

    return (
        <motion.div 
            layout 
            className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden"
        >
            {/* --- SECCIÓN PRINCIPAL (SIEMPRE VISIBLE) --- */}
            <motion.div 
                layout
                className="flex items-center p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* 1. LADO IZQUIERDO: ClimaIcon */}
                <div className="flex-shrink-0 w-12 h-12">
                    <ClimaIcon estadoGeneral={registro.estado_general} />
                </div>

                {/* 2. CENTRO: Frase de Sunny */}
                <div className="flex-grow mx-4">
                    <p className="text-xs text-zinc-500 font-semibold">{fechaLabel}</p>
                    <p className="text-sm font-['Patrick_Hand'] text-zinc-800 italic break-words line-clamp-2">
                        "{registro.frase_sunny}"
                    </p>
                </div>

                {/* 3. DERECHA: El Botón de expandir */}
                <div className="flex-shrink-0 text-zinc-400">
                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
            </motion.div>

            {/* --- SECCIÓN EXPANDIBLE (PALABRAS DEL USUARIO) --- */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 border-t border-dashed border-zinc-300"
                    >
                        <div className="space-y-2 mt-3 pl-6">
                            <ComentarioItem anim={brainLoopAnimation} text={registro.mente_comentario} />
                            <ComentarioItem anim={emotionLoopAnimation} text={registro.emocion_comentario} />
                            <ComentarioItem anim={bodyLoopAnimation} text={registro.cuerpo_comentario} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}