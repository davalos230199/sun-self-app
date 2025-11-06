import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDia } from '../contexts/DiaContext';
import { TrendingUp, ChevronUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Los Nuevos Ladrillos ---
import FormularioNuevaMeta from './metas/FormularioNuevaMeta';
import MetaItem from './metas/MetaItem';

// --- Componente Principal: El Checklist (Reconstruido) ---
export default function ChecklistDeMetas() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedMetaId, setExpandedMetaId] = useState(null); // Para el 'MetaItem'
    const { registroDeHoy, metas } = useDia();

    // 1. Encontrar la Meta Principal
    const metaPrincipal = useMemo(() => {
        return registroDeHoy?.meta_principal_id 
            ? metas.find(m => m.id === registroDeHoy.meta_principal_id) 
            : null;
    }, [metas, registroDeHoy?.meta_principal_id]);
         
    // 2. Lógica de Ordenamiento "Inteligente"
    const metasSecundariasOrdenadas = useMemo(() => {
        
        // Función para asignar un "grupo" de orden
        const getGrupo = (completada) => {
            if (completada === null) return 1; // Pendiente
            if (completada === false) return 2; // Incompleta
            if (completada === true) return 3; // Completa
            return 4;
        };

        return metas
            .filter(m => m.id !== registroDeHoy?.meta_principal_id)
            .sort((a, b) => {
                const grupoA = getGrupo(a.completada);
                const grupoB = getGrupo(b.completada);

                // 1. Ordenar por Grupo (Pendiente > Incompleta > Completa)
                if (grupoA !== grupoB) {
                    return grupoA - grupoB;
                }

                // 2. Si están en el mismo grupo (ej. ambas Pendientes), ordenar por hora
                if (grupoA === 1) { // Solo ordenar por hora a las pendientes
                    if (a.hora_objetivo && b.hora_objetivo) {
                        return a.hora_objetivo.localeCompare(b.hora_objetivo);
                    }
                    if (a.hora_objetivo && !b.hora_objetivo) return -1; // Con hora van antes
                    if (!a.hora_objetivo && b.hora_objetivo) return 1; // Sin hora van después
                }
                
                // 3. Si no hay más criterios, mantener orden de creación (o IDs, aunque no es estable)
                return 0; 
            });
    }, [metas, registroDeHoy?.meta_principal_id]);

    const handleMetaExpand = (metaId) => {
        setExpandedMetaId(currentId => (currentId === metaId ? null : metaId));
    };

    // --- Si no hay Meta Principal (el "placeholder" no cambia) ---
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

    // --- El NUEVO Renderizado ---
    return (
        <motion.div 
            layout 
            className="bg-green-100 border border-green-400 rounded-2xl shadow-lg overflow-hidden"
        >
            {/* --- SECCIÓN PRINCIPAL (El Título) --- */}
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

            {/* --- CONTENIDO DESPLEGABLE (La Nueva Estructura) --- */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 border-t border-dashed border-green-300"
                    >
                        {/* 1. EL FORMULARIO */}
                        <div className="mt-4">
                            <FormularioNuevaMeta />
                        </div>

                        {/* 2. LA LISTA DE METAS */}
                        <div className="space-y-3 mt-4">
                            {metasSecundariasOrdenadas.length > 0 ? (
                                metasSecundariasOrdenadas.map(meta => (
                                    <MetaItem 
                                        key={meta.id} 
                                        meta={meta}
                                        isExpanded={expandedMetaId === meta.id}
                                        onExpand={handleMetaExpand}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-green-800 italic p-2 text-center">
                                    ¡Añade metas para guiar tu día!
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}