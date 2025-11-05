import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Recibe un 'icon' (un componente de Lucide), un 'title', y el 'children' (el texto)
// También recibe la lógica del acordeón desde el padre
export default function InfoSlide({ icon: Icon, title, children, isExpanded, onToggle }) {
    
    return (
        <motion.div 
            layout 
            className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden"
        >
            {/* --- SECCIÓN PRINCIPAL (SIEMPRE VISIBLE) --- */}
            <motion.div 
                layout
                className="flex items-center p-4 cursor-pointer"
                onClick={onToggle}
            >
                {/* 1. LADO IZQUIERDO: Icono */}
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Icon size={24} />
                </div>

                {/* 2. CENTRO: Título */}
                <div className="flex-grow mx-4">
                    <h3 className="text-base font-['Patrick_Hand'] text-zinc-800 font-semibold">
                        {title}
                    </h3>
                </div>

                {/* 3. DERECHA: El Botón de expandir */}
                <div className="flex-shrink-0 text-zinc-400">
                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
            </motion.div>

            {/* --- SECCIÓN EXPANDIBLE (El "Por Qué") --- */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 border-t border-dashed border-zinc-300"
                    >
                        <div className="text-sm text-zinc-600 pt-3 pl-2">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}