import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';
import goalAnimation from '../../assets/animations/sun-reveal.json'; // Reutilizamos una animación inspiradora

const Step7_Goal = ({ onFinish }) => {
    const [meta, setMeta] = useState('');

    const handleSave = () => {
        // onFinish ahora pasa la meta al componente padre
        onFinish(meta);
    };

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-6 text-center flex flex-col items-center gap-4 w-full max-w-sm border-2 border-amber-300"
        >
            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 -mb-2">Tu Meta del Día</h2>
            <LottieIcon 
                animationData={goalAnimation} 
                className="w-32 h-32"
                autoplay={true}
                loop={false}
            />
            <p className="text-sm text-zinc-600 px-2 -mt-4">Define un pequeño gran objetivo que le dé dirección a tu día.</p>
            <textarea
                placeholder="ej: Sonreír a un extraño, terminar ese informe..."
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                rows="2"
                className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2 text-zinc-700 placeholder:font-['Patrick_Hand'] placeholder:text-zinc-400 placeholder:italic focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
                onClick={handleSave}
                className="mt-2 bg-amber-400 text-white font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg hover:bg-amber-500 transition-colors"
            >
                Guardar y Empezar
            </button>
        </motion.div>
    );
};

export default Step7_Goal;
