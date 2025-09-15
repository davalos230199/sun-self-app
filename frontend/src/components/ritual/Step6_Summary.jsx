// Archivo: frontend/src/components/ritual/Step6_Summary.jsx

import React from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';

// 1. Importamos TODAS las animaciones 'reveal' necesarias
import sunRevealAnimation from '../../assets/animations/sun-reveal.json';
import cloudRevealAnimation from '../../assets/animations/cloud-reveal.json';
import rainRevealAnimation from '../../assets/animations/rain-reveal.json';

// 2. Creamos un objeto de configuración para manejar la lógica visual
const summaryConfig = {
    soleado: {
        animation: sunRevealAnimation,
        borderColor: 'border-yellow-400',
        buttonColor: 'bg-yellow-400 hover:bg-yellow-500',
    },
    nublado: {
        animation: cloudRevealAnimation,
        borderColor: 'border-slate-400',
        buttonColor: 'bg-slate-400 hover:bg-slate-500',
    },
    lluvioso: {
        animation: rainRevealAnimation,
        borderColor: 'border-sky-400',
        buttonColor: 'bg-sky-400 hover:bg-sky-500',
    },
};

const Step6_Summary = ({ ritualData, onNextStep }) => {
    // 3. Seleccionamos la configuración correcta basada en el estadoGeneral.
    // Añadimos un fallback a 'soleado' por si el dato no llega, para evitar que la app crashee.
    const config = summaryConfig[ritualData.estadoGeneral] || summaryConfig['soleado'];

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            // 4. Aplicamos los estilos dinámicos del borde
            className={`bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center justify-between gap-4 w-full max-w-sm border-2 ${config.borderColor} min-h-[580px]`}
        >
            <div className="w-full flex flex-col items-center gap-4">
                <h2 className="font-['Patrick_Hand'] text-3xl text-zinc-800">Tu Resumen del Día</h2>
                <LottieIcon 
                    // 5. Aplicamos la animación dinámica
                    animationData={config.animation}
                    className="w-56 h-56 -mt-8"
                    loop={false}
                />
            </div>
            
            <div className="w-full flex flex-col items-center gap-4">
                 <p className="text-md text-zinc-600 px-2 italic">Sunny dice:</p>
                <p className="text-lg text-zinc-800 font-semibold px-4">
                    "{ritualData.fraseDelDia || 'Cargando tu insight...'}"
                </p>
                
                <button
                    onClick={onNextStep}
                    // 6. Aplicamos los estilos dinámicos del botón
                    className={`mt-4 text-white font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg transition-colors ${config.buttonColor}`}
                >
                    Finalizar
                </button>
            </div>
        </motion.div>
    );
};

export default Step6_Summary;