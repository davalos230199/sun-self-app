// Archivo: frontend/src/components/ritual/Step5_Calculating.jsx

import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import calculatingAnimation from '../../assets/animations/calculating-loop.json'; 

const Step5_Calculating = () => {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center justify-center gap-4 w-full max-w-sm border-2 border-slate-300 min-h-[580px]"
        >
            <h2 className="font-['Patrick_Hand'] text-3xl text-zinc-800">Analizando tu estado...</h2>
            <Lottie 
                animationData={calculatingAnimation} 
                className="w-56 h-56"
                loop={true}
            />
            <p className="text-md text-zinc-600">Conectando con tu sol interior.</p>
        </motion.div>
    );
};

export default Step5_Calculating;