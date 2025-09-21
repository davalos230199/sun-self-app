// frontend/src/components/PageHeader.jsx

import { useAuth } from '../../contexts/AuthContext';
import BotonAtras from '../common/BotonAtras';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react'; // 1. Importamos Lottie

// --- Importamos las animaciones que usaremos ---
import sunLoopAnimation from '../../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../../assets/animations/rain-loop.json';


// --- Sub-componente para la animación ---
// Creamos un pequeño componente para mantener la lógica de la animación encapsulada
const ClimaIconoAnimado = ({ estadoGeneral }) => {
    const animationMap = {
        soleado: sunLoopAnimation,
        nublado: cloudLoopAnimation,
        lluvioso: rainLoopAnimation,
    };
    // Leemos el estado. Si no existe, por defecto será nublado.
    const animationData = animationMap[estadoGeneral] || cloudLoopAnimation;

    return (
        // Ajustamos el tamaño para que encaje bien en el header
        <div className="w-12 h-12"> 
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
};

// --- La función de la fecha no cambia ---
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
    // 2. Ya no necesitamos la función determinarClima ni la variable climaEmoji

    return (
        <header className="bg-amber-50 border border-amber-400 rounded-lg shadow-md p-4 w-full flex-shrink-0">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 flex-1">
                    <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">
                        Hola, {user?.username || 'Viajero'}
                    </h2>
                </div>

                {/* 3. Reemplazamos el div del emoji por nuestro nuevo componente animado */}
                {registroDeHoy && registroDeHoy.estado_general && (
                    <ClimaIconoAnimado estadoGeneral={registroDeHoy.estado_general} />
                )}
                
                <div className="font-['Patrick_Hand'] text-xl text-zinc-600 flex-1 text-right">
                    {getFormattedDate()}
                </div>
            </div>

            {/* El resto del componente (título y botón de atrás) no necesita cambios */}
            <div className="mt-3 pt-3 border-t border-dashed border-amber-400 relative flex justify-center items-center h-8">
                <AnimatePresence>
                    {showBackButton && (
                        <motion.div
                            className="absolute left-0"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <BotonAtras />
                        </motion.div>
                    )}
                </AnimatePresence>
                <p className="font-['Patrick_Hand'] text-xl text-zinc-700">
                    {title}
                </p>
            </div>
        </header>
    );
}