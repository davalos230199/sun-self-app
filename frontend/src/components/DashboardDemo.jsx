import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { TrendingUp, Settings } from 'lucide-react';

// --- Animaciones ---
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import brainLoopAnimation from '../assets/animations/brain-loop.json';
import emotionLoopAnimation from '../assets/animations/emotion-loop.json';
import bodyLoopAnimation from '../assets/animations/body-loop.json';
import nightCloudRevealAnimation from '../assets/animations/cloud-night-reveal.json'; // Asumo que tienes un reveal
import nightCloudLoopAnimation from '../assets/animations/cloud-night-loop.json';


// --- WIDGETS DE EXHIBICIÓN ---

const MiniHistorialDemo = () => {
    // Lógica para la secuencia de animación
    const [currentAnimation, setCurrentAnimation] = useState(nightCloudRevealAnimation);
    const [shouldLoop, setShouldLoop] = useState(false);

    const handleRevealComplete = () => {
        setCurrentAnimation(nightCloudLoopAnimation);
        setShouldLoop(true);
    };

    return (
        <div className="absolute top-3 left-3 w-20 h-20 rounded-lg overflow-hidden bg-black/5">
            <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12">
                    <Lottie 
                        animationData={currentAnimation} 
                        loop={shouldLoop}
                        onComplete={handleRevealComplete}
                    />
                </div>
                <p className="text-xs font-semibold text-zinc-500 -mt-2">Ayer</p>
            </div>
        </div>
    );
};

// Usamos los mismos estilos que el widget real
const MetaPrincipalDemo = () => (
    <div className="bg-green-100 border-2 border-amber-400 rounded-2xl p-5 text-center shadow-lg space-y-2">
        <div className="flex justify-center items-center gap-2">
            <h2 className="font-['Patrick_Hand'] text-lg text-amber-800">Tu Meta de Hoy</h2>
            <TrendingUp className="text-amber-800" size={24} />
        </div>
        <h3 className="text-lg uppercase text-green-900 break-words">Aquí puedes ver tu meta principal del día.</h3>
        <div className="text-xs font-semibold italic text-zinc-500 bg-white/50 rounded-full px-2 py-1 inline-block">
            Aquí visualizaras la cantidad de metas completadas que definas en la seccion Metas.
        </div>
    </div>
);

const EstadoWidgetDemo = () => {
    const ComentarioItem = ({ anim, text }) => (
        <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 flex-shrink-0 -ml-1"><Lottie animationData={anim} loop={true} /></div>
            <p className="text-sm font-['Patrick_Hand'] lowercase italic text-zinc-600">"{text}"</p>
        </div>
    );

    return (
        <div className="relative flex flex-col border border-amber-400 bg-amber-100 rounded-2xl p-4 text-center shadow-lg h-full justify-between">
            <MiniHistorialDemo />
            <h3 className="font-['Patrick_Hand'] text-xl text-amber-800">Tu Estado Diario</h3>
            <div className="w-24 h-24 mx-auto -my-2"><Lottie animationData={sunLoopAnimation} loop={true} /></div>
            <p className="flex-grow text-zinc-700 font-['Patrick_Hand'] italic">"Aqui visualizarás tu estado general, una frase personalizada y tus reflexiones del micro-hábito para tu mente, emoción y cuerpo."</p>
            <div className="space-y-2 border-t border-dashed border-amber-300 pt-3 text-left">
                <ComentarioItem anim={brainLoopAnimation} text="Tus palabras para tu mente..." />
                <ComentarioItem anim={emotionLoopAnimation} text="Tus palabras para tu emoción..." />
                <ComentarioItem anim={bodyLoopAnimation} text="Y tus palabras para tu cuerpo." />
            </div>
        </div>
    );
};

// Mismo estilo que el widget real
const DiarioWidgetDemo = () => (
    <Link to="/journal/demo" className="no-underline text-inherit block h-full group">
        <div className="h-full bg-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-slate-600 transition-colors">
            <h3 className="font-['Patrick_Hand'] italic text-lg text-white">Tablero</h3>
            <p className="text-xs font-['Patrick_Hand'] italic text-slate-300">Organiza tus pensamientos.</p>
        </div>
    </Link>
);

// Botón rediseñado para ser más sutil y coherente
const IniciarMicroHabitoWidget = ({ onStart }) => (
    <button 
        onClick={onStart} 
        className="h-full w-full bg-amber-400 text-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-amber-500 transition-colors"
    >
        <h3 className="font-['Patrick_Hand'] text-lg font-bold">Comenzar</h3>
        <p className="text-xs">Tu primer Micro-Hábito</p>
    </button>
);


// --- El Componente Principal de la Demo ---
export default function DashboardDemo({ onStart }) {
    return (
        <div className="h-full grid grid-rows-[auto_1fr_auto] gap-4 animate-fade-in">
            <div><MetaPrincipalDemo /></div>
            <div><EstadoWidgetDemo /></div>
            {/* Fila 3 (Tablero y Llamada a la Acción) */}
            <div className="grid grid-cols-2 gap-4 h-32">
                <div className="col-span-1">
                    <DiarioWidgetDemo />
                </div>
                
                {/* --- AQUÍ ESTÁ LA SOLUCIÓN DE ALINEACIÓN --- */}
                {/* Al hacer que la celda de la grilla sea un contenedor flex, su hijo (el botón) se estirará para ocupar toda la altura */}
                <div className="col-span-1 flex"> 
                    <IniciarMicroHabitoWidget onStart={onStart} />
                </div>
            </div>
        </div>
    );
}