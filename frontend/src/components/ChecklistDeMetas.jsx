// frontend/src/components/ChecklistDeMetas.jsx (Lógica de Auto-Expansión)

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDia } from '../contexts/DiaContext';
import { TrendingUp, ChevronUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- Los Ladrillos ---
import FormularioNuevaMeta from './metas/FormularioNuevaMeta';
import MetaItem from './metas/MetaItem';

// --- Componente Principal: El Checklist (Reconstruido) ---
export default function ChecklistDeMetas() {
    
    // --- 1. LÓGICA DE ESTADO MEJORADA ---
    // Estado para saber si VOS (el usuario) tomaste control manual del acordeón
    const [userHasInteracted, setUserHasInteracted] = useState(false);
    // Estado para guardar tu decisión manual
    const [isManuallyExpanded, setIsManuallyExpanded] = useState(false); 
    
    const [expandedMetaId, setExpandedMetaId] = useState(null);
    const { registroDeHoy, metas } = useDia();

    // 2. Encontrar la Meta Principal (Sin cambios)
    const metaPrincipal = useMemo(() => {
        return registroDeHoy?.meta_principal_id 
            ? metas.find(m => m.id === registroDeHoy.meta_principal_id) 
            : null;
    }, [metas, registroDeHoy?.meta_principal_id]);
         
    // 3. Lógica de Ordenamiento (Sin cambios)
    const metasSecundariasOrdenadas = useMemo(() => {
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

                if (grupoA !== grupoB) {
                    return grupoA - grupoB;
                }

                if (grupoA === 1) { 
                    if (a.hora_objetivo && b.hora_objetivo) {
                        return a.hora_objetivo.localeCompare(b.hora_objetivo);
                    }
                    if (a.hora_objetivo && !b.hora_objetivo) return -1;
                    if (!a.hora_objetivo && b.hora_objetivo) return 1;
                }
                
                return 0; 
            });
    }, [metas, registroDeHoy?.meta_principal_id]);

    // 4. Encontrar la "Próxima Meta" (Sin cambios)
    const proximaMeta = useMemo(() => {
        return metasSecundariasOrdenadas.find(m => m.completada === null);
    }, [metasSecundariasOrdenadas]);

    // --- 5. LÓGICA DE ESTADO DERIVADO (El "Martillazo") ---
    
    // El acordeón DEBERÍA estar expandido por defecto si no hay metas secundarias
    const defaultExpanded = metasSecundariasOrdenadas.length === 0;
    
    // El estado final es: tu decisión manual, o si no, el estado por defecto.
    const isExpanded = userHasInteracted ? isManuallyExpanded : defaultExpanded;

    // El nuevo handler que "toma control"
    const handleToggleExpand = () => {
        setUserHasInteracted(true); // Tomaste control
        setIsManuallyExpanded(!isExpanded); // Guardamos tu decisión
    };
    
    // (El handler de expandir MetaItem individual no cambia)
    const handleMetaExpand = (metaId) => {
        setExpandedMetaId(currentId => (currentId === metaId ? null : metaId));
    };

    // --- Si no hay Meta Principal (sin cambios) ---
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

    // --- El Renderizado ---
    return (
        <motion.div 
            layout 
            className="bg-green-100 border border-green-400 rounded-2xl shadow-lg overflow-hidden"
        >
            {/* --- SECCIÓN PRINCIPAL (Usa el nuevo handler) --- */}
            <motion.div 
                layout
                className="flex items-center p-4 cursor-pointer"
                onClick={handleToggleExpand} // <-- 6. USAMOS EL NUEVO HANDLER
            >
                <div className="flex-shrink-0 text-green-800">
                    <TrendingUp size={28} />
                </div>
                <div className="flex-grow mx-4 text-center">
                    <h2 className="font-['Patrick_Hand'] uppercase text-2xl font-semibold text-green-800 break-words">
                        {metaPrincipal.descripcion}
                    </h2>
                </div>
                <div className="flex-shrink-0 text-green-800">
                    {/* El icono reacciona a la variable 'isExpanded' final */}
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronRight size={24} />} 
                </div>
            </motion.div>

            {/* --- CONTENIDO COLAPSADO (Muestra la Próxima Meta) --- */}
            <AnimatePresence>
                {!isExpanded && proximaMeta && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="px-4 pb-4" 
                    >
                        <MetaItem 
                            key={proximaMeta.id} 
                            meta={proximaMeta}
                            isExpanded={expandedMetaId === proximaMeta.id}
                            onExpand={handleMetaExpand}
                            variant="compact"
                        />
                    </motion.div>
                )}
                 {/* Placeholder si no hay próxima meta Y está colapsado */}
                {!isExpanded && !proximaMeta && metasSecundariasOrdenadas.length > 0 && (
                    <motion.div 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-4 pb-4 text-center"
                    >
                        <p className="text-sm text-green-700 italic pt-2">¡Todas las metas pendientes completadas!</p>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* --- CONTENIDO DESPLEGABLE (Muestra Formulario + Lista Completa) --- */}
            <AnimatePresence>
                {/* Esta lógica funciona perfecto, porque 'isExpanded' ya tiene el valor correcto */}
                {isExpanded && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="px-4 pb-4 border-t border-dashed border-green-300"
                    >
                        {/* 1. EL FORMULARIO */}
                        <div className="mt-4">
                            <FormularioNuevaMeta />
                        </div>

                        {/* 2. LA LISTA COMPLETA DE METAS */}
                        <div className="space-y-3 mt-4">
                            {metasSecundariasOrdenadas.length > 0 ? (
                                metasSecundariasOrdenadas.map(meta => (
                                    <MetaItem 
                                        key={meta.id} 
                                        meta={meta}
                                        isExpanded={expandedMetaId === meta.id}
                                        onExpand={handleMetaExpand}
                                        variant="full"
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