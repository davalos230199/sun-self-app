// frontend/src/components/MetaHistorialDia.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';

// --- COPIA EXACTA del DonutChart de Tracking.jsx ---
// Lo necesitamos aquí para que el componente funcione
const DonutChart = ({ progress, size = 60 }) => {
    const strokeWidth = 5;
    const radius = (size / 2) - (strokeWidth / 2);
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    // Determina el color: verde si > 0, rojo si es 0 y hay metas, gris si no hay metas
    let strokeColor = "#e5e7eb"; // gris (ninguna)
    if (progress > 0) strokeColor = "#48bb78"; // verde (completadas)
    else if (progress === 0) strokeColor = "#f87171"; // rojo (falladas)


    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            <circle stroke="#e5e7eb" fill="transparent" strokeWidth={strokeWidth} r={radius} cx={size / 2} cy={size / 2} />
            <circle
                stroke={strokeColor}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="12px" fontWeight="bold" fill="#374151" className="transform rotate-90" transform-origin="center">
                {`${progress}%`}
            </text>
        </svg>
    );
};
// --- FIN de la copia del DonutChart ---


// --- El componente "Mueble" ---
export default function MetaHistorialDia({ dia, isExpanded, onToggle }) {
    // Cálculos para la Dona
    // Incluimos la meta principal en el conteo total
    const totalMetas = dia.metas_secundarias.length + 1; // +1 por la principal
    
    // Contamos las secundarias completadas + la principal (si está completada)
    const metasCompletadas = dia.metas_secundarias.filter(m => m.completada).length + (dia.meta_principal.completada ? 1 : 0);
    
    const tasaExito = totalMetas === 0 ? 0 : Math.round((metasCompletadas / totalMetas) * 100);

    // Formateo de fecha
    const fechaFormateada = new Date(dia.fecha).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    return (
        <motion.div 
            layout 
            className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden mb-4"
        >
            {/* --- SECCIÓN PRINCIPAL (SIEMPRE VISIBLE) --- */}
            <motion.div 
                layout
                className="flex items-center p-4 cursor-pointer"
                onClick={onToggle} // Llama a la función pasada desde el padre
            >
                {/* 1. LADO IZQUIERDO: La Dona */}
                <div className="flex-shrink-0 w-16 flex justify-center">
                    <DonutChart progress={tasaExito} />
                </div>

                {/* 2. CENTRO: La Meta Principal */}
                <div className="flex-grow mx-4">
                    <p className="text-xs text-zinc-500 font-semibold">{fechaFormateada}</p>
                    <h3 className={`text-lg font-['Patrick_Hand'] uppercase text-zinc-800 break-words ${dia.meta_principal.completada ? 'line-through text-zinc-500' : ''}`}>
                        {dia.meta_principal.descripcion}
                    </h3>
                </div>

                {/* 3. DERECHA: El Botón de expandir */}
                <div className="flex-shrink-0 text-zinc-400">
                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
            </motion.div>

            {/* --- SECCIÓN EXPANDIBLE (METAS SECUNDARIAS) --- */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 border-t border-dashed border-zinc-300"
                    >
                        <ul className="space-y-2 mt-3 pl-6">
                            {dia.metas_secundarias.length > 0 ? (
                                dia.metas_secundarias.map(meta => (
                                    <li key={meta.id} className="flex items-center gap-2">
                                        {meta.completada ? 
                                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> :
                                            <XCircle size={16} className="text-red-500 flex-shrink-0" />
                                        }
                                        <span className={`text-sm ${meta.completada ? 'text-zinc-500 line-through' : 'text-zinc-700'}`}>
                                            {meta.descripcion}
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500 italic">No hubo metas secundarias ese día.</p>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}