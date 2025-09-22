// frontend/src/components/ritual/Step5_Goal.jsx

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import goalRevealAnimation from '../../assets/animations/goal-reveal.json';
import goalLoopAnimation from '../../assets/animations/goal-loop.json';

// Frases más potentes y alineadas con la filosofía
const citasMeta = [
    "Un pequeño paso hoy es un gran salto mañana.",
    "La disciplina es el puente entre metas y logros.",
    "Define una intención clara que le dé dirección a tu día.",
    "Lo que haces hoy puede mejorar todos tus mañanas.",
    "Un objetivo sin un plan es solo un deseo."
];

export default function Step5_Goal({ onFinish }) {
    const [meta, setMeta] = useState('');
    const [animation, setAnimation] = useState(goalRevealAnimation);
    const [loop, setLoop] = useState(false);
    const [cita, setCita] = useState('');

    useEffect(() => {
        setCita(citasMeta[Math.floor(Math.random() * citasMeta.length)]);
    }, []);
    
    const isButtonDisabled = meta.trim() === '';

    const handleRevealComplete = () => {
        setAnimation(goalLoopAnimation);
        setLoop(true);
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            // --- ESTILOS ACTUALIZADOS CON MATIZ ÁMBAR/DORADO ---
            className="bg-amber-50 rounded-2xl shadow-xl p-8 text-center flex flex-col items-center w-full max-w-sm border-2 border-amber-200"
        >
            <div className="w-full flex flex-col items-center">
                <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">¿Cuál es tu norte para hoy?</h2>
                <div className="w-48 h-48 -mt-4">
                    <Lottie 
                        animationData={animation}
                        loop={loop}
                        onComplete={handleRevealComplete}
                    />
                </div>
            </div>

            <div className="w-full flex flex-col items-center gap-4 flex-grow justify-center">
                <p className="text-zinc-600 px-2 italic text-sm">"{cita}"</p>
                <textarea
                    placeholder="Ej: Terminar ese informe importante..."
                    value={meta}
                    onChange={(e) => setMeta(e.target.value)}
                    rows="3"
                    className="w-full bg-white/70 border border-zinc-300 rounded-lg p-2 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
            </div>
            
            <button
                onClick={() => onFinish(meta)}
                disabled={isButtonDisabled}
                className={`mt-4 font-bold text-lg px-8 py-3 w-full rounded-xl shadow-lg transition-all transform disabled:cursor-not-allowed ${isButtonDisabled ? 'bg-zinc-300 text-zinc-500' : 'bg-amber-500 text-white hover:bg-amber-600 hover:scale-105'}`}
            >
                {/* Texto del botón corregido */}
                Siguiente
            </button>
        </motion.div>
    );
};