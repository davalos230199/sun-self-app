import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react'; // Cambiamos la importación para usar Lottie directamente
import breathingAnimation from '../../assets/animations/breath.json';

const EJERCICIO_DURATION_SEC = 10; // Un poco más de tiempo para conectar

export default function Step1_Breathing({ onNextStep }) {
    const [text, setText] = useState('Inhala...');
    const [countdown, setCountdown] = useState(EJERCICIO_DURATION_SEC);
 
    // Ciclo de respiración (sin cambios en la lógica)
    useEffect(() => {
        const inhaleDuration = 5000, holdDuration = 1000, exhaleDuration = 5000, pauseDuration = 3000;
        const totalCycleDuration = inhaleDuration + holdDuration + exhaleDuration + pauseDuration;
        const runCycle = () => {
            setText('Inhala...');
            setTimeout(() => setText('Sostén...'), inhaleDuration);
            setTimeout(() => setText('Exhala...'), inhaleDuration + holdDuration);
        };
        runCycle();
        const cycleInterval = setInterval(runCycle, totalCycleDuration);
        return () => clearInterval(cycleInterval);
    }, []);

    // Cuenta regresiva (sin cambios en la lógica)
    useEffect(() => {
        if (countdown <= 0) return;
        const countdownInterval = setInterval(() => setCountdown(prev => prev - 1), 1000);
        return () => clearInterval(countdownInterval);
    }, [countdown]);

    const isButtonDisabled = countdown > 0;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            // --- ESTILOS ACTUALIZADOS: Paleta blanca y gris suave ---
            className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center w-full max-w-sm border-2 border-slate-200"
        >
            <div className="text-center">
                <h1 className="font-['Patrick_Hand'] text-3xl text-slate-800">Primero, un respiro...</h1>
                <p className="text-slate-500 text-sm -mt-1 italic">Conecta con el momento presente.</p>
            </div>
            
            {/* Contenedor principal que se expande para distribuir el espacio */}
            <div className="flex-grow flex flex-col items-center justify-center w-full my-4">
                <div className="w-48 h-48">
                    <Lottie animationData={breathingAnimation} loop={true} />
                </div>

                <div className="h-12 flex items-center justify-center mt-10">
                    {/* El texto ahora tiene un color más sobrio */}
                    <span className="font-['Patrick_Hand'] text-4xl text-slate-600 drop-shadow-sm w-32 text-center">{text}</span>
                </div>
            </div>

            <button
                onClick={() => onNextStep({ timestamp_start: new Date() })}
                disabled={isButtonDisabled}
                // Botón con el nuevo estilo visual
                className={` mt-2 font-bold text-lg px-8 py-3 w-full rounded-xl shadow-lg transition-all transform disabled:cursor-not-allowed ${isButtonDisabled ? 'bg-zinc-300 text-zinc-500' : 'bg-slate-700 text-white hover:bg-slate-800 hover:scale-105'}`}
            >
                {isButtonDisabled ? `Respira... (${countdown}s)` : 'Continuar'}
            </button>
        </motion.div>
    );
};