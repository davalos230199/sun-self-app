// frontend/src/pages/MiniMetasPage.jsx (o renómbralo a MetasPage.jsx)

import React, { useState } from 'react';
import { useDia } from '../contexts/DiaContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Check, Trash2, Plus, ArrowRight, Star } from 'lucide-react';

// Sub-componente para la Meta Principal del Día
const MetaPrincipal = ({ meta }) => {
    if (!meta) return null;
    return (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6 text-center shadow-lg animate-fade-in">
            <div className="flex justify-center items-center gap-2">
                <Star className="text-amber-500" size={20} />
                <h2 className="font-['Patrick_Hand'] text-lg text-amber-800">Tu Norte para Hoy</h2>
            </div>
            <p className="text-xl text-zinc-800 font-semibold break-words mt-1">{meta.descripcion}</p>
        </div>
    );
};

// Sub-componente para las Metas Secundarias
const MetaItem = ({ meta, onToggle, onDelete }) => (
    <div className={`flex items-center p-3 rounded-lg transition-all duration-300 shadow-sm animate-fade-in-delay ${meta.completada ? 'bg-green-100 text-zinc-500' : 'bg-white'}`}>
        <button onClick={() => onToggle(meta.id, !meta.completada)} className={`mr-4 flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${meta.completada ? 'bg-green-500 border-green-500' : 'border-zinc-300 hover:border-green-500'}`}>
            {meta.completada && <Check size={18} className="text-white" />}
        </button>
        <div className="flex-grow">
            <p className={`font-semibold ${meta.completada ? 'line-through' : 'text-zinc-800'}`}>{meta.descripcion}</p>
            {meta.hora_objetivo && <p className="text-xs text-zinc-400">{meta.hora_objetivo.substring(0, 5)} hs</p>}
        </div>
        <button onClick={() => onDelete(meta.id)} className="ml-4 flex-shrink-0 text-zinc-400 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
        </button>
    </div>
);

// Componente Principal de la Página
export default function MetasPage() {
    // Obtenemos todos los datos del contexto centralizado
    const { registroDeHoy, metas, isLoading, refrescarDia } = useDia();
    
    const [nuevaMeta, setNuevaMeta] = useState('');
    const [nuevaHora, setNuevaHora] = useState('');

    // Lógica para separar la meta principal de las secundarias
    const metaPrincipal = registroDeHoy?.meta_principal_id ? metas.find(m => m.id === registroDeHoy.meta_principal_id) : null;
    const metasSecundarias = metas.filter(m => m.id !== registroDeHoy?.meta_principal_id);

    // Funciones para interactuar con la API
    const handleAddMeta = async (e) => {
        e.preventDefault();
        if (!nuevaMeta.trim()) return;
        await api.createMeta({ descripcion: nuevaMeta, hora_objetivo: nuevaHora || null });
        setNuevaMeta('');
        setNuevaHora('');
        refrescarDia(); // Recargamos todo el estado del día
    };

    const handleToggleMeta = async (id, completada) => {
        await api.updateMeta(id, { completada });
        refrescarDia();
    };

    const handleDeleteMeta = async (id) => {
        await api.deleteMeta(id);
        refrescarDia();
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando tus metas..." />;
    }

    return (
        <div className="flex flex-col h-full p-4 animate-fade-in">
            <MetaPrincipal meta={metaPrincipal} />
            
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {metasSecundarias.length > 0 ? (
                    metasSecundarias.map(meta => (
                        <MetaItem key={meta.id} meta={meta} onToggle={handleToggleMeta} onDelete={handleDeleteMeta} />
                    ))
                ) : (
                    <p className="text-zinc-500 text-center mt-4">Añade pasos o tareas para alcanzar tu norte.</p>
                )}
            </div>

            <form onSubmit={handleAddMeta} className="flex-shrink-0 flex items-center gap-2 mt-4">
                <input type="text" value={nuevaMeta} onChange={(e) => setNuevaMeta(e.target.value)} placeholder="Nuevo paso..." className="flex-grow w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-amber-400"/>
                <input type="time" value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} className="p-3 border border-zinc-300 rounded-lg"/>
                <button type="submit" className="p-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"><Plus size={24} /></button>
            </form>
        </div>
    );
}