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
const MetaItem = ({ meta, onToggle, onDelete, onEdit, isExpanded, onExpand, isEditing, editingText, setEditingText, onSave, onCancel }) => {

    const handleActionClick = (e) => {
        e.stopPropagation(); // Evita que el evento 'onExpand' del div padre se dispare
    };

    return (
        <motion.div
            layout="position" // Mantenemos layout para animar reordenamientos
            onClick={onExpand} // 1. El evento principal ahora es onClick
            className="relative flex items-center p-4 rounded-xl shadow-md transition-all duration-300 cursor-pointer"
            style={{
                backgroundColor: meta.completada ? '#fef3c7' : '#fef3c7',
                opacity: meta.completada ? 0.7 : 1,
            }}
        >        
        {/* Si está en modo edición, muestra el formulario */}
        {isEditing ? (
                <div className="w-full flex items-center justify-between">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-amber-500`}></div>
                    <button
                    onClick={(e) => {
                    handleActionClick(e);
                    onToggle(meta.id, !meta.completada);
                    }}
                    className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${meta.completada ? 'bg-green-500 border-green-600' : 'border-zinc-300 hover:border-amber-500'}`}
                    ></button>
                    <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="font-['Patrick_Hand'] font-semibold ml-4 mt-2 text-s bg-transparent border-none focus:outline-none focus:shadow-none focus:ring-0"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && onSave(meta.id)}
                    />
                    <button onClick={() => onSave(meta.id)} className="p-2 text-green-500 border-none hover:text-green-700"><Check size={18} /></button>
                    <button onClick={onCancel} className="p-2 text-red-400 border-none hover:text-red-500"><X size={18} /></button>
                </div>
            ) : (
        <>
            {/* Barra de estado vertical */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${meta.completada ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            
            <button
                onClick={(e) => {
                    handleActionClick(e);
                    onToggle(meta.id, !meta.completada);
                }}
                className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${meta.completada ? 'bg-green-500 border-green-600' : 'border-zinc-300 hover:border-amber-500'}`}
            >
                {meta.completada && <Check size={18} className="text-white" />}
            </button>

            <div className="flex-grow ml-4">
                <p className={`font-['Patrick_Hand'] font-semibold text-s ${meta.completada ? 'line-through italic text-zinc-500' : 'text-zinc-800'}`}>{meta.descripcion}</p>
                {meta.hora_objetivo && (
                    <div className="flex items-center italic gap-1 text-sm text-zinc-400">
                        <Clock color='orange' size={12} />
                        <span>{meta.hora_objetivo.substring(0, 5)}hs</span>
                    </div>
                )}
            </div>

            {/* 2. Los botones de acción ahora dependen de 'isExpanded' (controlado por el toque) */}
            <AnimatePresence>
                {isExpanded && !meta.completada && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center bg-[#fef3c7] rounded-full" // Añadimos un fondo para que no se superponga texto
                    >
                        <button onClick={(e) => { handleActionClick(e); onEdit(meta); }} className="ml-4 p-2 text-zinc-400 border-none hover:text-amber-600 transition-colors"><Pencil size={18} /></button>
                        <button onClick={(e) => { handleActionClick(e); onDelete(meta.id); }} className="ml-2 p-2 text-zinc-400 border-none hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
        )}
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
    const [editingText, setEditingText] = useState(''); 

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

    const handleToggleMeta = async (id, completada) => {
        const originalMetas = [...metas];
        setMetas(prev => prev.map(m => m.id === id ? { ...m, completada } : m));
        try {
            await api.updateMeta(id, { completada });
        } catch (error) {
            setMetas(originalMetas); // Revertir
        }
    };

    const handleDeleteMeta = async (id) => {
        const originalMetas = [...metas];
        setMetas(prev => prev.filter(m => m.id !== id));
        try {
            await api.deleteMeta(id);
        } catch (error) {
            setMetas(originalMetas); // Revertir
        }
    };

        const handleStartEdit = (meta) => {
        setEditingMetaId(meta.id);
        setEditingText(meta.descripcion);
        setExpandedMetaId(null); // Opcional: cierra los otros botones para una UI más limpia
    };

    const handleCancelEdit = () => {
        setEditingMetaId(null);
        setEditingText('');
    };

    const handleSaveEdit = async (id) => {
        if (!editingText.trim()) return; // No guardar si está vacío

        const metaOriginal = metas.find(m => m.id === id);
        const metasOriginales = [...metas];

        // Actualización optimista
        setMetas(prev => prev.map(m => m.id === id ? { ...m, descripcion: editingText } : m));
        handleCancelEdit(); // Sale del modo edición inmediatamente
    
        try {
            await api.updateMeta(id, { descripcion: editingText });
        } catch (error) {
            console.error("Error al guardar la meta:", error);
            setMetas(metasOriginales); // Revertir en caso de error
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
                            onToggle={handleToggleMeta} 
                            onDelete={handleDeleteMeta}
                            onEdit={handleStartEdit} 
                            isExpanded={expandedMetaId === meta.id && editingMetaId !== meta.id}
                            onExpand={() => handleMetaExpand(meta.id)}
                            isEditing={editingMetaId === meta.id}
                            editingText={editingText}
                            setEditingText={setEditingText}
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