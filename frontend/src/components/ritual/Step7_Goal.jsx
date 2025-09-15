// Archivo: frontend/src/components/ritual/Step7_Goal.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';
import goalRevealAnimation from '../../assets/animations/goal-reveal.json';
import goalLoopAnimation from '../../assets/animations/goal-loop.json';

const Step7_Goal = ({ onFinish }) => {
    const [meta, setMeta] = useState('');
    const [animationPhase, setAnimationPhase] = useState('reveal');
    const isButtonDisabled = meta.trim() === '';

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center gap-4 w-full max-w-sm border-2 border-fuchsia-400 min-h-[580px] justify-between"
        >
            <div className="w-full flex flex-col items-center gap-4">
                <h2 className="font-['Patrick_Hand'] text-3xl text-zinc-800">Tu Meta del Día</h2>
                <LottieIcon 
                    animationData={animationPhase === 'reveal' ? goalRevealAnimation : goalLoopAnimation}
                    className="w-56 h-56 -mt-8"
                    loop={animationPhase === 'loop'}
                    onComplete={() => setAnimationPhase('loop')}
                />
            </div>
            <div className="w-full flex flex-col items-center gap-4">
                <p className="text-md text-zinc-600 px-2 italic">"¿Cuál podría ser tu próximo pequeño gran logro?"</p>
                <textarea
                    placeholder="ej: Sonreír a un extraño, terminar ese informe..."
                    value={meta}
                    onChange={(e) => setMeta(e.target.value)}
                    rows="3"
                    className="w-full bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-2 text-zinc-700 placeholder:font-['Patrick_Hand'] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                />
                <button
                    onClick={() => onFinish(meta)}
                    disabled={isButtonDisabled}
                    className={`mt-2 font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg transition-all transform ${isButtonDisabled ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' : 'bg-fuchsia-500 text-white hover:bg-fuchsia-600 hover:scale-105'}`}
                >
                    Guardar y Empezar el Día
                </button>
            </div>
        </motion.div>
    );
};

export default Step7_Goal;