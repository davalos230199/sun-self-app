// Archivo: frontend/src/components/ritual/Step2_Mind.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';
import ClimaSlider from '../ClimaSlider';
import SunTimer from '../SunTimer';
import brainRevealAnimation from '../../assets/animations/brain-reveal.json';
import brainLoopAnimation from '../../assets/animations/brain-loop.json';

const consejosMente = [
    "Tip: Una mente clara surge de un espacio ordenado. ¿Qué objeto puedes guardar ahora mismo?",
    "Insight: Tus pensamientos no son hechos, son sugerencias. Elige cuál escuchar.",
    "Acción: La multitarea es un mito. Enfócate en una sola cosa por los próximos 5 minutos.",
    "Reflexión: ¿Este pensamiento te sirve ahora mismo? Si no, déjalo pasar como una nube."
];

const Step2_Mind = ({ onNextStep }) => {
    const [animationPhase, setAnimationPhase] = useState('reveal');
    const [timerFinished, setTimerFinished] = useState(false);
    const [thought, setThought] = useState('');
    const [mindState, setMindState] = useState(50);
    const [consejo, setConsejo] = useState('');

    useEffect(() => {
        setConsejo(consejosMente[Math.floor(Math.random() * consejosMente.length)]);
    }, []);

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center gap-4 w-full max-w-sm border-2 border-indigo-300 min-h-[580px] justify-between"
        >
            <div className="w-full flex flex-col items-center gap-4">
                <h2 className="font-['Patrick_Hand'] text-3xl text-zinc-800">Observa tu Mente</h2>
                <LottieIcon 
                    animationData={animationPhase === 'reveal' ? brainRevealAnimation : brainLoopAnimation}
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
                        <h3 className="font-['Patrick_Hand'] text-xl text-indigo-500">El Método</h3>
                        <p className="text-md text-zinc-600 px-2">Observa un objeto a tu alrededor sin juzgarlo. Ancla tu atención.</p>
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
                        placeholder="Escribe un pensamiento que ronde tu mente..." 
                        value={thought} 
                        onChange={(e) => setThought(e.target.value)} 
                        rows="2" 
                        className="w-full bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-zinc-700 placeholder:font-['Patrick_Hand'] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-400" 
                    />
                    <ClimaSlider 
                        aspecto="mente"
                        value={mindState}
                        onChange={(e) => setMindState(parseInt(e.target.value, 10))}
                    />
                    <button 
                        onClick={() => onNextStep({ mente: { estado: mindState, comentario: thought } })} 
                        className="mt-2 bg-indigo-400 text-white font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg hover:bg-indigo-500 transition-colors"
                    >
                        Siguiente
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Step2_Mind;