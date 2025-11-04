// frontend/src/components/ChecklistDeMetas.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDia } from '../contexts/DiaContext';
import api from '../services/api';
import { TrendingUp, ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Sub-componente: El Checkbox (Botón) ---
const CheckboxMeta = ({ meta, onToggle }) => {
    const isCompleted = meta.completada === true;
    const isNotCompleted = meta.completada === false; // (No lo usamos, pero es la lógica)

    const handleToggle = (e) => {
        e.stopPropagation(); // Evita que el slide se cierre al clickear la meta
        // Solo permitimos marcar como 'completada'
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
            <span className={`text-sm ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-700'}`}>
                {meta.descripcion}
            </span>
        </li>
    );
};


// --- Componente Principal: El Checklist ---
export default function ChecklistDeMetas() {
    // 1. Estado: Abierto por defecto
    const [isExpanded, setIsExpanded] = useState(true);

    // 2. Datos: Traemos todo del contexto
    const { registroDeHoy, metas, setMetas, isLoading } = useDia();

    // 3. Lógica de API: (Copiada de MetasPage)
    const handleToggleMeta = async (id, completada) => {
        const originalMetas = [...metas];
        // Actualización optimista
        setMetas(prev => prev.map(m => m.id === id ? { ...m, completada: true } : m));
        try {
            await api.updateMeta(id, { completada: true });
        } catch (error) {
            console.error("Error al actualizar meta:", error);
            setMetas(originalMetas); // Revertir en caso de error
        }
    };

    // 4. Lógica de Datos: Separar metas
    const metaPrincipal = registroDeHoy?.meta_principal_id 
        ? metas.find(m => m.id === registroDeHoy.meta_principal_id) 
        : null;
        
    const metasSecundarias = metas.filter(m => m.id !== registroDeHoy?.meta_principal_id);

    // 5. Renderizado
    
    // Si no hay meta principal, mostramos un link para ir a Metas
    if (!metaPrincipal) {
        return (
            <Link to="/app/metas" className="no-underline text-inherit block">
                <div className="bg-green-100 border border-green-400 rounded-2xl p-4 text-center justify-center shadow-lg transition-transform hover:scale-[1.02]">
                    <h3 className="font-['Patrick_Hand'] text-xl text-amber-800">No definiste una meta principal.</h3>
                    <p className="text-zinc-500 text-sm mt-1">Toca aquí para añadir tus metas del día.</p>
                </div>
            </Link>
        );
    }

    // Si SÍ hay meta principal, mostramos el acordeón
    return (
        <motion.div 
            layout 
            className="bg-green-100 border border-green-400 rounded-2xl shadow-lg overflow-hidden"
        >
            {/* --- SECCIÓN PRINCIPAL (El "Slide") --- */}
            <motion.div 
                layout
                className="flex items-center p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-shrink-0 text-green-800">
                    <TrendingUp size={24} />
                </div>

                <div className="flex-grow mx-4">
                    <p className="text-xs text-amber-800 font-semibold">TU META DE HOY</p>
                    <h3 className={`text-xl font-['Patrick_Hand'] text-green-900 break-words ${metaPrincipal.completada ? 'line-through text-green-700' : ''}`}>
                        {metaPrincipal.descripcion}
                    </h3>
                </div>

                <div className="flex-shrink-0 text-green-800">
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
            </motion.div>

            {/* --- SECCIÓN EXPANDIBLE (Metas Secundarias) --- */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        // Damos padding-bottom para separarlo del borde
                        className="px-4 pb-4 border-t border-dashed border-green-300"
                    >
                        <ul className="space-y-1 mt-3 pl-2">
                            {/* Marcamos la Meta Principal (si no está completa) */}
                            {!metaPrincipal.completada && (
                                <CheckboxMeta 
                                    meta={metaPrincipal} 
                                    onToggle={handleToggleMeta} 
                                />
                            )}
                            
                            {/* Mapeamos las secundarias */}
                            {metasSecundarias.map(meta => (
                                <CheckboxMeta 
                                    key={meta.id} 
                                    meta={meta} 
                                    onToggle={handleToggleMeta} 
                                />
                            ))}

                            {metasSecundarias.length === 0 && !metaPrincipal.completada && (
                                <p className="text-sm text-green-800 italic p-2">¡Completa tu meta principal!</p>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}