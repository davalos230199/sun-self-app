import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';
import breathingAnimation from '../../assets/animations/breath.json'; // Asegúrate que tu animación se llame así

const Step1_Breathing = ({ onNextStep }) => {
    const [text, setText] = useState('Inhala...');

    // Sincronización: Ajusta estos valores para que coincidan con la duración de tu animación .json
    const inhaleDuration = 4000; // 4 segundos
    const cycleDuration = 8000; // 8 segundos en total

    useEffect(() => {
        const inhaleTimer = setTimeout(() => setText('Exhala...'), inhaleDuration);
        const resetTimer = setTimeout(() => setText('Inhala...'), cycleDuration); 

        return () => {
            clearTimeout(inhaleTimer);
            clearTimeout(resetTimer);
        };
    }, [text]);

    return (
        // SIMPLIFICADO: Este es solo el componente de la tarjeta. El fondo oscuro lo maneja RitualFlow.
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center gap-6 w-full max-w-sm border-2 border-amber-300"
        >
            <LottieIcon 
                animationData={breathingAnimation} 
                className="w-40 h-40"
            />
            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-700">Conecta con el presente.</h2>
            <span className="font-['Patrick_Hand'] text-3xl text-amber-500 drop-shadow-sm w-24 text-center">
                {text}
            </span>
            <button
                onClick={() => onNextStep({ timestamp_start: new Date() })}
                className="mt-4 bg-amber-400 text-white font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg hover:bg-amber-500 transition-colors transform hover:scale-105"
            >
                ¡Ya estoy aquí!
            </button>
        </motion.div>
    );
};

export default Step1_Breathing;

