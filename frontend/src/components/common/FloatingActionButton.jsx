import React from 'react';
import Lottie from 'lottie-react';
import sunLoopAnimation from '../../assets/animations/sun-loop.json';

export default function FloatingActionButton({ onClick, text }) {
    return (
        <button
            onClick={onClick}
            title={text}
            className="absolute bottom-0 left-60 z-40 flex flex-col items-center p-2 rounded-2xl bg-amber-100/80 backdrop-blur-sm shadow-lg border border-amber-200 hover:scale-105 transition-transform"
        >
            <div className="w-14 h-14 -m-2">
                <Lottie animationData={sunLoopAnimation} loop={true} />
            </div>
            <span className="font-['Patrick_Hand'] text-sm text-zinc-700 font-semibold">{text}</span>
        </button>
    );
}