// frontend/src/components/SlideDeRegistro.jsx (Versión Refinada)

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { useDia } from '../contexts/DiaContext';

// --- Iconos Estáticos (solo los necesarios para el desplegable) ---
import brainIcon from '../assets/icons/brain.svg';
import emotionIcon from '../assets/icons/emotion.svg';
import bodyIcon from '../assets/icons/body.svg';

// --- (ClimaIcon ya no se usa aquí) ---

// --- Sub-componente: Fila de Comentario (Sin cambios) ---
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
    variant = 'tracking', 
    onEdit 
}) {
    const { theme } = useDia(); 

    if (!registro) {
        return null; 
    }

    const isDashboard = variant === 'dashboard';

    const getLabel = (fechaRegistro) => {
        const fecha = new Date(fechaRegistro);
        
        if (isDashboard) {
            const horaFormateada = fecha.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            return `${horaFormateada} hs`;
        }

        const hoy = new Date();
        const ayer = new Date();
        ayer.setDate(hoy.getDate() - 1);
        if (fecha.toDateString() === hoy.toDateString()) return "Hoy";
        if (fecha.toDateString() === ayer.toDateString()) return "Ayer";
        return fecha.toLocaleDateString('es-ES', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    };
    
    const fechaLabel = getLabel(registro.created_at);

    return (
        <motion.div 
            layout 
            className={`relative ${theme.headerBg} rounded-2xl shadow-lg border ${theme.headerBorder} overflow-hidden`}
        >
            {isDashboard && onEdit && (
                <button
                    onClick={onEdit}
                    title="Editar Micro-Hábito"
                    className={`absolute top-3 right-3 z-10 w-12 h-12 rounded-lg flex items-center justify-center 
                                ${theme.activeIcon} bg-white/50 backdrop-blur-sm shadow-lg border border-white/30 
                                hover:scale-105 transition-transform`}
                >
                    <Zap size={20} />
                </button>
            )}

            <motion.div 
                layout
                className="flex items-start p-4 cursor-pointer" // items-start para alinear
                onClick={onToggle}
            >
                {/* 1. SE ELIMINÓ EL DIV DE LOS 3 ICONOS */}

                {/* 2. REDISEÑO: Frase y Epígrafe */}
                {/* Ajustamos 'ml-4' a 'w-full' ya que no hay icono a la izquierda */}
                <div className="w-full flex flex-col min-h-[6rem]">
                    {/* La Frase (con énfasis) */}
                    <div className="flex-grow pr-12"> {/* Damos espacio para el botón de editar/chevron */}
                        <h2 className="text-xl font-['Patrick_Hand'] text-zinc-900 font-semibold break-words">
                            {registro.frase_sunny}
                        </h2>
                    </div>
                    
                    {/* El Epígrafe (Hora) - ya tiene 'text-right' */}
                    {isDashboard && (
                        <cite className="block text-right text-xs text-zinc-600 font-semibold not-italic mt-2">
                            {fechaLabel}
                        </cite>
                    )}
                </div>

                {/* 3. Botón de expandir (lo movemos dentro del div principal para mejor alineación) */}
                <div className="absolute top-4 right-16 flex-shrink-0 text-zinc-500 mt-1">
                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
            </motion.div>

            {/* --- SECCIÓN EXPANDIBLE (Sin cambios) --- */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 border-t border-dashed border-amber-300"
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

