// frontend/src/components/ritual/Step6_Summary.jsx

import React, { useState } from 'react'; // Importamos useState
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
//import { Brain, Heart, Shield } from 'lucide-react'; // Importamos iconos

import brainIcon from '../../assets/icons/brain.svg';
import emotionIcon from '../../assets/icons/emotion.svg';
import bodyIcon from '../../assets/icons/body.svg';

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
    const { estadoGeneral, consejos } = ritualData;
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
    // --- Fallback por si la API falla ---
    const consejoMente = consejos?.consejo_mente || "Observa tus pensamientos sin juicio.";
    const consejoEmocion = consejos?.consejo_emocion || "Permite que tus emociones fluyan como el clima.";
    const consejoCuerpo = consejos?.consejo_cuerpo || "Escucha a tu cuerpo, necesita tu atención.";
    const fraseAliento = consejos?.frase_aliento || "Un paso a la vez. Lo estás haciendo bien.";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className={`bg-gradient-to-b ${bgGradient} rounded-2xl shadow-xl p-6 pt-4 text-center flex flex-col items-center justify-between w-full max-w-sm border-2 border-white/50 min-h-[580px]`}
        >
            {/* 1. Animación (más pequeña) */}
            <div className="w-32 h-32">
                <Lottie 
                    animationData={currentAnimation} 
                    loop={shouldLoop}
                    onComplete={handleRevealComplete}
                />
            </div>

            {/* 2. El Plan de Acción (El "Giro") */}
            <div className="flex-grow w-full flex flex-col justify-center px-2">
                <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4">Tu Plan de Acción para Hoy:</h2>
                
                <ul className="space-y-3 text-left">
                    {/* Consejo de Mente */}
                    <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full mt-8">
                            {/* --- CAMBIO DE ICONO --- */}
                            <img src={brainIcon} alt="Mente" className="w-full h-full" />
                        </div>
                        <div>
                            <h3 className="font-['Patrick_Hand'] text-lg text-blue-800 text-center -ml-12">Mente</h3>
                            <p className="text-zinc-700 text-base -mt-4">"{consejoMente}"</p>
                        </div>
                    </li>
                    
                    {/* Consejo de Emoción */}
                    <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-pink-100 rounded-full mt-8">
                            {/* --- CAMBIO DE ICONO --- */}
                            <img src={emotionIcon} alt="Emoción" className="w-full h-full" />
                        </div>
                        <div>
                            <h3 className="font-['Patrick_Hand'] text-lg text-pink-800 text-center -ml-12">Emoción</h3>
                            <p className="text-zinc-700 text-base -mt-4">"{consejoEmocion}"</p>
                        </div>
                    </li>

                    {/* Consejo de Cuerpo */}
                    <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 rounded-full mt-8">
                             {/* --- CAMBIO DE ICONO --- */}
                            <img src={bodyIcon} alt="Cuerpo" className="w-full h-full" />
                        </div>
                        <div>
                            <h3 className="font-['Patrick_Hand'] text-lg text-green-800 text-center -ml-12">Cuerpo</h3>
                            <p className="text-zinc-700 text-base -mt-4">"{consejoCuerpo}"</p>
                        </div>
                    </li>
                </ul>

                {/* 3. Frase de Aliento */}
                <h3 className="font-['Patrick_Hand'] mt-3 text-2xl text-amber-500">Recuerda</h3>
                <p className="font-['Patrick_Hand'] italic text-xl text-zinc-800 -mt-5">
                    "{fraseAliento}"
                </p>
            </div>

            <button
                onClick={onNextStep}
                className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-900 transition-colors shadow-lg mt-4"
            >
                Finalizar
            </button>
        </motion.div>
    );
}