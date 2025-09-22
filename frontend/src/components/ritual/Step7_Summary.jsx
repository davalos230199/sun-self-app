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

const bgMap = {
    soleado: 'from-amber-100 to-amber-50',
    nublado: 'from-slate-200 to-slate-50',
    lluvioso: 'from-blue-100 to-blue-50',
};

export default function Step7_Summary({ ritualData, onNextStep }) {
    const { estadoGeneral, fraseDelDia } = ritualData;
    const anims = animationMap[estadoGeneral] || animationMap.nublado;
    const bgGradient = bgMap[estadoGeneral] || bgMap.nublado;

    const [currentAnimation, setCurrentAnimation] = useState(anims.reveal);
    const [shouldLoop, setShouldLoop] = useState(false);

    const handleRevealComplete = () => {
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
            // --- ESTILO ÉPICO Y FAMILIAR ---
            className={`bg-gradient-to-b ${bgGradient} rounded-2xl shadow-xl p-8 text-center flex flex-col items-center justify-between w-full max-w-sm border-2 border-white/50 min-h-[580px]`}
        >
            <div /> {/* Elemento vacío para empujar el contenido con justify-between */}

            <div className="flex flex-col items-center">
                <div className="w-48 h-48">
                    <Lottie 
                        animationData={currentAnimation} 
                        loop={shouldLoop}
                        onComplete={handleRevealComplete}
                    />
                </div>
                <div className="mt-4 px-4">
                    <h2 className="font-['Patrick_Hand'] text-xl text-zinc-600">Sunny tiene una reflexión para ti:</h2>
                    <p className="font-['Patrick_Hand'] italic text-2xl text-zinc-800 mt-2">
                        "{fraseDelDia || 'Un momento de claridad...'}"
                    </p>
                </div>
            </div>

            <button
                onClick={onNextStep}
                className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-900 transition-colors shadow-lg"
            >
                Finalizar
            </button>
        </motion.div>
    );
}