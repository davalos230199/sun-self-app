// Archivo: frontend/src/components/SunTimer.jsx

import React, { useState, useEffect } from 'react';

const SunTimer = ({ duration, onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const increment = 100 / (duration * 10);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + increment;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [duration]);

    useEffect(() => {
        if (progress >= 100) {
            const timer = setTimeout(() => onComplete(), 100);
            return () => clearTimeout(timer);
        }
    }, [progress, onComplete]);

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    const timeLeft = Math.ceil(duration - (duration * progress / 100));

    return (
        <div className="relative w-28 h-28">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} className="text-amber-100" fill="currentColor" />
                <circle 
                    cx="50" cy="50" r={radius} 
                    className="text-amber-400" fill="transparent" 
                    stroke="currentColor" strokeWidth="10" 
                    strokeDasharray={circumference} strokeDashoffset={offset} 
                    transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-['Patrick_Hand'] text-2xl text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}>
                {timeLeft > 0 ? `${timeLeft}s` : '¡Listo!'}
            </span>
        </div>
    );
};

export default SunTimer;