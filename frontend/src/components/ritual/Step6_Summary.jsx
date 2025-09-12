import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';

// Importar todas las animaciones necesarias
import sunRevealAnimation from '../../assets/animations/sun-reveal.json';
import cloudRevealAnimation from '../../assets/animations/cloud-reveal.json';
import rainRevealAnimation from '../../assets/animations/rain-reveal.json';
import sunLoopAnimation from '../../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../../assets/animations/rain-loop.json';

// CAMBIO: onFinish ahora es onNextStep
const Step6_Summary = ({ ritualData, onNextStep }) => {
    const [animationPhase, setAnimationPhase] = useState('reveal');

    const getSummaryDetails = () => {
        const estado = ritualData?.estadoGeneral || 'nublado';
        if (estado === 'soleado') {
            return { reveal: sunRevealAnimation, loop: sunLoopAnimation, text: "Tu día se proyecta brillante y lleno de energía." };
        }
        if (estado === 'nublado') {
            return { reveal: cloudRevealAnimation, loop: cloudLoopAnimation, text: "Un día neutral, ideal para la introspección y la calma." };
        }
        return { reveal: rainRevealAnimation, loop: rainLoopAnimation, text: "Parece un día para cuidarte y permitirte sentir." };
    };

    const details = getSummaryDetails();
    const sunnyQuote = ritualData?.fraseDelDia || "Recuerda que cada día es una nueva oportunidad.";

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-6 text-center flex flex-col items-center gap-4 w-full max-w-sm border-2 border-amber-300"
        >
            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 -mb-2">Tu Estado de Hoy</h2>
            
            <LottieIcon
                animationData={animationPhase === 'reveal' ? details.reveal : details.loop}
                className="w-40 h-40"
                autoplay={true}
                loop={animationPhase === 'loop'}
                onComplete={() => setAnimationPhase('loop')}
            />
            
            <p className="text-zinc-700 font-['Patrick_Hand'] text-lg -mt-2">
                {details.text}
            </p>

            <div className="w-full bg-amber-50 border-t-2 border-b-2 border-amber-200 px-4 py-3 -mt-2">
                <p className="text-sm text-amber-800 italic">"{sunnyQuote}"</p>
            </div>
            
            {/* CAMBIO: El botón ahora llama a onNextStep */}
            <button
                onClick={onNextStep}
                className="mt-2 bg-amber-400 text-white font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg hover:bg-amber-500 transition-colors"
            >
                Definir mi Meta
            </button>
        </motion.div>
    );
};

export default Step6_Summary;

