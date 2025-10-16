// frontend/src/components/NotaExpandida.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// Este es el componente que ya conoces, ahora en su propia casa.
const NotaExpandida = ({ entrada, onDeselect }) => {
    const prioridadColores = {
        alta: 'bg-red-200/70 border-red-400',
        media: 'bg-yellow-200/70 border-yellow-400',
        baja: 'bg-green-100/70 border-green-300',
    };
    
    const colorClase = prioridadColores[entrada.prioridad] || prioridadColores.baja;

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onDeselect}
        >
            <motion.div
                layoutId={`nota-${entrada.id}`} // La animación mágica viene de aquí
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-lg rounded-xl p-6 shadow-2xl ${colorClase}`}
            >
                <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold text-zinc-500 italic">
                        {new Date(entrada.created_at).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </p>
                    <button onClick={onDeselect} className="p-1 rounded-full bg-transparent border-none hover:bg-zinc-200/50">
                        <X size={20} className="text-zinc-600"/>
                    </button>
                </div>
                <p className="text-zinc-800 whitespace-pre-wrap max-h-[60vh] overflow-y-auto italic font-['Patrick_Hand'] text-lg">
                    {entrada.texto}
                </p>
            </motion.div>
        </motion.div>
    );
};

// La línea más importante: hacemos que el componente esté disponible para el resto de la app.
export default NotaExpandida;