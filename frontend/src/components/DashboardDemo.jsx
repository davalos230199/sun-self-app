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
const MicroHabitoButtonDemo = ({ onClick }) => (
    <button
        onClick={onClick}
        title="Comenzar Micro-Hábito"
        className="absolute top-3 right-3 z-10 w-20 h-20 rounded-lg flex flex-col items-center justify-center -mt-0 pt-2 bg-amber-100/80 backdrop-blur-sm shadow-lg border border-amber-200 hover:scale-105 transition-transform"
    >
        <div className="w-12 h-12">
            <Lottie animationData={sunLoopAnimation} loop={true} />
        </div>
        <span className="font-['Patrick_Hand'] text-xs text-zinc-700 font-semibold break-words">Iniciar</span>
    </button>
);

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

const EstadoWidgetDemo = ({ onStart }) => {
    const ComentarioItem = ({ anim, text }) => (
        <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 flex-shrink-0 -ml-1"><Lottie animationData={anim} loop={true} /></div>
            <p className="text-sm font-['Patrick_Hand'] lowercase italic text-zinc-600">"{text}"</p>
        </div>
    );

    return (
        <div className="relative flex flex-col border border-amber-400 bg-amber-100 rounded-2xl p-4 text-center shadow-lg h-full justify-between">
            <MiniHistorialDemo />
            <MicroHabitoButtonDemo onClick={onStart} />
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

export const PersonalizacionWidget = () => (
    <div className="h-full bg-zinc-100 border border-dashed border-zinc-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
        <Settings className="text-zinc-400 mb-2" size={40} />
        <h4 className="font-['Patrick_Hand'] text-lg italic text-zinc-700">Personaliza tu Micro-Habito</h4>
        <p className="text-sm text-zinc-500">(Próximamente)</p>
    </div>
);

// --- El Componente Principal de la Demo ---
export default function DashboardDemo({ onStart }) {
    return (
        <div className="h-full grid grid-rows-[auto_1fr_auto] gap-4 animate-fade-in">
            <div><MetaPrincipalDemo /></div>
            
            {/* 3. Le pasamos la función onStart al EstadoWidgetDemo */}
            <div><EstadoWidgetDemo onStart={onStart} /></div>

            <div className="grid grid-cols-2 gap-4 h-32">
                <div className="col-span-1"><DiarioWidgetDemo /></div>
                <div className="col-span-1"><PersonalizacionWidget /></div>
            </div>
        </div>
    );
}