import React, { useState, useMemo } from 'react'; // useMemo añadido
import { AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

import { useDia } from '../contexts/DiaContext';
import LoadingSpinner from '../components/LoadingSpinner';

// --- Ladrillos Importados ---
import FormularioNuevaMeta from '../components/metas/FormularioNuevaMeta';
import MetaItem from '../components/metas/MetaItem';


// --- Sub-componente: MetaPrincipal (Sigue igual) ---
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
                Añade pequeños logros para avanzar en tu día!
            </p>
        </div>
    );
};


// --- Componente Principal de la Página (Simplificado) ---
export default function MetasPage() {
    const { registroDeHoy, metas, isLoading } = useDia();
    const [expandedMetaId, setExpandedMetaId] = useState(null);
    
    const handleMetaExpand = (metaId) => {
        setExpandedMetaId(currentId => (currentId === metaId ? null : metaId));
    };

    // --- Lógica de Ordenamiento (La misma que en Checklist) ---
    const { metaPrincipal, metasSecundariasOrdenadas } = useMemo(() => {
        const principal = registroDeHoy?.meta_principal_id 
            ? metas.find(m => m.id === registroDeHoy.meta_principal_id) 
            : null;

        const getGrupo = (completada) => {
            if (completada === null) return 1;
            if (completada === false) return 2;
            if (completada === true) return 3;
            return 4;
        };

        const secundarias = metas
            .filter(m => m.id !== registroDeHoy?.meta_principal_id)
            .sort((a, b) => {
                const grupoA = getGrupo(a.completada);
                const grupoB = getGrupo(b.completada);
                if (grupoA !== grupoB) return grupoA - grupoB;
                if (grupoA === 1) {
                    if (a.hora_objetivo && b.hora_objetivo) return a.hora_objetivo.localeCompare(b.hora_objetivo);
                    if (a.hora_objetivo && !b.hora_objetivo) return -1;
                    if (!a.hora_objetivo && b.hora_objetivo) return 1;
                }
                return 0;
            });
        
        return { metaPrincipal: principal, metasSecundariasOrdenadas: secundarias };

    }, [metas, registroDeHoy?.meta_principal_id]);
    // --- Fin de la Lógica de Ordenamiento ---

    if (isLoading) return <LoadingSpinner message="Cargando tus metas..." />;

    return (
        <div className="h-full grid grid-rows-[auto_1fr_auto] gap-4 animate-fade-in">
            <div className="flex-shrink-0">
                <MetaPrincipal meta={metaPrincipal} />
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2 pb-4">
                <AnimatePresence>
                    {metasSecundariasOrdenadas.map(meta => (
                        <MetaItem 
                            key={meta.id} 
                            meta={meta}
                            isExpanded={expandedMetaId === meta.id}
                            onExpand={handleMetaExpand}
                        />
                    ))}
                </AnimatePresence>
                {metasSecundariasOrdenadas.length === 0 && (
                    <p className="text-zinc-500 text-center mt-8">Añade pequeños pasos para avanzar en tu dia.</p>
                )}
            </div>

            <div className="flex-shrink-0 mt-auto pt-4 border-t border-zinc-200">
                <FormularioNuevaMeta />
            </div>
        </div>
    );
}