// frontend/src/components/ritual/Step5_Goal.jsx

import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react'; 
import api from '../../services/api'; // Usamos el servicio de API real
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import goalRevealAnimation from '../../assets/animations/goal-reveal.json';
import goalLoopAnimation from '../../assets/animations/goal-loop.json';

const citasMeta = [
    "Un pequeño paso hoy es un gran salto mañana.",
    "La disciplina es el puente entre metas y logros.",
    "Define una intención clara que le dé dirección a tu día.",
    "Lo que haces hoy puede mejorar todos tus mañanas.",
    "Un objetivo sin un plan es solo un deseo."
];

export default function Step5_Goal({ onFinish, ritualData }) {
    // --- ESTADO LOCAL (SIMPLE Y SEGURO) ---
    // Iniciamos con lo que ya tenga ritualData (si volviste atrás) o vacío
    const [meta, setMeta] = useState(ritualData?.meta || ''); 

    const [animation, setAnimation] = useState(goalRevealAnimation);
    const [loop, setLoop] = useState(false);
    const [cita, setCita] = useState('');

    const [isSuggesting, setIsSuggesting] = useState(false); 
    const [suggestError, setSuggestError] = useState(null); 

    // Esta función solo actualiza el cuadrito de texto local
    const handleSuggestMeta = async () => {
        setIsSuggesting(true);
        setSuggestError(null);

        const dataToSend = {
            mente_estado: ritualData.mente?.estado,
            mente_comentario: ritualData.mente?.comentario,
            emocion_estado: ritualData.emocion?.estado,
            emocion_comentario: ritualData.emocion?.comentario,
            cuerpo_estado: ritualData.cuerpo?.estado,
            cuerpo_comentario: ritualData.cuerpo?.comentario,
        };

        try {
            // Llamamos a la API
            const response = await api.sugerirMeta(dataToSend); 
            
            // Extraemos la respuesta (axios la pone en .data)
            const { meta_sugerida } = response.data;

            if (meta_sugerida) {
                // ¡Simplemente actualizamos el estado local!
                setMeta(meta_sugerida);
            } else {
                throw new Error("La IA no devolvió sugerencia.");
            }

        } catch (error) {
            console.error("Error al sugerir meta:", error);
            setSuggestError("Sunny no responde. Intenta escribirla tú.");
        } finally {
            setIsSuggesting(false);
        }
    };

    useEffect(() => {
        setCita(citasMeta[Math.floor(Math.random() * citasMeta.length)]);
    }, []);
    
    const isButtonDisabled = isSuggesting || meta.trim() === ''; 

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
                <div className="w-full flex justify-between items-center mb-1">
                    <label htmlFor="meta_descripcion" className="text-lg font-semibold text-zinc-700">Meta del Día</label>
                    
                    <button
                        onClick={handleSuggestMeta}
                        disabled={isSuggesting}
                        className={`
                            flex items-center px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200
                            ${isSuggesting ? 'bg-amber-400/80 text-white cursor-not-allowed' : 'bg-amber-400 text-white hover:bg-amber-500'}
                        `}
                    >
                        {isSuggesting ? (
                            <span className="flex items-center">
                                <Zap size={16} className="animate-pulse mr-1" />
                                Pensando...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <Zap size={16} className="mr-1" />
                                Sugerir Meta
                            </span>
                        )}
                    </button>
                </div>

                <textarea
                    placeholder="Ej: Hoy me enfocaré en mantener la calma y la concentración."
                    value={meta}
                    onChange={(e) => setMeta(e.target.value)} 
                    rows="3"
                    className="w-full bg-white/70 border border-zinc-300 rounded-lg p-2 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                
                {suggestError && (
                    <p className="text-red-500 text-sm mt-2">{suggestError}</p>
                )}
            </div>
            
            <button
                onClick={() => onFinish(meta)} // Enviamos el texto al padre y listo
                disabled={isButtonDisabled}
                className={`mt-4 font-bold text-lg px-8 py-3 w-full rounded-xl shadow-lg transition-all transform disabled:cursor-not-allowed ${isButtonDisabled ? 'bg-zinc-300 text-zinc-500' : 'bg-amber-500 text-white hover:bg-amber-600 hover:scale-105'}`}
            >
                Siguiente
            </button>
        </motion.div>
    );
};