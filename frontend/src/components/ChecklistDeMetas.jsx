// frontend/src/components/ChecklistDeMetas.jsx (Ordenado)

import React, { useState, useMemo } from 'react'; // 1. IMPORTAMOS useMemo
import { motion, AnimatePresence } from 'framer-motion';
import { useDia } from '../contexts/DiaContext';
import api from '../services/api';
import { TrendingUp, ChevronUp, ChevronRight, Check, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Sub-componente: El Checkbox (Modificado) ---
const CheckboxMeta = ({ meta, onToggle }) => {
    const isCompleted = meta.completada === true;

    const handleToggle = (e) => {
        e.stopPropagation(); 
        if (!isCompleted) {
            onToggle(meta.id, true);
        }
    };

    return (
        <li className="flex items-center gap-3 py-2">
            <button
                onClick={handleToggle}
                disabled={isCompleted}
                className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300
                    ${isCompleted 
                        ? 'bg-green-500 border-green-600' 
                        : 'bg-white border-zinc-300 hover:border-amber-500 cursor-pointer'}
                `}
            >
                {isCompleted && <Check size={16} className="text-white" />}
            </button>
            
            {/* Contenedor de Texto */}
            <div className="flex-grow">
                <span className={`text-sm ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-700'}`}>
                    {meta.descripcion}
                </span>
                
                {/* 1. MOSTRAR HORA OBJETIVO (MODIFICADO: se muestra siempre) */}
                {meta.hora_objetivo && (
                    <div className={`flex items-center gap-1 text-xs ${isCompleted ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        <Clock size={12} />
                        <span>{meta.hora_objetivo.substring(0, 5)}hs</span>
                    </div>
                )}
            </div>
        </li>
    );
};


// --- Componente Principal: El Checklist ---
export default function ChecklistDeMetas() {
    const [isExpanded, setIsExpanded] = useState(true);
    const { registroDeHoy, metas, setMetas } = useDia();

    const handleToggleMeta = async (id, completada) => {
        const originalMetas = [...metas];
        setMetas(prev => prev.map(m => m.id === id ? { ...m, completada: true } : m));
        try {
            await api.updateMeta(id, { completada: true });
        } catch (error) {
            console.error("Error al actualizar meta:", error);
            setMetas(originalMetas);
        }
    };

    const metaPrincipal = registroDeHoy?.meta_principal_id 
        ? metas.find(m => m.id === registroDeHoy.meta_principal_id) 
        : null;
        
    // --- 2. ¡AQUÍ ESTÁ EL MARTILLAZO! ---
    // Usamos useMemo para filtrar Y ordenar las metas secundarias.
    // Esto solo se recalcula si 'metas' o 'registroDeHoy' cambian.
    const metasSecundariasOrdenadas = useMemo(() => {
        return metas
            .filter(m => m.id !== registroDeHoy?.meta_principal_id)
            .sort((a, b) => {
                // Lógica de ordenamiento (copiada de MetasPage)
                if (a.hora_objetivo && !b.hora_objetivo) return -1; // a (con hora) va antes que b (sin hora)
                if (!a.hora_objetivo && b.hora_objetivo) return 1;  // b (con hora) va antes que a (sin hora)
                if (a.hora_objetivo && b.hora_objetivo) {
                    return a.hora_objetivo.localeCompare(b.hora_objetivo); // Ordena por string (HH:MM)
                }
                return 0; // Mantiene el orden si ambas no tienen hora
            });
    }, [metas, registroDeHoy?.meta_principal_id]); // Dependencias del useMemo
    // --- FIN DEL MARTILLAZO ---

    if (!metaPrincipal) {
        // ... (el 'placeholder' sin cambios)
        return (
            <Link to="/app/metas" className="no-underline text-inherit block">
                <div className="bg-green-100 border border-green-400 rounded-2xl p-4 text-center justify-center shadow-lg transition-transform hover:scale-[1.02]">
                    <h3 className="font-['Patrick_Hand'] text-xl text-amber-800">No definiste una meta principal.</h3>
                    <p className="text-zinc-500 text-sm mt-1">Toca aquí para añadir tus metas del día.</p>
                </div>
            </Link>
        );
    }

    return (
        <motion.div 
            layout 
            className="bg-green-100 border border-green-400 rounded-2xl shadow-lg overflow-hidden"
        >
            {/* --- SECCIÓN PRINCIPAL (Con Énfasis) --- */}
            <motion.div 
                layout
                className="flex items-center p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-shrink-0 text-green-800">
                    <TrendingUp size={28} />
                </div>

                <div className="flex-grow mx-4 text-center">
                    <h2 className="font-['Patrick_Hand'] uppercase text-2xl font-semibold text-green-800 break-words">
                        {metaPrincipal.descripcion}
                    </h2>
                    <p className="text-sm text-amber-800 font-semibold">Tu Meta De Hoy</p>
                </div>

                <div className="flex-shrink-0 text-green-800">
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronRight size={24} />}
                </div>
            </motion.div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 border-t border-dashed border-green-300"
                    >
                        <ul className="space-y-1 mt-3 pl-2">
                            {/* 3. Usamos la nueva variable ordenada */}
                            {metasSecundariasOrdenadas.length > 0 ? (
                                metasSecundariasOrdenadas.map(meta => (
                                    <CheckboxMeta 
                                        key={meta.id} 
                                        meta={meta} 
                                        onToggle={handleToggleMeta} 
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-green-800 italic p-2 text-center">
                                    No hay más metas secundarias. ¡A por la principal!
                                </p>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

