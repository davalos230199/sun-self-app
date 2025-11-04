// frontend/src/components/SlideDeRegistro.jsx (Versión Optimizada y con Variantes)

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';

// --- Iconos Estáticos ---
import sunIcon from '../assets/icons/sun.svg';
import cloudIcon from '../assets/icons/cloud.svg';
import rainIcon from '../assets/icons/rain.svg';
import brainIcon from '../assets/icons/brain.svg';
import emotionIcon from '../assets/icons/emotion.svg';
import bodyIcon from '../assets/icons/body.svg';

// --- Sub-componente: Ícono del Clima ---
const ClimaIcon = ({ estadoGeneral }) => {
    let iconSrc;
    switch (estadoGeneral) {
        case 'soleado': iconSrc = sunIcon; break;
        case 'lluvioso': iconSrc = rainIcon; break;
        default: iconSrc = cloudIcon;
    }
    return <img src={iconSrc} alt={estadoGeneral} className="w-full h-full" />;
};

// --- Sub-componente: Fila de Comentario ---
const ComentarioItem = ({ anim, text }) => (
    <div className="flex items-center gap-2 text-left">
        <div className="w-8 h-8 flex-shrink-0 -ml-1">
            <img src={anim} alt="aspecto" className="w-full h-full" />
        </div>
        <p className="text-sm font-['Patrick_Hand'] lowercase italic text-zinc-600">"{text || '...'}"</p>
    </div>
);

// --- Componente Principal ---
export default function SlideDeRegistro({ 
    registro, 
    isExpanded, 
    onToggle, 
    variant = 'tracking', // 'tracking' (default) o 'dashboard'
    onEdit // Función para el botón de editar (solo en dashboard)
}) {

    if (!registro) {
        return null; 
    }

    const isDashboard = variant === 'dashboard';

    // --- Lógica de Fecha/Hora ---
    const getLabel = (fechaRegistro) => {
        const fecha = new Date(fechaRegistro);
        
        // VARIANTE DASHBOARD: Muestra "Hoy, HH:MM hs"
        if (isDashboard) {
            const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            return `Hoy, ${horaFormateada} hs`;
        }

        // VARIANTE TRACKING: Muestra "Hoy", "Ayer" o "DD/MM/YYYY"
        const hoy = new Date();
        const ayer = new Date();
        ayer.setDate(hoy.getDate() - 1);

        if (fecha.toDateString() === hoy.toDateString()) return "Hoy";
        if (fecha.toDateString() === ayer.toDateString()) return "Ayer";
        
        return fecha.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };
    
    const fechaLabel = getLabel(registro.created_at);

    return (
        <motion.div 
            layout 
            className="relative bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden"
        >
            {/* --- Botón de Editar (Solo en Dashboard) --- */}
            {isDashboard && onEdit && (
                <button
                    onClick={onEdit}
                    title="Editar Micro-Hábito"
                    className="absolute top-3 right-3 z-10 w-12 h-12 rounded-lg flex items-center justify-center 
                               bg-amber-100/80 backdrop-blur-sm shadow-lg border border-amber-200 
                               hover:scale-105 transition-transform text-zinc-700"
                >
                    <Zap size={20} />
                </button>
            )}

            {/* --- SECCIÓN PRINCIPAL (SIEMPRE VISIBLE) --- */}
            <motion.div 
                layout
                className="flex items-center p-4 cursor-pointer"
                onClick={onToggle}
            >
                {/* 1. LADO IZQUIERDO: ClimaIcon */}
                <div className="flex-shrink-0 w-12 h-12">
                    <ClimaIcon estadoGeneral={registro.estado_general} />
                </div>

                {/* 2. CENTRO: Frase de Sunny */}
                <div className="flex-grow mx-4">
                    <p className="text-xs text-zinc-500 font-semibold">{fechaLabel}</p>
                    
                    {/* Estilo condicional para la frase */}
                    {isDashboard ? (
                        <p className="text-lg font-['Patrick_Hand'] text-zinc-800 font-semibold break-words">
                            {registro.frase_sunny}
                        </p>
                    ) : (
                        <p className="text-sm font-['Patrick_Hand'] text-zinc-800 italic break-words line-clamp-2">
                            "{registro.frase_sunny}"
                        </p>
                    )}
                </div>

                {/* 3. DERECHA: El Botón de expandir */}
                <div className="flex-shrink-0 text-zinc-400 mr-8"> {/* Damos espacio para el botón de editar */}
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
                            <ComentarioItem anim={brainIcon} text={registro.mente_comentario} />
                            <ComentarioItem anim={emotionIcon} text={registro.emocion_comentario} />
                            <ComentarioItem anim={bodyIcon} text={registro.cuerpo_comentario} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
