import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Pencil } from 'lucide-react';
import TimePicker from 'react-time-picker';
import api from '../../services/api';
import { useDia } from '../../contexts/DiaContext';

// Este componente ahora es más complejo, maneja su propia lógica de edición
export default function MetaItem({ meta, isExpanded, onExpand }) {
    const { metas, setMetas } = useDia();
    
    // Estado de edición
    const [isEditing, setIsEditing] = useState(false);
    const [editingHora, setEditingHora] = useState(meta.hora_objetivo ? meta.hora_objetivo.substring(0, 5) : '');

    const handleActionClick = (e) => { e.stopPropagation(); };

    // Lógica de colores (como en MetasPage)
    const isCompleted = meta.completada === true;
    const isNotCompleted = meta.completada === false;
    const isPending = !isCompleted && !isNotCompleted;

    const bgColor = isCompleted ? 'bg-green-100' 
                    : isNotCompleted ? 'bg-red-100' 
                    : (isEditing ? 'bg-amber-100' : 'bg-amber-50');

    const barraColor = isCompleted ? 'bg-green-500' 
                       : isNotCompleted ? 'bg-red-500' 
                       : (isEditing ? 'bg-orange-500' : 'bg-amber-500');

    // --- Handlers de Lógica ---

    const handleToggle = async (e) => {
        handleActionClick(e);
        if (isCompleted || isNotCompleted) return; // No hacer nada si ya está en un estado final

        const metasOriginales = [...metas]; // (Necesitamos 'metas' del context)
        setMetas(prev => prev.map(m => m.id === meta.id ? { ...m, completada: true } : m));
        try {
            await api.updateMeta(meta.id, { completada: true });
        } catch (error) {
            console.error("Error al completar meta, revirtiendo:", error);
            setMetas(metasOriginales);
        }
    };

    const handleStartEdit = (e) => {
        handleActionClick(e);
        setIsEditing(true);
        setEditingHora(meta.hora_objetivo ? meta.hora_objetivo.substring(0, 5) : '');
        onExpand(null); // Cierra el 'expand' si se abre el 'edit'
    };

    const handleCancelEdit = (e) => {
        handleActionClick(e);
        setIsEditing(false);
    };

    const handleSaveEdit = async (e) => {
        handleActionClick(e);
        const metasOriginales = [...metas];
        const nuevaHora = editingHora || null;

        setMetas(prev => prev.map(m => m.id === meta.id ? { 
            ...m, 
            hora_objetivo: nuevaHora,
            completada: m.completada === false ? null : m.completada // Resetea si estaba 'incompleta'
        } : m));
        
        setIsEditing(false);

        try {
            await api.updateMeta(meta.id, { 
                hora_objetivo: nuevaHora,
                completada: meta.completada === false ? null : meta.completada
            });
        } catch (error) {
            console.error("Error al guardar meta, revirtiendo:", error);
            setMetas(metasOriginales);
        }
    };


    return (
        <motion.div
            layout="position"
            onClick={() => !isEditing && onExpand(meta.id)} // Solo expande si NO está en modo edición
            className={`relative flex items-center p-4 rounded-xl shadow-md transition-all duration-300 cursor-pointer ${bgColor}`}
            style={{ opacity: isPending ? 1 : 0.8 }}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${barraColor}`}></div>
            <button
                onClick={handleToggle}
                disabled={isCompleted || isNotCompleted} // Deshabilitado si es true O false
                className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 
                    ${isCompleted ? 'bg-green-500 border-green-600' : ''}
                    ${isNotCompleted ? 'bg-red-200 border-red-400' : ''}
                    ${isPending ? 'bg-white border-zinc-300 hover:border-amber-500 cursor-pointer' : 'cursor-default'}
                `}
            >
                {isCompleted && <Check size={18} className="text-white" />}
                {isNotCompleted && <X size={18} className="text-red-500" />}
            </button>

            <div className="flex-grow ml-4 flex justify-between items-center">
                {isEditing ? (
                    // MODO EDICIÓN:
                    <>
                        <p className="font-['Patrick_Hand'] text-lg text-amber-800">{meta.descripcion}</p>
                        <div className="flex items-center gap-2">
                            <TimePicker
                                onChange={setEditingHora}
                                value={editingHora}
                                className="w-24 bg-white/70 rounded-lg"
                                disableClock={true}
                                clearIcon={null}
                                format="HH:mm"
                            />
                            <button onClick={handleSaveEdit} className="p-2 text-green-500 hover:text-green-700"><Check size={18} /></button>
                            <button onClick={handleCancelEdit} className="p-2 text-red-400 hover:text-red-500"><X size={18} /></button>
                        </div>
                    </>
                ) : (
                    // MODO VISTA:
                    <>
                        <div>
                            <p className={`font-['Patrick_Hand'] text-lg ${!isPending ? 'line-through italic text-zinc-500' : 'text-amber-800'}`}>
                                {meta.descripcion}
                            </p>
                            {meta.hora_objetivo && (
                                <div className="flex items-center italic gap-1 text-xs text-zinc-400">
                                    <Clock color='orange' size={12} />
                                    <span>{meta.hora_objetivo.substring(0, 5)}hs</span>
                                </div>
                            )}
                        </div>
                        <AnimatePresence>
                            {isExpanded && isPending && ( // Solo mostrar 'editar' si está expandida Y pendiente
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center rounded-full"
                                >
                                    <button onClick={handleStartEdit}><Pencil color='orange' size={18}/></button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </motion.div>
    );
}