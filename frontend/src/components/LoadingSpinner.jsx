// frontend/src/components/LoadingSpinner.jsx
import React from 'react';
import Lottie from 'lottie-react';

// --- Importamos las animaciones ---
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';

// --- Sub-componente para la animación ---
const IconoAnimado = ({ estadoGeneral }) => {
    const animationMap = {
        soleado: sunLoopAnimation,
        nublado: cloudLoopAnimation,
        lluvioso: rainLoopAnimation,
    };
    // Si no se especifica un estado, o es desconocido, mostramos el sol por defecto.
    const animationData = animationMap[estadoGeneral] || sunLoopAnimation; 

    return (
        <div className="w-16 h-16"> {/* Aumentamos un poco el tamaño */}
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
};


/**
 * Un spinner de carga reutilizable que muestra una animación según el estado general.
 * @param {{ message?: string, estadoGeneral?: 'soleado'|'nublado'|'lluvioso' }} props
 */
export default function LoadingSpinner({ message = "Cargando...", estadoGeneral }) {
    // Definimos el color del texto basado en el estado para mayor coherencia
    const colorMap = {
        soleado: 'text-amber-500',
        nublado: 'text-zinc-500',
        lluvioso: 'text-blue-400',
    };
    const textColor = colorMap[estadoGeneral] || 'text-zinc-500';

    return (
        <div className={`flex-grow flex flex-col items-center justify-center h-full ${textColor}`}>
            <IconoAnimado estadoGeneral={estadoGeneral} />
            <p className="font-['Patrick_Hand'] mt-4 text-lg">
                {message}
            </p>
        </div>
    );
}