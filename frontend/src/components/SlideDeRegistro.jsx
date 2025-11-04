// frontend/src/components/SlideDeRegistro.jsx (Versión Optimizada)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 1. ELIMINAMOS LOTTIE
// import Lottie from 'lottie-react'; 
import { ChevronDown, ChevronRight } from 'lucide-react';

// 2. IMPORTAMOS LOS ICONOS ESTÁTICOS
import sunIcon from '../assets/icons/sun.svg';
import cloudIcon from '../assets/icons/cloud.svg';
import rainIcon from '../assets/icons/rain.svg';
import brainIcon from '../assets/icons/brain.svg';
import emotionIcon from '../assets/icons/emotion.svg';
import bodyIcon from '../assets/icons/body.svg';

// --- Sub-componente: Ícono del Clima (Optimizado) ---
const ClimaIcon = ({ estadoGeneral }) => {
    let iconSrc;
    switch (estadoGeneral) {
        case 'soleado': iconSrc = sunIcon; break;
        case 'lluvioso': iconSrc = rainIcon; break;
        default: iconSrc = cloudIcon;
    }
    // 3. Usamos <img> en lugar de <Lottie>
    return <img src={iconSrc} alt={estadoGeneral} className="w-full h-full" />;
};

// --- Sub-componente: Fila de Comentario (Optimizado) ---
const ComentarioItem = ({ anim, text }) => (
    <div className="flex items-center gap-2 text-left">
        <div className="w-8 h-8 flex-shrink-0 -ml-1">
            {/* 4. Usamos <img> en lugar de <Lottie> */}
            <img src={anim} alt="aspecto" className="w-full h-full" />
        </div>
        <p className="text-sm font-['Patrick_Hand'] lowercase italic text-zinc-600">"{text || '...'}"</p>
    </div>
);

// --- Componente Principal (Sin cambios de lógica) ---
export default function SlideDeRegistro({ registro, isExpanded, onToggle }) {
    // 5. Quitamos el useState local
    // const [isExpanded, setIsExpanded] = useState(false);

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

    if (!registro) return null; 

    const fechaLabel = getDiaLabel(registro.created_at);

    return (
        <motion.div 
            layout 
            className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden"
        >
            <motion.div 
                layout
                className="flex items-center p-4 cursor-pointer"
                onClick={onToggle} // 6. Usamos el onToggle del padre
            >
                {/* 1. LADO IZQUIERDO: ClimaIcon (Ahora es <img>) */}
                <div className="flex-shrink-0 w-12 h-12">
                    <ClimaIcon estadoGeneral={registro.estado_general} />
                </div>

                <div className="flex-grow mx-4">
                    <p className="text-xs text-zinc-500 font-semibold">{fechaLabel}</p>
                    <p className="text-sm font-['Patrick_Hand'] text-zinc-800 italic break-words line-clamp-2">
                        "{registro.frase_sunny}"
                    </p>
                </div>
                
                <div className="flex-shrink-0 text-zinc-400">
                    {/* 7. Usamos la prop isExpanded */}
                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
            </motion.div>

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