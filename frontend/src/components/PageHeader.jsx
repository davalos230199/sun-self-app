// frontend/src/components/PageHeader.jsx

import { useAuth } from '../contexts/AuthContext';
import BotonAtras from './common/BotonAtras'; // 
import { motion, AnimatePresence } from 'framer-motion';

// La función para determinar el clima no cambia
const determinarClima = (reg) => {
    if (!reg) return null;
    const valores = [reg.mente_estat, reg.emocion_estat, reg.cuerpo_estat];
    const puntaje = valores.reduce((acc, val) => {
        if (val === 'alto') return acc + 1;
        if (val === 'bajo') return acc - 1;
        return acc;
    }, 0);
    if (puntaje >= 2) return '☀️';
    if (puntaje <= -2) return '🌧️';
    return '⛅';
};

// La función de la fecha no cambia
const getFormattedDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
    const year = date.getFullYear();
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${day}/${capitalizedMonth}/${year}`;
};


export default function PageHeader({ title, registroDeHoy, showBackButton }) {
    const { user } = useAuth();
    const climaEmoji = determinarClima(registroDeHoy);

    return (
        <header className="bg-white border border-amber-400 rounded-lg shadow-md p-4 w-full flex-shrink-0">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 flex-1">
                    <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">
                        Hola, {user?.nombre || 'viajero'}
                    </h2>
                </div>
                {climaEmoji && (
                    <div className="text-3xl animate-pulse">
                        {climaEmoji}
                    </div>
                )}
                <div className="font-['Patrick_Hand'] text-xl text-zinc-600 flex-1 text-right">
                    {getFormattedDate()}
                </div>
            </div>


            <div className="mt-3 pt-3 border-t border-dashed border-amber-400 relative flex justify-center items-center h-8">
                
                {/* 2. Wrap the button in AnimatePresence to handle enter/exit animations */}
                <AnimatePresence>
                    {showBackButton && (
                        <motion.div
                            className="absolute left-0"
                            // 3. Define the animation properties
                            initial={{ opacity: 0, x: -10 }} // Starts invisible and slightly to the left
                            animate={{ opacity: 1, x: 0 }}   // Fades in and slides to its final position
                            exit={{ opacity: 0, x: -10 }}    // Fades out and slides back to the left
                            transition={{ duration: 0.2 }}
                        >
                            <BotonAtras />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. El título se mantiene centrado, ignorando al botón */}
                <p className="font-['Patrick_Hand'] text-xl text-zinc-700">
                    {title}
                </p>

            </div>
        </header>
    );
}