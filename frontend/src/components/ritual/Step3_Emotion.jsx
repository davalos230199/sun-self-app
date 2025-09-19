// Archivo: frontend/src/components/ritual/Step3_Emotion.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';
import ClimaSlider from './ClimaSlider';
import SunTimer from './SunTimer';
import emotionRevealAnimation from '../../assets/animations/emotion-reveal.json';
import emotionLoopAnimation from '../../assets/animations/emotion-loop.json';

const consejosEmocion = [
    "Insight: Las emociones son energía en movimiento. No luches contra la corriente, solo obsérvala pasar.",
    "Acción: Nombra la emoción que sientes en voz alta. Darle un nombre le quita poder.",
    "Reflexión: ¿Qué te está intentando decir esta emoción? Escúchala como un mensajero.",
    "Tip: Una sonrisa, incluso forzada, puede enviar señales positivas a tu cerebro. Inténtalo por 10 segundos."
];

const Step3_Emotion = ({ onNextStep }) => {
    const [animationPhase, setAnimationPhase] = useState('reveal');
    const [timerFinished, setTimerFinished] = useState(false);
    const [feeling, setFeeling] = useState('');
    const [emotionState, setEmotionState] = useState(50);
    const [consejo, setConsejo] = useState('');

    useEffect(() => {
        setConsejo(consejosEmocion[Math.floor(Math.random() * consejosEmocion.length)]);
    }, []);

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center gap-4 w-full max-w-sm border-2 border-pink-300 min-h-[580px] justify-between"
        >
            <div className="w-full flex flex-col items-center gap-4">
                <h2 className="font-['Patrick_Hand'] text-3xl text-zinc-800">Observa tus Emociones</h2>
                <LottieIcon 
                    animationData={animationPhase === 'reveal' ? emotionRevealAnimation : emotionLoopAnimation}
                    className="w-56 h-56 -mt-8"
                    loop={animationPhase === 'loop'}
                    onComplete={() => setAnimationPhase('loop')}
                />
            </div>
            {!timerFinished ? (
                <motion.div 
                    key="anclaje"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center gap-4"
                >
                    <div className="text-center">
                        <h3 className="font-['Patrick_Hand'] text-xl text-pink-500">El Método</h3>
                        <p className="text-md text-zinc-600 px-2">Nombra en tu mente la emoción más presente en ti ahora mismo.</p>
                    </div>
                    <SunTimer duration={5} onComplete={() => setTimerFinished(true)} />
                </motion.div>
            ) : (
                <motion.div 
                    key="registro"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="w-full flex flex-col items-center gap-4"
                >
                    <p className="text-md text-zinc-600 px-2 italic">"{consejo}"</p>
                    <textarea 
                        placeholder="Describe brevemente este sentimiento..." 
                        value={feeling} 
                        onChange={(e) => setFeeling(e.target.value)} 
                        rows="2" 
                        className="w-full bg-pink-50 border border-pink-200 rounded-lg p-2 text-zinc-700 placeholder:font-['Patrick_Hand'] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-400" 
                    />
                    <ClimaSlider 
                        aspecto="emocion"
                        value={emotionState}
                        onChange={(e) => setEmotionState(parseInt(e.target.value, 10))}
                    />
                    <button 
                        onClick={() => onNextStep({ emocion: { estado: emotionState, comentario: feeling } })} 
                        className="bg-pink-400 text-white font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg hover:bg-pink-500 transition-colors"
                    >
                        Siguiente
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Step3_Emotion;