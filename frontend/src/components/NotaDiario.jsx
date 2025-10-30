import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin } from 'lucide-react';

// --- ESTE ES EL COMPONENTE EXTIRPADO ---
// Lo exportamos como 'default' para usarlo en cualquier lado
export default function NotaDiario({ entrada, onSelect, onDelete }) {
    // Estado para la rotación (lo mantenemos)
    const [rotacion] = useState(() => Math.random() * (4 - -4) + -4);
    
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(entrada.id);
    }

    const prioridadColores = {
        alta: 'bg-red-200/70 border-red-400',
        media: 'bg-yellow-200/70 border-yellow-400',
        baja: 'bg-green-100/70 border-green-300',
    };
    
    const colorClase = prioridadColores[entrada.prioridad] || prioridadColores.baja;
    const fecha = new Date(entrada.created_at);
    const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const fechaFormateada = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8, y: 20 }} // Animación de entrada más sutil
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }} // Física más suave
            layoutId={`nota-${entrada.id}`}
            onClick={() => onSelect(entrada)}
            // --- [LA CLAVE] ---
            // 'h-40' (160px) de alto. 
            // NO definimos 'w-'. El 'grid' o 'flex' del padre (Carrusel o Tablero) definirá el ancho.
            className={`h-40 rounded-md p-3 shadow-md cursor-pointer hover:shadow-xl hover:scale-105 transition-all flex flex-col ${colorClase}`}
            style={{ rotate: `${rotacion}deg` }}
        >
            <div className="flex justify-between items-start">
                <p className="text-[9px] font-semibold text-zinc-500 italic">
                    {fechaFormateada} - {horaFormateada}hs
                </p>
                {/* El botón de borrar solo lo pasamos si existe la función 'onDelete' */}
                {onDelete && (
                    <button 
                        onClick={handleDeleteClick} 
                        className="p-1 -mr-1 -mt-1 italic text-zinc-400 hover:text-red-500 border-none transition-colors"
                        title="Eliminar nota"
                    >
                        <Pin style={{ transform: 'rotate(45deg)' }} color='red' size={16} />
                    </button>
                )}
            </div>
            <p className="text-zinc-800 text-xs italic lowercase line-clamp-5 pt-1">
                {entrada.texto}
            </p>
        </motion.div>
    );
};