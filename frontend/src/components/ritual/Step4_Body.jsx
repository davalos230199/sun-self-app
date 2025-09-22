import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import ClimaSlider from './ClimaSlider';
import SunTimer from './SunTimer';
import bodyRevealAnimation from '../../assets/animations/body-reveal.json';
import bodyLoopAnimation from '../../assets/animations/body-loop.json';

// --- NUEVOS CONSEJOS PARA EL CUERPO ---
// Prácticos, accionables y basados en hábitos saludables universales.
const consejosCuerpo = [
    "Un cuerpo hidratado es una mente clara. ¿Has bebido suficiente agua hoy?",
    "Tu postura afecta tu estado de ánimo. Siéntate o ponte de pie derecho por un minuto.",
    "Un paseo de 5 minutos puede cambiar tu energía por completo. ¿Puedes hacerlo ahora?",
    "La luz solar natural regula tu ritmo circadiano. Intenta recibir 10 minutos de sol hoy.",
    "El sueño no es un lujo, es una necesidad biológica. Prioriza tu descanso esta noche."
];

export default function Step4_Body({ onNextStep }) {
    const [animation, setAnimation] = useState(bodyRevealAnimation);
    const [loop, setLoop] = useState(false);
    const [timerFinished, setTimerFinished] = useState(false);
    const [sensation, setSensation] = useState('');
    const [bodyState, setBodyState] = useState(50);
    const [consejo, setConsejo] = useState('');

    useEffect(() => {
        setConsejo(consejosCuerpo[Math.floor(Math.random() * consejosCuerpo.length)]);
    }, []);

    const handleRevealComplete = () => {
        setAnimation(bodyLoopAnimation);
        setLoop(true);
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            // --- ESTILOS ACTUALIZADOS CON MATIZ VERDE ---
            className="bg-green-50 rounded-2xl shadow-xl p-8 text-center flex flex-col items-center w-full max-w-sm border-2 border-green-200"
        >
            <div className="w-full flex flex-col items-center">
                <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">¿Cómo sientes tu cuerpo?</h2>
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
                    <p className="text-zinc-600 mb-4 italic">Siente tu cuerpo de pies a cabeza, sin juicio.</p>
                    <SunTimer duration={5} onComplete={() => setTimerFinished(true)} />
                </div>
            ) : (
                <div className="w-full flex flex-col items-center gap-4">
                    <p className="text-zinc-600 px-2 italic text-sm">"{consejo}"</p>
                    <textarea 
                        placeholder="Una sensación física que destaque..." 
                        value={sensation}
                        onChange={(e) => setSensation(e.target.value)}
                        rows="2" 
                        className="w-full bg-white/70 italic border border-zinc-300 rounded-lg p-2 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-400" 
                    />
                    <ClimaSlider 
                        value={bodyState}
                        onChange={(e) => setBodyState(parseInt(e.target.value, 10))}
                    />
                </div>
            )}
            </motion.div>

            <button 
                onClick={() => onNextStep({ cuerpo: { estado: bodyState, comentario: sensation } })} 
                disabled={!timerFinished}
                className={`mt-4 font-bold text-lg px-8 py-3 w-full rounded-xl shadow-lg transition-all transform disabled:cursor-not-allowed ${!timerFinished ? 'bg-zinc-300 text-zinc-500' : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'}`}
            >
                Siguiente
            </button>
        </motion.div>
    );
};