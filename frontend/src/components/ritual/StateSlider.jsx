import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LottieIcon from '../LottieIcon';
import rainLoopAnimation from '../../assets/animations/rain-loop.json';
import cloudLoopAnimation from '../../assets/animations/cloud-loop.json';
import sunLoopAnimation from '../../assets/animations/sun-loop.json';

const StateSlider = ({ value, onChange, gradientClass }) => {
    const getStateAnimation = () => {
        if (value < 33) return { key: 'rain', data: rainLoopAnimation };
        if (value < 67) return { key: 'cloud', data: cloudLoopAnimation };
        return { key: 'sun', data: sunLoopAnimation };
    };

    const currentAnimation = getStateAnimation();

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentAnimation.key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="h-16" // Contenedor de altura fija para evitar saltos de diseño
                >
                    <LottieIcon
                        animationData={currentAnimation.data}
                        className="w-16 h-16"
                        autoplay={true}
                        loop={true}
                    />
                </motion.div>
            </AnimatePresence>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={onChange}
                className={`w-full h-2 ${gradientClass || 'bg-gradient-to-r from-sky-300 to-amber-300'} rounded-lg appearance-none cursor-pointer`}
            />
        </div>
    );
};

export default StateSlider;

