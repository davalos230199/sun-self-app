// frontend/src/components/SlideDeRegistro.jsx (Versión "Doble Acordeón")

import React, { useState } from 'react'; // <-- Importamos useState
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { useDia } from '../contexts/DiaContext';
import Lottie from 'lottie-react';

// --- Animaciones de Lottie ---
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';

// --- Iconos Estáticos ---
import brainIcon from '../assets/icons/brain.svg';
import emotionIcon from '../assets/icons/emotion.svg';
import bodyIcon from '../assets/icons/body.svg';

const ClimaIcon = ({ estadoGeneral }) => {
    const anim = estadoGeneral === 'soleado' 
        ? sunLoopAnimation 
        : estadoGeneral === 'lluvioso' 
        ? rainLoopAnimation 
        : cloudLoopAnimation;
    return <Lottie animationData={anim} loop={true} />;
};

// --- Sub-componente: Fila de Comentario (Lo usamos adentro del nuevo acordeón) ---
const ComentarioItem = ({ anim, text }) => (
    <div className="flex items-center gap-2 text-left mt-2 pl-1">
        <div className="w-6 h-6 flex-shrink-0">
            <img src={anim} alt="aspecto" className="w-full h-full opacity-70" />
        </div>
        <p className="text-sm font-['Patrick_Hand'] lowercase italic text-zinc-600">"{text || '...'}"</p>
    </div>
);

// --- NUEVO SUB-COMPONENTE: EL ACORDEÓN INTERNO ---
const ConsejoAcordeon = ({ icon, title, consejo, comentario, colorClass }) => {
    const [isNestedExpanded, setIsNestedExpanded] = useState(false);

    return (
        <motion.div layout className={`bg-white/50 rounded-lg overflow-hidden border ${colorClass.border}`}>
            {/* El consejo (siempre visible) y el botón de expandir */}
            <div 
                className="flex items-center p-2 cursor-pointer"
                onClick={() => setIsNestedExpanded(!isNestedExpanded)}
            >
                <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center ${colorClass.bg} rounded-full p-1 mr-2`}>
                    <img src={icon} alt={title} className="w-full h-full" />
                </div>
                <div className="flex-grow">
                    <h4 className={`font-['Patrick_Hand'] text-center ${colorClass.text}`}>{title}</h4>
                    <p className="text-xs text-zinc-700 text-center -mt-1">"{consejo || '...'}"</p>
                </div>
                <div className="flex-shrink-0 text-zinc-500">
                    {isNestedExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
            </div>

            {/* El comentario (expandible) */}
            <AnimatePresence>
                {isNestedExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`px-2 pb-2 border-t ${colorClass.border} border-dashed`}
                    >
                        <ComentarioItem anim={icon} text={comentario} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// --- Objeto de Clases de Color ---
const colorClasses = {
    mente: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200'
    },
    emocion: {
        bg: 'bg-pink-100',
        text: 'text-pink-800',
        border: 'border-pink-200'
    },
    cuerpo: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
    }
};

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
    
    // ... (función getLabel sin cambios) ...
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
                    // ... (props del botón de editar sin cambios) ...
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onEdit();
                    }}
                    title="Micro-Hábito"
                    className={`absolute top-3 mb-4 right-3 z-10 w-10 h-10 rounded-lg flex items-center justify-center 
                                ${theme.activeIcon} bg-white/50 backdrop-blur-sm shadow-lg border border-white/30 
                                hover:scale-105 transition-transform`}
                >
                    <Zap size={18} />
                </button>
            )}

            {/* --- Contenido Principal (Clickable) --- */}
            <motion.div 
                layout
                className="flex items-center p-4 cursor-pointer"
                onClick={onToggle}
            >
                {/* LADO IZQUIERDO: ClimaIcon (sin cambios) */}
                <div className="flex-shrink-0 w-12 h-12">
                    <ClimaIcon estadoGeneral={registro.estado_general} />
                </div>

                {/* CENTRO: Frase y Epígrafe (MODIFICADO) */}
                <div className={`flex-grow mx-4 ${isDashboard ? 'pr-10' : ''}`}>
                    {/* La Frase */}
                    {isDashboard ? (
                        <h2 className="text-lg text-center italic pl-2 font-['Patrick_Hand'] font-semibold text-zinc-800 break-words">
                            {registro.frase_aliento || registro.frase_sunny}
                        </h2>
                    ) : (
                        <h2 className="text-sm font-['Patrick_Hand'] text-zinc-800 italic font-semibold break-words">
                            "{registro.frase_aliento || registro.frase_sunny}"
                        </h2>
                    )}
                    
                    {/* El Epígrafe (Hora o Fecha) */}
                    <cite className="block text-right text-xs text-zinc-600 font-semibold italic">
                        {fechaLabel}
                    </cite>
                </div>

                {/* DERECHA: Botón de expandir (sin cambios) */}
                <div className="flex-shrink-0 text-zinc-500 mt-6">
                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
            </motion.div>

            {/* --- SECCIÓN EXPANDIBLE (TOTALMENTE RECONSTRUIDA) --- */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 border-t border-dashed border-amber-300"
                    >
                        {/* Aquí mostramos los CONSEJOS como acordeones anidados */}
                        <div className="space-y-2 mt-3">
                            <ConsejoAcordeon 
                                icon={brainIcon} 
                                title="Mente" 
                                consejo={registro.consejo_mente}
                                comentario={registro.mente_comentario}
                                colorClass={colorClasses.mente}
                            />
                            <ConsejoAcordeon 
                                icon={emotionIcon} 
                                title="Emoción" 
                                consejo={registro.consejo_emocion}
                                comentario={registro.emocion_comentario}
                                colorClass={colorClasses.emocion}
                            />
                            <ConsejoAcordeon 
                                icon={bodyIcon} 
                                title="Cuerpo" 
                                consejo={registro.consejo_cuerpo}
                                comentario={registro.cuerpo_comentario}
                                colorClass={colorClasses.cuerpo}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}