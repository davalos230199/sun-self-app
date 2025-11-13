import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Pencil } from 'lucide-react';
import TimePicker from 'react-time-picker';
import api from '../../services/api';
import { useDia } from '../../contexts/DiaContext';

// Este componente ahora es más complejo, maneja su propia lógica de edición
export default function MetaItem({ meta, isExpanded, onExpand, variant = 'full' }) {
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

        const metasOriginales = [...metas]; 
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
        if (onExpand) onExpand(null); // Cierra el 'expand' si se abre el 'edit'
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
            const metaOriginal = metasOriginales.find(m => m.id === meta.id);
            await api.updateMeta(meta.id, { 
                hora_objetivo: nuevaHora,
                completada: metaOriginal?.completada === false ? null : metaOriginal?.completada
            });
        } catch (error) {
            console.error("Error al guardar meta, revirtiendo:", error);
            setMetas(metasOriginales);
        }
    };


    // 2. DEFINIMOS LOS ESTILOS DINÁMICOS BASADOS EN LA VARIANTE
    const isCompact = variant === 'compact';

    const styles = {
        containerPadding: isCompact ? 'p-2' : 'p-4',
        checkboxSize: isCompact ? 'w-6 h-6' : 'w-7 h-7',
        checkboxIconSize: isCompact ? 16 : 18,
        marginLeft: isCompact ? 'ml-3' : 'ml-4',
        descFont: isCompact ? 'text-base' : 'text-lg',
        timeFont: isCompact ? 'text-[11px]' : 'text-xs',
        timeIconSize: isCompact ? 10 : 12,
        timePickerWidth: isCompact ? 'w-20' : 'w-24',
        editIconSize: isCompact ? 16 : 18
    };

    return (
        <motion.div
            layout="position"
            onClick={() => !isEditing && onExpand && onExpand(meta.id)}
            // --- 3. APLICAMOS EL PADDING DEL CONTENEDOR ---
            className={`relative flex items-center rounded-xl shadow-md transition-all duration-300 cursor-pointer ${styles.containerPadding} ${bgColor}`}
            style={{ opacity: isPending ? 1 : 0.8 }}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${barraColor}`}></div>
            
            {/* --- 4. APLICAMOS TAMAÑO DE CHECKBOX --- */}
            <button
                onClick={handleToggle}
                disabled={isCompleted || isNotCompleted}
                className={`flex-shrink-0 ${styles.checkboxSize} rounded-lg border-2 flex items-center justify-center transition-all duration-300 
                    ${isCompleted ? 'bg-green-500 border-green-600' : ''}
                    ${isNotCompleted ? 'bg-red-200 border-red-400' : ''}
                    ${isPending ? 'bg-white border-zinc-300 hover:border-amber-500 cursor-pointer' : 'cursor-default'}
                `}
            >
                {/* --- 5. APLICAMOS TAMAÑO DE ICONO DE CHECKBOX --- */}
                {isCompleted && <Check size={styles.checkboxIconSize} className="text-white" />}
                {isNotCompleted && <X size={styles.checkboxIconSize} className="text-red-500" />}
            </button>

             {/* --- 6. APLICAMOS MARGEN IZQUIERDO --- */}
            <div className={`flex-grow ${styles.marginLeft} flex justify-between items-center`}>
                {isEditing ? (
                    // MODO EDICIÓN:
                    <>
                        {/* --- 7. APLICAMOS TAMAÑO DE FUENTE --- */}
                        <p className={`font-['Patrick_Hand'] ${styles.descFont} text-amber-800`}>{meta.descripcion}</p>
                        <div className="flex items-center gap-2">
                            {/* --- 8. APLICAMOS ANCHO DE TIMEPICKER --- */}
                            <TimePicker
                                onChange={setEditingHora}
                                value={editingHora}
                                className={`${styles.timePickerWidth} bg-white/70 rounded-lg`}
                                disableClock={true}
                                clearIcon={null}
                                format="HH:mm"
                            />
                            {/* --- 9. APLICAMOS TAMAÑO ICONOS DE EDICIÓN --- */}
                            <button onClick={handleSaveEdit} className="p-2 text-green-500 hover:text-green-700"><Check size={styles.editIconSize} /></button>
                            <button onClick={handleCancelEdit} className="p-2 text-red-400 hover:text-red-500"><X size={styles.editIconSize} /></button>
                        </div>
                    </>
                ) : (
                    // MODO VISTA:
                    <>
                        <div>
                            {/* --- 10. APLICAMOS TAMAÑO DE FUENTE DE DESCRIPCIÓN --- */}
                            <p className={`ml-14 font-['Patrick_Hand'] ${styles.descFont} ${!isPending ? 'line-through italic text-zinc-500' : 'text-amber-800'}`}>
                                {meta.descripcion}
                            </p>
                            {meta.hora_objetivo && (
                                // --- 11. APLICAMOS TAMAÑO DE FUENTE Y DE ICONO DE HORA ---
                                <div className={`flex items-center ml-24 italic gap-1 ${styles.timeFont} text-zinc-400`}>
                                    <Clock color='orange' size={styles.timeIconSize} />
                                    <span>{meta.hora_objetivo.substring(0, 5)}hs</span>
                                </div>
                            )}
                        </div>
                        <AnimatePresence>
                            {isExpanded && (isPending || isNotCompleted) && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center rounded-full"
                                >
                                    {/* --- 12. APLICAMOS TAMAÑO ICONO DE LÁPIZ --- */}
                                    <button onClick={handleStartEdit}><Pencil color='orange' size={styles.editIconSize}/></button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </motion.div>
    );
}