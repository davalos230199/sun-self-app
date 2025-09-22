import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import ClimaSlider from './ClimaSlider';
import SunTimer from './SunTimer';
import emotionRevealAnimation from '../../assets/animations/emotion-reveal.json';
import emotionLoopAnimation from '../../assets/animations/emotion-loop.json';

// Citas que invitan a aceptar y entender las emociones, no a juzgarlas
const citasEmocion = [
    "Tus emociones son solo visitantes, déjalos ir y venir.",
    "Sentir es humano. Permitirte sentir es sabiduría.",
    "La emoción es la energía que te pide que prestes atención a algo.",
    "No eres tus emociones; eres el cielo, y ellas son el clima.",
    "Cada emoción, incluso la más difícil, lleva consigo un regalo."
];

export default function Step3_Emotion({ onNextStep }) {
    const [animation, setAnimation] = useState(emotionRevealAnimation);
    const [loop, setLoop] = useState(false);
    const [timerFinished, setTimerFinished] = useState(false);
    const [feeling, setFeeling] = useState('');
    const [emotionState, setEmotionState] = useState(50);
    const [cita, setCita] = useState('');

    useEffect(() => {
        setCita(citasEmocion[Math.floor(Math.random() * citasEmocion.length)]);
    }, []);

    const handleRevealComplete = () => {
        setAnimation(emotionLoopAnimation);
        setLoop(true);
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            // --- ESTILOS ACTUALIZADOS CON MATIZ ROSA PASTEL ---
            className="bg-pink-50 rounded-2xl shadow-xl p-8 text-center flex flex-col items-center w-full max-w-sm border-2 border-pink-200"
        >
            <div className="w-full flex flex-col items-center">
                <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">¿Qué sientes ahora?</h2>
                <div className="w-48 h-48 -mt-4">
                    <Lottie 
                        animationData={animation}
                        loop={loop}
                        onComplete={handleRevealComplete}
                    />
                </div>
            </div>

            <motion.div 
                key={timerFinished ? 'registro' : 'anclaje'}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center flex-grow justify-center"
            >
            {!timerFinished ? (
                <div className="w-full flex flex-col items-center text-center">
                    <p className="text-zinc-600 mb-4 italic">Simplemente nombra la emoción que sientes, sin juicio.</p>
                    <SunTimer duration={5} onComplete={() => setTimerFinished(true)} />
                </div>
            ) : (
                <div className="w-full flex flex-col items-center gap-4">
                    <p className="text-zinc-600 px-2 italic text-sm">"{cita}"</p>
                    <textarea 
                        placeholder="Una palabra o frase sobre este sentimiento..." 
                        value={feeling} 
                        onChange={(e) => setFeeling(e.target.value)} 
                        rows="2" 
                        className="w-full bg-white/70 italic border border-zinc-300 rounded-lg p-2 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-400" 
                    />
                    <ClimaSlider 
                        value={emotionState}
                        onChange={(e) => setEmotionState(parseInt(e.target.value, 10))}
                    />
                </div>
            )}
            </motion.div>

            <button 
                onClick={() => onNextStep({ emocion: { estado: emotionState, comentario: feeling } })} 
                disabled={!timerFinished}
                className={`mt-4 font-bold text-lg px-8 py-3 w-full rounded-xl shadow-lg transition-all transform disabled:cursor-not-allowed ${!timerFinished ? 'bg-zinc-300 text-zinc-500' : 'bg-pink-500 text-white hover:bg-pink-600 hover:scale-105'}`}
            >
                Siguiente
            </button>
        </motion.div>
    );
};