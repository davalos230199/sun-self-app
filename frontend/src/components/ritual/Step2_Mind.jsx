import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import ClimaSlider from './ClimaSlider'; // Asegúrate que este componente también esté estilizado
import SunTimer from './SunTimer'; // Y este también
import brainRevealAnimation from '../../assets/animations/brain-reveal.json';
import brainLoopAnimation from '../../assets/animations/brain-loop.json';

// --- NUEVA SELECCIÓN DE FRASES ---
// Citas de estoicos y estrategas que ven la mente como una herramienta.
const citasMente = [
    "Tienes poder sobre tu mente, no sobre los acontecimientos. Date cuenta de esto y encontrarás la fuerza.",
    "El alma se tiñe del color de sus pensamientos.",
    "No son las cosas las que nos perturban, sino nuestras opiniones sobre ellas.",
    "La felicidad de tu vida depende de la calidad de tus pensamientos.",
    "El primer paso para la sabiduría es señalar lo que es falso."
];

export default function Step2_Mind({ onNextStep }) {
    const [animation, setAnimation] = useState(brainRevealAnimation);
    const [loop, setLoop] = useState(false);
    const [timerFinished, setTimerFinished] = useState(false);
    const [thought, setThought] = useState('');
    const [mindState, setMindState] = useState(50);
    const [cita, setCita] = useState('');

    useEffect(() => {
        // Seleccionamos una cita al azar cuando el componente se monta
        setCita(citasMente[Math.floor(Math.random() * citasMente.length)]);
    }, []);

    const handleRevealComplete = () => {
        setAnimation(brainLoopAnimation);
        setLoop(true);
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            // --- ESTILOS ACTUALIZADOS ---
            className="bg-blue-50 rounded-2xl shadow-xl p-8 text-center flex flex-col items-center w-full max-w-sm border-2 border-blue-200"
        >
            <div className="w-full flex flex-col items-center">
                {/* Título más personal */}
                <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">¿Cómo está tu mente?</h2>
                <div className="w-48 h-48 -mt-4">
                    <Lottie 
                        animationData={animation}
                        loop={loop}
                        onComplete={handleRevealComplete}
                    />
                </div>
            </div>

            {/* Usamos AnimatePresence para transiciones suaves */}
            <motion.div 
                key={timerFinished ? 'registro' : 'anclaje'}
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center flex-grow justify-center"
            >
            {!timerFinished ? (
                // --- FASE DE ANCLAJE ---
                <div className="w-full flex flex-col items-center text-center">
                    <p className="text-zinc-600 mb-4 italic">Tómate un momento para observar tus pensamientos sin juzgarlos.</p>
                    <SunTimer duration={5} onComplete={() => setTimerFinished(true)} />
                </div>
            ) : (
                // --- FASE DE REGISTRO ---
                <div className="w-full flex flex-col items-center gap-4">
                    <p className="text-zinc-600 px-2 italic text-sm">"{cita}"</p>
                    <textarea 
                        placeholder="Un pensamiento que destaque..." 
                        value={thought} 
                        onChange={(e) => setThought(e.target.value)} 
                        rows="2" 
                        className="w-full bg-white/70 italic border border-zinc-300 rounded-lg p-2 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    />
                    <ClimaSlider 
                        value={mindState}
                        onChange={(e) => setMindState(parseInt(e.target.value, 10))}
                    />
                </div>
            )}
            </motion.div>

            {/* El botón de 'Siguiente' ahora vive fuera de la fase de registro para estar siempre visible */}
            <button 
                onClick={() => onNextStep({ mente: { estado: mindState, comentario: thought } })} 
                disabled={!timerFinished}
                className={`mt-4 font-bold text-lg px-8 py-3 w-full rounded-xl shadow-lg transition-all transform disabled:cursor-not-allowed ${!timerFinished ? 'bg-zinc-300 text-zinc-500' : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'}`}
            >
                Siguiente
            </button>
        </motion.div>
    );
};