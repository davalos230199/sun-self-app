import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LottieIcon from '../LottieIcon';
import StateSlider from '../StateSlider';
import bodyRevealAnimation from '../../assets/animations/body-reveal.json';
import bodyLoopAnimation from '../../assets/animations/body-loop.json';

// --- SunTimer Component ---
const SunTimer = ({ duration, onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 100 : prev + (100 / (duration * 10))));
        }, 100);
        return () => clearInterval(interval);
    }, [duration]);

    useEffect(() => {
        if (progress >= 100) {
            onComplete();
        }
    }, [progress, onComplete]);

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-28 h-28">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} className="text-amber-200" fill="currentColor" />
                <circle
                    cx="50" cy="50" r={radius}
                    className="text-amber-400"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-xl text-white drop-shadow">
                {Math.ceil(duration - (duration * progress / 100))}s
            </span>
        </div>
    );
};

// --- Main Component ---
const Step4_Body = ({ onNextStep }) => {
    const [animationPhase, setAnimationPhase] = useState('reveal');
    const [timerFinished, setTimerFinished] = useState(false);
    const [sensation, setSensation] = useState('');
    const [bodyState, setBodyState] = useState(50);

    const handleRevealComplete = () => {
        setAnimationPhase('loop');
    };

    const handleProceed = () => {
        const stepData = {
            cuerpo: {
                estado: bodyState,
                comentario: sensation,
            },
        };
        onNextStep(stepData);
    };

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl p-6 text-center flex flex-col items-center gap-4 w-full max-w-sm border-2 border-amber-300"
        >
            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 -mb-2">Observa tu Cuerpo</h2>
            
            <LottieIcon
                animationData={animationPhase === 'reveal' ? bodyRevealAnimation : bodyLoopAnimation}
                className="w-32 h-32"
                autoplay={true}
                loop={animationPhase === 'loop'}
                onComplete={animationPhase === 'reveal' ? handleRevealComplete : null}
            />
            
            <div className="text-center -mt-4">
                <h3 className="font-['Patrick_Hand'] text-lg text-amber-500">Conecta con tus sensaciones</h3>
                <p className="text-sm text-zinc-600 px-2">Escanea tu cuerpo de pies a cabeza, nota cualquier tensión sin juzgarla.</p>
            </div>
            
            {!timerFinished ? (
                <SunTimer duration={10} onComplete={() => setTimerFinished(true)} />
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center gap-4">
                    <textarea
                        placeholder="Describe una sensación física que notes ahora..."
                        value={sensation}
                        onChange={(e) => setSensation(e.target.value)}
                        rows="2"
                        className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2 text-zinc-700 placeholder:font-['Patrick_Hand'] placeholder:text-zinc-400 placeholder:italic focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />

                    <StateSlider 
                        value={bodyState}
                        onChange={(e) => setBodyState(e.target.value)}
                        gradientClass="bg-gradient-to-r from-zinc-300 to-green-400"
                    />

                    <button
                        onClick={handleProceed}
                        className="mt-2 bg-amber-400 text-white font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg hover:bg-amber-500 transition-colors"
                    >
                        Siguiente
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Step4_Body;

