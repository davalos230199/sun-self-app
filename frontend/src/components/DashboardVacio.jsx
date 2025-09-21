// frontend/src/components/DashboardVacio.jsx

import React from 'react';
import { TrendingUp, Settings } from 'lucide-react';
import Lottie from 'lottie-react';

// --- Importa las animaciones que necesites, ej: un paisaje ---
import welcomeAnimation from '../assets/animations/sun-night.json'; // Reemplaza con tu animación preferida

// Sub-componente para cada tarjeta explicativa
const InfoCard = ({ icon, title, text }) => (
    <div className="bg-white/50 border border-dashed border-zinc-300 rounded-lg p-3 text-center">
        <div className="flex justify-center items-center gap-2 mb-1">{icon}</div>
        <p className="text-sm font-semibold text-zinc-700">{title}</p>
        <p className="text-xs text-zinc-500 italic">{text}</p>
    </div>
);

export default function DashboardVacio({ onStart }) {
    return (
        <div className="h-full flex flex-col justify-between animate-fade-in p-2">
            
            <div className="space-y-3">
                <InfoCard 
                    icon={<TrendingUp className="text-amber-500" />} 
                    title="Tu Meta Principal" 
                    text="Aquí verás tu norte, la meta principal que definas para el día." 
                />
                <div className="bg-white/50 border border-dashed border-zinc-300 rounded-lg p-3 text-center space-y-2">
                    <p className="text-sm font-semibold text-zinc-700">Tu Estado Diario</p>
                    <p className="text-xs text-zinc-500 italic">Visualizarás tu estado general, una frase personalizada y tus reflexiones del micro-hábito para tu mente, emoción y cuerpo.</p>
                </div>
                 <div className="grid grid-cols-2 gap-3">
                    <InfoCard 
                        icon={<div className="font-['Patrick_Hand'] text-lg">Tablero</div>} 
                        title="Tu Tablero" 
                        text="Un pizarrón para organizar todas las ideas y notas de tu día." 
                    />
                    <InfoCard 
                        icon={<Settings className="text-zinc-500" />} 
                        title="Personalización" 
                        text="Pronto podrás adaptar la experiencia a tus necesidades." 
                    />
                 </div>
            </div>
            
            <button
                onClick={onStart}
                className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-amber-600 transition-colors shadow-lg flex flex-col items-center"
            >
                <span>Comenzar Micro-Hábito</span>
                <span className="text-xs opacity-80">Define tu estado de hoy</span>
            </button>
        </div>
    );
}