import { React, useState } from 'react';
import { useDia } from '../contexts/DiaContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
// ICONOS: Añadimos Pencil para editar y X para cancelar.
import { Check, Trash2, Plus, TrendingUp, Pencil, X } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-componente: Meta Principal (Sin cambios) ---
const MetaPrincipal = ({ meta }) => {
    if (!meta) return null;
    return (
        <div className="flex-shrink-0 bg-green-100 border-2 border-amber-200 rounded-2xl p-5 mb-6 text-center shadow-lg animate-fade-in">
            <div className="flex justify-center items-center gap-2">
                <h2 className="font-['Patrick_Hand'] text-lg text-amber-800">Tu Meta de Hoy</h2>
                <TrendingUp className="text-amber-800" size={24} />
            </div>
            <h3 className="text-2xl text-transform: uppercase text-green-900 break-words">{meta.descripcion}</h3>
        </div>
    );
};

// --- Sub-componente: MetaItem (Modificado para incluir edición) ---
const MetaItem = ({ meta, onToggle, onDelete, onEdit, onSave, onCancelEdit, isEditing, editingText, setEditingText }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className={`flex items-start p-4 rounded-xl transition-all duration-300 shadow-sm ${meta.completada ? 'bg-green-100/70' : 'bg-white/80'}`}
    >
        {!isEditing ? (
            // --- MODO VISTA ---
            <>
                <button 
                    onClick={() => onToggle(meta.id, !meta.completada)} 
                    className={`mr-4 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${meta.completada ? 'bg-green-500 border-green-500' : 'border-zinc-300 hover:border-green-500'}`}
                >
                    {meta.completada && <Check size={20} className="text-white" />}
                </button>
                <div className="flex-grow">
                    <p className={`font-semibold text-lg ${meta.completada ? 'line-through text-zinc-500' : 'text-zinc-800'}`}>{meta.descripcion}</p>
                    {meta.hora_objetivo && <p className="text-sm text-zinc-400">{meta.hora_objetivo.substring(0, 5)} hs</p>}
                </div>
                <button 
                    onClick={() => onEdit(meta)}
                    className="ml-4 flex-shrink-0 bg-transparent border-none text-zinc-400 hover:text-amber-500 transition-colors transform hover:scale-125"
                >
                    <Pencil size={18} />
                </button>
                <button 
                    onClick={() => onDelete(meta.id)} 
                    className="ml-2 flex-shrink-0 bg-transparent border-none text-zinc-400 hover:text-red-500 transition-colors transform hover:scale-125"
                >
                    <Trash2 size={18} />
                </button>
            </>
        ) : (
            // --- MODO EDICIÓN ---
            <>
                <input 
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-grow font-semibold text-lg bg-transparent border-b-2 border-amber-400 focus:outline-none text-zinc-800"
                    autoFocus
                />
                <button 
                    onClick={() => onSave(meta.id)}
                    className="ml-4 flex-shrink-0 text-green-500 hover:text-green-700 transition-colors transform hover:scale-125"
                >
                    <Check size={18} />
                </button>
                 <button 
                    onClick={onCancelEdit}
                    className="ml-2 flex-shrink-0 text-zinc-400 hover:text-red-500 transition-colors transform hover:scale-125"
                >
                    <X size={18} />
                </button>
            </>
        )}
    </motion.div>
);


// --- Componente Principal de la Página ---
export default function MetasPage() {
    const { registroDeHoy, metas, isLoading, refrescarDia } = useDia();
    const [nuevaMeta, setNuevaMeta] = useState('');
    const [nuevaHora, setNuevaHora] = useState('');
    
    // --- ESTADO PARA LA EDICIÓN ---
    const [editingMetaId, setEditingMetaId] = useState(null); // Guarda el ID de la meta que se está editando.
    const [editingText, setEditingText] = useState('');     // Guarda el texto nuevo mientras se edita.

    const metaPrincipal = registroDeHoy?.meta_principal_id ? metas.find(m => m.id === registroDeHoy.meta_principal_id) : null;
    const metasSecundarias = metas.filter(m => m.id !== registroDeHoy?.meta_principal_id);

    const handleAddMeta = async (e) => {
        e.preventDefault();
        if (!nuevaMeta.trim()) return;
        await api.createMeta({ descripcion: nuevaMeta, hora_objetivo: nuevaHora || null });
        setNuevaMeta('');
        setNuevaHora('');
        refrescarDia();
    };

    const handleToggleMeta = async (id, completada) => {
        await api.updateMeta(id, { completada });
        refrescarDia();
    };

    const handleDeleteMeta = async (id) => {
        await api.deleteMeta(id);
        refrescarDia();
    };

    // --- MANEJADORES PARA LA EDICIÓN ---
    const handleStartEdit = (meta) => {
        setEditingMetaId(meta.id);
        setEditingText(meta.descripcion);
    };

    const handleCancelEdit = () => {
        setEditingMetaId(null);
        setEditingText('');
    };

    const handleSaveEdit = async (id) => {
        if (!editingText.trim()) return; // Evitar guardar metas vacías
        await api.updateMeta(id, { descripcion: editingText });
        setEditingMetaId(null);
        setEditingText('');
        refrescarDia();
    };


    if (isLoading) {
        return <LoadingSpinner message="Cargando tus metas..." />;
    }

    // --- ESTRUCTURA DE LAYOUT FLEXBOX ---
    // El contenedor principal ahora usa `flex flex-col` y `h-full` para ocupar toda la altura.
    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* 1. Contenido Superior (Fijo) */}
            <div className="flex-shrink-0">
                <MetaPrincipal meta={metaPrincipal} />
            </div>
            
            {/* 2. Lista Central (Crece y con Scroll) */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2 pb-4">
                <AnimatePresence>
                    {metasSecundarias.length > 0 ? (
                        metasSecundarias.map(meta => (
                            <MetaItem 
                                key={meta.id} 
                                meta={meta} 
                                onToggle={handleToggleMeta} 
                                onDelete={handleDeleteMeta}
                                onEdit={handleStartEdit}
                                onSave={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                isEditing={editingMetaId === meta.id}
                                editingText={editingText}
                                setEditingText={setEditingText}
                            />
                        ))
                    ) : (
                        <p className="text-zinc-500 text-center mt-8">Añade pequeños pasos para alcanzar tu norte.</p>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. Formulario Inferior (Fijo) */}
            <form onSubmit={handleAddMeta} className="flex-shrink-0 flex items-start gap-2 mt-auto pt-4 border-t border-zinc-200">
                <input 
                    type="text" 
                    value={nuevaMeta} 
                    onChange={(e) => setNuevaMeta(e.target.value)} 
                    placeholder="Nuevo paso..." 
                    className="flex-grow w-full p-3 bg-white/70 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                />
                <input 
                    type="time" 
                    value={nuevaHora} 
                    onChange={(e) => setNuevaHora(e.target.value)} 
                    className="p-3 bg-white/70 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-shadow"
                />
                <button 
                    type="submit" 
                    className="p-3 bg-amber-500 bg-transparent border-none text-white rounded-xl hover:bg-amber-600 transition-colors disabled:bg-zinc-400"
                    disabled={!nuevaMeta.trim()}
                >
                    <Plus size={18} />
                </button>
            </form>
        </div>
    );
}