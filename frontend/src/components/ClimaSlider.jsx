// Archivo: frontend/src/components/ClimaSlider.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LottieIcon from './LottieIcon';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import sunLoopAnimation from '../assets/animations/sun-loop.json';

const aspectoConfig = {
    mente: {
        titulo: 'pensamientos',
        gradiente: 'bg-gradient-to-r from-sky-300 via-slate-300 to-amber-300',
    },
    emocion: {
        titulo: 'emociones',
        gradiente: 'bg-gradient-to-r from-teal-300 via-pink-300 to-orange-300',
    },
    cuerpo: {
        titulo: 'sensaciones físicas',
        gradiente: 'bg-gradient-to-r from-green-300 via-lime-300 to-yellow-300',
    },
};

const ClimaSlider = ({ value, onChange, aspecto = 'mente' }) => {
    const config = aspectoConfig[aspecto];
    const getStateAnimation = () => {
        if (value < 33) return { key: 'rain', data: rainLoopAnimation };
        if (value < 67) return { key: 'cloud', data: cloudLoopAnimation };
        return { key: 'sun', data: sunLoopAnimation };
    };
    const currentAnimation = getStateAnimation();
    
    const sliderRef = React.useRef(null);
    const [sliderWidth, setSliderWidth] = React.useState(0);
    const [thumbPosition, setThumbPosition] = React.useState(0);
    const lottieSize = 64; 

    React.useEffect(() => {
        const updateWidth = () => sliderRef.current && setSliderWidth(sliderRef.current.offsetWidth);
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    React.useEffect(() => {
        const newPosition = (value / 100) * sliderWidth - (lottieSize / 2);
        setThumbPosition(newPosition);
    }, [value, sliderWidth]);

    return (
        <div className="w-full flex flex-col items-center gap-2 mt-4">
            <div ref={sliderRef} className="relative w-full h-16 flex items-center">
                <AnimatePresence>
                     <motion.div
                        key={currentAnimation.key}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.3 }}
                        style={{ left: `${thumbPosition}px` }}
                        className="absolute z-10"
                    >
                        <LottieIcon animationData={currentAnimation.data} className="w-16 h-16" />
                    </motion.div>
                </AnimatePresence>
            </div>
            
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={onChange}
                className={`w-full h-2 ${config.gradiente} rounded-lg appearance-none cursor-pointer`}
            />
            <h3 className="font-['Patrick_Hand'] text-zinc-500 text-sm italic -mt-1">
                Determina el clima de tus {config.titulo}
            </h3>
        </div>
    );
};

export default ClimaSlider;