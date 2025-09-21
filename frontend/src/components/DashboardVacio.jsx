// frontend/src/components/DashboardVacio.jsx
import React from 'react';
import { Star, BookOpen, Settings } from 'lucide-react';

const InfoCard = ({ icon, title, text }) => (
    <div className="bg-white/50 border border-dashed border-zinc-300 rounded-lg p-4 text-center">
        <div className="flex justify-center mb-2">{icon}</div>
        <h3 className="font-['Patrick_Hand'] text-lg text-zinc-800">{title}</h3>
        <p className="text-sm text-zinc-600">{text}</p>
    </div>
);

export default function DashboardVacio({ onStartRitual }) {
    return (
        <div className="h-full flex flex-col justify-between p-4 text-center animate-fade-in">
            <div>
                <h2 className="font-['Patrick_Hand'] text-3xl text-zinc-800">Bienvenido a Sun Self</h2>
                <p className="text-zinc-600 mt-2">Este es tu espacio para la auto-observación diaria.</p>
            </div>

            <div className="space-y-4">
                <InfoCard 
                    icon={<Star className="text-amber-500" />} 
                    title="Tu Norte" 
                    text="Aquí verás la meta principal que definas para tu día." 
                />
                 <InfoCard 
                    icon={<BookOpen className="text-zinc-500" />} 
                    title="Tu Diario" 
                    text="Un lugar para tus pensamientos y reflexiones." 
                />
                 <InfoCard 
                    icon={<Settings className="text-zinc-500" />} 
                    title="Personalización" 
                    text="Pronto podrás adaptar el ritual a tus necesidades." 
                />
            </div>
            
            <button
                onClick={onStartRitual}
                className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-amber-600 transition-colors shadow-lg"
            >
                Comienza tu primer ritual
            </button>
        </div>
    );
}