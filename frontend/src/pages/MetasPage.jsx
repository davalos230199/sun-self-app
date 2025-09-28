// frontend/src/pages/MetasPage.jsx (Refactorizado)
//Mantene
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Plus, TrendingUp, Pencil, X, Clock } from 'lucide-react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import '../styles/timepicker-override.css';

import api from '../services/api';
import { useDia } from '../contexts/DiaContext';
import LoadingSpinner from '../components/LoadingSpinner';



// --- Sub-componente: MetaPrincipal (Sin cambios, ya estaba bien) ---
const MetaPrincipal = ({ meta }) => {
    if (!meta) return null;
    return (
            <div className="bg-green-100 border border-green-400 rounded-2xl p-3 text-center shadow-lg space-y-1">
                <h3 className="text-2xl uppercase text-green-900 break-words mt-2 -mb-1">{meta.descripcion}</h3>
                <div className="flex justify-center items-center gap-2">
                    <h2 className="font-['Patrick_Hand'] text-lg text-amber-800 -mb-1">Tu Meta de Hoy</h2>
                    <TrendingUp className="text-amber-800" size={24} />
                </div>
                <p className="text-xs font-semibold text-amber-800 italic bg-white/50 rounded-full -mt-2 inline-block">
                    Añade pequeñas metas para tu dia!
                </p>
            </div>
    );
};

// --- Sub-componente: MetaItem (NUEVO DISEÑO) ---
const MetaItem = ({ meta, onToggle, onEdit, isExpanded, onExpand, isEditing, editingHora, setEditingHora, onSave, onCancel }) => {

    const handleActionClick = (e) => { e.stopPropagation(); };
    // Lógica de colores simplificada
    const barraColor = meta.completada === true ? 'bg-green-500' 
                     : meta.completada === false ? 'bg-red-500' 
                     : (isEditing ? 'bg-orange-500' : 'bg-amber-500');

    return (
        <motion.div
            layout="position"
            onClick={() => !isEditing && onExpand()} // Solo expande si NO está en modo edición
            className={`relative flex items-center p-4 rounded-xl shadow-md transition-all duration-300 cursor-pointer ${
            isEditing ? 'bg-amber-100' : 'bg-[#fef3c7]'
            }`}
            style={{ opacity: meta.completada ? 0.7 : 1 }}
        >
            {/* El Checkbox ahora es un botón que se deshabilita */}
            <button
                onClick={(e) => { 
                    handleActionClick(e); 
                    if (!meta.completada) onToggle(meta.id, true);
                }}
                // Se deshabilita si ya está completada o si no está completada (marcada en rojo)
                disabled={meta.completada !== null}
                className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${meta.completada ? 'bg-green-500 border-green-600' : 'bg-white border-zinc-300'} 
                ${meta.completada === null ? 'hover:border-amber-500 cursor-pointer' : 'cursor-default'}`}
            >
                {meta.completada === true && <Check size={18} className="text-white" />}
                {meta.completada === false && <X size={18} className="text-red-500" />}
            </button>

            <div className="flex-grow ml-4 flex justify-between items-center">
                {/* --- LÓGICA DE VISTA / EDICIÓN --- */}
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
                            <button onClick={(e) => { handleActionClick(e); onSave(meta.id); }} className="p-2 text-green-500 hover:text-green-700"><Check size={18} /></button>
                            <button onClick={(e) => { handleActionClick(e); onCancel(); }} className="p-2 text-red-400 hover:text-red-500"><X size={18} /></button>
                        </div>
                    </>
                ) : (
                    // MODO VISTA:
                    <>
                        <div>
                            <p className={`font-['Patrick_Hand'] text-lg ${meta.completada ? 'line-through italic text-amber-800' : 'text-amber-800'}`}>{meta.descripcion}</p>
                            {meta.hora_objetivo && (
                                <div className="flex items-center italic gap-1 text-xs text-zinc-400">
                                    <Clock color='orange' size={12} />
                                    <span>{meta.hora_objetivo.substring(0, 5)}hs</span>
                                </div>
                            )}
                        </div>
                        <AnimatePresence>
                            {isExpanded && !meta.completada && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center bg-[#fef3c7] rounded-full"
                                >
                                    <button onClick={(e) => { handleActionClick(e); onEdit(meta); }}><Pencil color='orange' size={18}/></button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </motion.div>
    );
};

// --- Sub-componente: Formulario para agregar metas (NUEVO DISEÑO) ---
const FormularioNuevaMeta = ({ onAdd }) => {
    const [descripcion, setDescripcion] = useState('');
    const [hora, setHora] = useState('');
    const prefillTime = () => {
        if (!hora) { 
            const ahora = new Date();
            ahora.setMinutes(ahora.getMinutes() + 15);
            const horaSugerida = ahora.toTimeString().substring(0, 5);
            setHora(horaSugerida);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!descripcion.trim()) return;
        onAdd(descripcion, hora || null);
        setDescripcion('');
        setHora('');
    };

    return (
        <motion.form 
            layout
            onSubmit={handleSubmit} 
            className="p-2 bg-green-100 border-2 border-green-400 rounded-xl flex items-center gap-4"
        >
            <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                onFocus={prefillTime}
                placeholder="En 15 arranco.."
                className="flex-grow italic w-full font-['Patrick_Hand'] text-lg p-2 bg-transparent border-none focus:ring-0 outline-none"
                autoFocus
            />
            <div className="flex-shrink-0">
                <TimePicker
                    onChange={setHora}
                    value={hora}
                    // 3. Estilo más compacto y sin bordes para el selector de hora
                    className="w-24 bg-amber-50 font-['Patrick_Hand'] rounded-lg text-lg"
                    disableClock={true}
                    clearIcon={null}
                    format="HH:mm"
                />
            </div>
            {/* 4. Botón de envío más prominente */}
            <button 
                type="submit" 
                className="flex-shrink-0 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                disabled={!descripcion.trim()}
            >
                <Plus size={24} />
            </button>
        </motion.form>
    );
};


// --- Componente Principal de la Página (CON LÓGICA OPTIMISTA) ---
export default function MetasPage() {
    // Asumimos que el context provee 'metas' y 'setMetas'
    const { registroDeHoy, metas, setMetas, isLoading } = useDia();
    const [expandedMetaId, setExpandedMetaId] = useState(null);
    const [editingMetaId, setEditingMetaId] = useState(null); 
    const [editingHora, setEditingHora] = useState('');

    const handleMetaExpand = (metaId) => {
    setExpandedMetaId(currentId => (currentId === metaId ? null : metaId));
    };

    const metaPrincipal = registroDeHoy?.meta_principal_id ? metas.find(m => m.id === registroDeHoy.meta_principal_id) : null;
    const metasSecundarias = metas.filter(m => m.id !== registroDeHoy?.meta_principal_id);

  
    const handleAddMeta = async (descripcion, hora) => {
        const nuevaMetaTemp = { id: `temp-${Date.now()}`, descripcion, hora_objetivo: hora, completada: false };
        setMetas(prev => [...prev, nuevaMetaTemp]);
        try {
            const { data: metaGuardada } = await api.createMeta({ descripcion, hora_objetivo: hora });
            setMetas(prev => prev.map(m => m.id === nuevaMetaTemp.id ? metaGuardada : m));
        } catch (error) {
            setMetas(prev => prev.filter(m => m.id !== nuevaMetaTemp.id));
        }
    };

    const handleSetEstadoMeta = async (id, nuevoEstado) => {
        const metasOriginales = [...metas];
        setMetas(prev => prev.map(m => m.id === id ? { ...m, completada: nuevoEstado } : m));
        try {
            await api.updateMeta(id, { completada: nuevoEstado });
        } catch (error) {
            setMetas(metasOriginales); // Revertir en caso de error
        }
    };

        const handleToggleMeta = async (id, completada) => {
        // Solo actuamos si se está marcando como completada
        if (!completada) return; 

        const originalMetas = [...metas];
        setMetas(prev => prev.map(m => m.id === id ? { ...m, completada: true } : m));
        try {
            await api.updateMeta(id, { completada: true });
        } catch (error) {
            setMetas(originalMetas);
        }
    };

    const handleStartEdit = (meta) => {
        setEditingMetaId(meta.id);
        // Al empezar a editar, ponemos la hora actual de la meta en el estado
        setEditingHora(meta.hora_objetivo ? meta.hora_objetivo.substring(0, 5) : '');
        setExpandedMetaId(null); 
    };

    const handleCancelEdit = () => {
        setEditingMetaId(null);
        setEditingHora(''); // Limpiamos la hora al cancelar
    };

    const handleSaveEdit = async (id) => {
        // La actualización ahora enviará la nueva hora al backend
        const metasOriginales = [...metas];
        setMetas(prev => prev.map(m => m.id === id ? { ...m, hora_objetivo: editingHora } : m));
        handleCancelEdit();

        try {
            await api.updateMeta(id, { hora_objetivo: editingHora || null });
        } catch (error) {
            console.error("Error al guardar la meta:", error);
            setMetas(metasOriginales);
        }
    };

    const metasOrdenadas = [...metasSecundarias].sort((a, b) => {
        // Si 'a' no tiene hora y 'b' sí, 'b' va primero.
        if (!a.hora_objetivo && b.hora_objetivo) return 1;
        // Si 'a' tiene hora y 'b' no, 'a' va primero.
        if (a.hora_objetivo && !b.hora_objetivo) return -1;
        // Si ambas tienen hora, las comparamos como texto.
        if (a.hora_objetivo && b.hora_objetivo) {
            return a.hora_objetivo.localeCompare(b.hora_objetivo);
        }
        // Si ninguna tiene hora, mantenemos su orden original.
        return 0;
    });

    if (isLoading) return <LoadingSpinner message="Cargando tus metas..." />;

    return (
        <div className="h-full grid grid-rows-[auto_1fr_auto] gap-4 animate-fade-in">
            <div className="flex-shrink-0">
                <MetaPrincipal meta={metaPrincipal} />
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2 pb-4">
                <AnimatePresence>
                    {metasOrdenadas.map(meta => (
                        <MetaItem 
                            key={meta.id} 
                            meta={meta} 
                            onSetEstado={handleSetEstadoMeta} 
                            onToggle={handleToggleMeta}
                            onEdit={handleStartEdit} 
                            isExpanded={expandedMetaId === meta.id && editingMetaId !== meta.id}
                            onExpand={() => handleMetaExpand(meta.id)}
                            isEditing={editingMetaId === meta.id}
                            editingHora={editingHora}
                            setEditingHora={setEditingHora}
                            onSave={handleSaveEdit}
                            onCancel={handleCancelEdit}
                        />
                    ))}
                </AnimatePresence>
                {metasSecundarias.length === 0 && (
                    <p className="text-zinc-500 text-center mt-8">Añade pequeños pasos para avanzar en tu dia.</p>
                )}
            </div>

            <div className="flex-shrink-0 mt-auto pt-4 border-t border-zinc-200">
                <FormularioNuevaMeta onAdd={handleAddMeta} />
            </div>
        </div>
    );
}