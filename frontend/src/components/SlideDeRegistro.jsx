// frontend/src/components/SlideDeRegistro.jsx (Versión Con Magia y Prolijo)

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { useDia } from '../contexts/DiaContext';
import Lottie from 'lottie-react'; // 1. VOLVEMOS A IMPORTAR LOTTIE

// --- Animaciones de Lottie ---
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';

// --- Iconos Estáticos (para el desplegable) ---
import brainIcon from '../assets/icons/brain.svg';
import emotionIcon from '../assets/icons/emotion.svg';
import bodyIcon from '../assets/icons/body.svg';

// --- 2. VOLVEMOS A CREAR EL SUB-COMPONENTE LOTTIE ---
const ClimaIcon = ({ estadoGeneral }) => {
    const anim = estadoGeneral === 'soleado' 
        ? sunLoopAnimation 
        : estadoGeneral === 'lluvioso' 
        ? rainLoopAnimation 
        : cloudLoopAnimation;
    return <Lottie animationData={anim} loop={true} />;
};

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
            {/* --- Botón de Editar (Absoluto) --- */}
            {isDashboard && onEdit && (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Evita que el slide se cierre
                        onEdit();
                    }}
                    title="Editar Micro-Hábito"
                    // 3. Botón de editar más pequeño y prolijo
                    className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-lg flex items-center justify-center 
                                ${theme.activeIcon} bg-white/50 backdrop-blur-sm shadow-lg border border-white/30 
                                hover:scale-105 transition-transform`}
                >
                    <Zap size={18} />
                </button>
            )}

            {/* --- Contenido Principal (Clickable) --- */}
            <motion.div 
                layout
                // 4. Alineación vertical al centro
                className="flex items-center p-4 cursor-pointer"
                onClick={onToggle}
            >
                {/* 5. LADO IZQUIERDO: ClimaIcon (Restaurado) */}
                <div className="flex-shrink-0 w-12 h-12">
                    <ClimaIcon estadoGeneral={registro.estado_general} />
                </div>

                {/* 6. CENTRO: Frase y Epígrafe (Bien distribuido) */}
                <div className={`flex-grow mx-4 ${isDashboard ? 'pr-10' : ''}`}> {/* Espacio para el botón de editar */}
                    {/* La Frase */}
                    {isDashboard ? (
                        <h2 className="text-lg text-center italic pl-2 font-['Patrick_Hand'] font-semibold text-zinc-800 break-words">
                            {registro.frase_sunny}
                        </h2>
                    ) : (
                        <h2 className="text-sm font-['Patrick_Hand'] text-zinc-800 italic break-words">
                            "{registro.frase_sunny}"
                        </h2>
                    )}
                    
                    {/* El Epígrafe (Hora o Fecha) */}
                    <cite className="block text-right text-xs text-zinc-600 font-semibold not-italic mt-1">
                        {fechaLabel}
                    </cite>
                </div>

                {/* 7. DERECHA: Botón de expandir (separado y prolijo) */}
                <div className="flex-shrink-0 text-zinc-500">
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
                        <div className="space-y-2 mt-3">
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