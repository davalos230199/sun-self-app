// Archivo: frontend/src/components/ritual/Step4_Body.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';
import ClimaSlider from './ClimaSlider';
import SunTimer from './SunTimer';
import bodyRevealAnimation from '../../assets/animations/body-reveal.json';
import bodyLoopAnimation from '../../assets/animations/body-loop.json';

const consejosCuerpo = [
    "Acción: Estira la parte de tu cuerpo que se sienta más tensa durante 15 segundos.",
    "Insight: Tu cuerpo se comunica constantemente. Una pequeña molestia es un susurro; no esperes a que grite.",
    "Reflexión: Agradece a tus pies por sostenerte. Un simple pensamiento de gratitud cambia tu energía.",
    "Tip: Bebe un vaso de agua ahora mismo. Es la forma más simple de cuidar tu cuerpo."
];

const Step4_Body = ({ onNextStep }) => {
    const [animationPhase, setAnimationPhase] = useState('reveal');
    const [timerFinished, setTimerFinished] = useState(false);
    const [sensation, setSensation] = useState('');
    const [bodyState, setBodyState] = useState(50);
    const [consejo, setConsejo] = useState('');

    useEffect(() => {
        setConsejo(consejosCuerpo[Math.floor(Math.random() * consejosCuerpo.length)]);
    }, []);

    const handleProceed = () => {
        onNextStep({ cuerpo: { estado: bodyState, comentario: sensation } });
    };

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center gap-4 w-full max-w-sm border-2 border-green-300 min-h-[580px] justify-between"
        >
            <div className="w-full flex flex-col items-center gap-4">
                <h2 className="font-['Patrick_Hand'] text-3xl text-zinc-800">Observa tu Cuerpo</h2>
                <LottieIcon 
                    animationData={animationPhase === 'reveal' ? bodyRevealAnimation : bodyLoopAnimation}
                    className="w-56 h-56 -mt-8"
                    loop={animationPhase === 'loop'}
                    onComplete={() => setAnimationPhase('loop')}
                />
            </div>
            {!timerFinished ? (
                <motion.div 
                    key="anclaje"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center gap-4"
                >
                    <div className="text-center">
                        <h3 className="font-['Patrick_Hand'] text-xl text-green-500">El Método</h3>
                        <p className="text-md text-zinc-600 px-2">Escanea tu cuerpo de pies a cabeza, nota cualquier tensión sin juzgarla.</p>
                    </div>
                    <SunTimer duration={5} onComplete={() => setTimerFinished(true)} />
                </motion.div>
            ) : (
                <motion.div 
                    key="registro"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="w-full flex flex-col items-center gap-4"
                >
                    <p className="text-md text-zinc-600 px-2 italic">"{consejo}"</p>
                    <textarea 
                        placeholder="Describe una sensación física que notes ahora..."
                        value={sensation}
                        onChange={(e) => setSensation(e.target.value)}
                        rows="2" 
                        className="w-full bg-green-50 border border-green-200 rounded-lg p-2 text-zinc-700 placeholder:font['Patrick_Hand'] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-400" 
                    />
                    <ClimaSlider 
                        aspecto="cuerpo"
                        value={bodyState}
                        onChange={(e) => setBodyState(parseInt(e.target.value, 10))}
                    />
                    <button 
                        onClick={handleProceed}
                        className="bg-green-400 text-white font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg hover:bg-green-500 transition-colors"
                    >
                        Siguiente
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Step4_Body;