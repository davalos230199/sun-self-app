// Archivo: frontend/src/components/ritual/Step1_Breathing.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';
import breathingAnimation from '../../assets/animations/breath.json';

const EJERCICIO_DURATION_SEC = 24;

const Step1_Breathing = ({ onNextStep }) => {
    const [text, setText] = useState('Inhala...');
    const [countdown, setCountdown] = useState(EJERCICIO_DURATION_SEC);
    const inhaleDuration = 5000, holdDuration = 1000, exhaleDuration = 5000, pauseDuration = 1000;
    const totalCycleDuration = inhaleDuration + holdDuration + exhaleDuration + pauseDuration;

    useEffect(() => {
        const runCycle = () => {
            setText('Inhala...');
            setTimeout(() => setText('Sostén...'), inhaleDuration);
            setTimeout(() => setText('Exhala...'), inhaleDuration + holdDuration);
        };
        runCycle(); 
        const cycleInterval = setInterval(runCycle, totalCycleDuration);
        return () => clearInterval(cycleInterval);
    }, []);

    useEffect(() => {
        if (countdown <= 0) return;
        const countdownInterval = setInterval(() => setCountdown(prev => prev - 1), 1000);
        return () => clearInterval(countdownInterval);
    }, [countdown]);

    const isButtonDisabled = countdown > 0;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center flex flex-col items-center gap-4 w-full max-w-sm border-2 border-amber-300 min-h-[580px] justify-center"
        >
            <LottieIcon animationData={breathingAnimation} className="w-56 h-56 -mt-8" />
            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-700">Conecta con el presente</h2>
            <div className="h-12 flex items-center justify-center">
                <span className="font-['Patrick_Hand'] text-4xl text-amber-500 drop-shadow-sm w-32 text-center">{text}</span>
            </div>
            <button
                onClick={() => onNextStep({ timestamp_start: new Date() })}
                disabled={isButtonDisabled}
                className={`mt-4 font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg transition-all transform ${isButtonDisabled ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' : 'bg-amber-400 text-white hover:bg-amber-500 hover:scale-105'}`}
            >
                {isButtonDisabled ? `Respira... (${countdown}s)` : 'Continuar'}
            </button>
        </motion.div>
    );
};

export default Step1_Breathing;