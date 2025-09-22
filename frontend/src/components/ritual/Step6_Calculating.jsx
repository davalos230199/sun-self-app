// frontend/src/components/ritual/Step6_Calculating.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import calculatingAnimation from '../../assets/animations/calculating-loop.json'; 

// Frases que rotan para mantener la reflexión
const frasesDeCarga = [
    "Analizando tus reflexiones...",
    "Conectando los puntos de tu día...",
    "Buscando una nueva perspectiva...",
    "Sintonizando con tu estado interior...",
    "Un momento de introspección..."
];

export default function Step6_Calculating() {
    const [fraseActual, setFraseActual] = useState(frasesDeCarga[0]);
    const [indice, setIndice] = useState(0);

    // useEffect para rotar las frases cada 3 segundos
    useEffect(() => {
        const intervalId = setInterval(() => {
            setIndice(prevIndice => (prevIndice + 1) % frasesDeCarga.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        setFraseActual(frasesDeCarga[indice]);
    }, [indice]);


    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            // --- ESTILOS ACTUALIZADOS: Paleta neutra y elegante ---
            className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center justify-center w-full max-w-sm border-2 border-slate-200"
        >
            <div className="w-56 h-56">
                <Lottie 
                    animationData={calculatingAnimation} 
                    loop={true}
                />
            </div>
            
            <AnimatePresence mode="wait">
                <motion.p
                    key={fraseActual} // La clave es la frase, para que se active la animación al cambiar
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="font-['Patrick_Hand'] text-xl text-slate-600 h-12" // Altura fija para evitar saltos
                >
                    {fraseActual}
                </motion.p>
            </AnimatePresence>
        </motion.div>
    );
};