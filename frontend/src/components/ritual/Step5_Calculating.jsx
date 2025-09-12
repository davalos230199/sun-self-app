import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';
// Asegúrate de tener una animación para este estado
import calculatingAnimation from '../../assets/animations/calculating-loop.json'; 

const Step5_Calculating = ({ onNextStep }) => {
    // Pasa al siguiente paso automáticamente después de 3 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            onNextStep();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onNextStep]);

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-6 text-center flex flex-col items-center gap-4 w-full max-w-sm border-2 border-amber-300"
        >
            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">Analizando tu estado...</h2>
            <LottieIcon 
                animationData={calculatingAnimation} 
                className="w-40 h-40"
                loop={true}
            />
            <p className="text-sm text-zinc-600">Conectando con tu sol interior.</p>
        </motion.div>
    );
};

export default Step5_Calculating;
