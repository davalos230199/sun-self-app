// frontend/src/components/ritual/Step6_Summary.jsx

import React, { useState } from 'react'; // Importamos useState
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

// Importamos las animaciones
import sunRevealAnimation from '../../assets/animations/sun-reveal.json';
import sunLoopAnimation from '../../assets/animations/sun-loop.json';
import cloudRevealAnimation from '../../assets/animations/cloud-reveal.json';
import cloudLoopAnimation from '../../assets/animations/cloud-loop.json';
import rainRevealAnimation from '../../assets/animations/rain-reveal.json';
import rainLoopAnimation from '../../assets/animations/rain-loop.json';

const animationMap = {
    soleado: { reveal: sunRevealAnimation, loop: sunLoopAnimation },
    nublado: { reveal: cloudRevealAnimation, loop: cloudLoopAnimation },
    lluvioso: { reveal: rainRevealAnimation, loop: rainLoopAnimation },
};

export default function Step6_Summary({ ritualData, onNextStep }) {
    // --- 1. DESTRUCTURAMOS los datos que necesitamos de la 'caja' ritualData ---
    const { estadoGeneral, fraseDelDia } = ritualData;

    // Obtenemos las animaciones correctas, con un valor por defecto
    const anims = animationMap[estadoGeneral] || animationMap.nublado;

    // --- 2. MOVEMOS los hooks useState DENTRO del componente ---
    const [currentAnimation, setCurrentAnimation] = useState(anims.reveal);
    const [shouldLoop, setShouldLoop] = useState(false);

    const handleRevealComplete = () => {
        // Solo cambiamos a loop si la animación actual es la de 'reveal'
        // para evitar que se llame en un bucle infinito si onComplete se dispara de nuevo.
        if (currentAnimation === anims.reveal) {
            setCurrentAnimation(anims.loop);
            setShouldLoop(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center justify-center gap-4 w-full max-w-sm border-2 border-slate-300 min-h-[580px]"
        >   
            <h2 className="font-['Patrick_Hand'] text-3xl italic text-zinc-800">Piensa en lo siguiente</h2>
                <Lottie 
                    className="w-56 h-56"
                    animationData={currentAnimation} 
                    loop={shouldLoop}
                    onComplete={handleRevealComplete}
                />

            <p className="font-['Patrick_Hand'] italic text-2xl text-zinc-700 mt-4">
                {/* --- 3. Usamos la variable 'fraseDelDia' que ya destructuramos --- */}
                "{fraseDelDia || 'Un momento de claridad...'}"
            </p>

            <button
                onClick={onNextStep}
                className="mt-8 w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-amber-600 transition-colors shadow-lg"
            >
                Finalizar
            </button>
        </motion.div>
    );
}