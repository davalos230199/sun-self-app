// frontend/src/components/SingleRegistroView.jsx
import React from 'react';
import Lottie from 'lottie-react';
import { Link } from 'react-router-dom';
import { Star, Book } from 'lucide-react';

// Importa todas las animaciones necesarias
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import brainLoopAnimation from '../assets/animations/brain-loop.json';
import emotionLoopAnimation from '../assets/animations/emotion-loop.json';
import bodyLoopAnimation from '../assets/animations/body-loop.json';

const AspectoItem = ({ anim, comentario }) => (
    <div className="flex items-center gap-4 py-3 border-b border-zinc-200 last:border-b-0">
        <div className="w-12 h-12 flex-shrink-0">
            <Lottie animationData={anim} loop={true} />
        </div>
        <p className="text-zinc-700 font-['Patrick_Hand'] italic lowercase text-lg break-words">{comentario}</p>
    </div>
);

export default function SingleRegistroView({ registro }) {

    const estadoMap = {
        soleado: { anim: sunLoopAnimation, bg: 'bg-amber-50', border: 'border-amber-200' },
        nublado: { anim: cloudLoopAnimation, bg: 'bg-zinc-100', border: 'border-zinc-200' },
        lluvioso: { anim: rainLoopAnimation, bg: 'bg-blue-50', border: 'border-blue-200' },
    };

    const aspectoMap = {
        mente: { anim: brainLoopAnimation, label: 'Mente' },
        emocion: { anim: emotionLoopAnimation, label: 'Emoción' },
        cuerpo: { anim: bodyLoopAnimation, label: 'Cuerpo' },
    };

    const { anim, bg, border } = estadoMap[registro.estado_general] || estadoMap.nublado;
    const registroHora = new Date(registro.created_at).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className={`h-full overflow-y-auto p-4 space-y-5 ${bg} animate-fade-in`}>
            
            {/* 1. Embellecimiento: Encabezado con hora y estado general */}
            <header className="text-center relative">
                <p className="font-semibold text-zinc-500">{registroHora} hs</p>
                <div className="w-28 h-28 mx-auto">
                    <Lottie animationData={anim} loop={true} />
                </div>
                <p className="font-['Patrick_Hand'] text-2xl text-zinc-800 px-4 -mt-4">
                    "{registro.frase_sunny}"
                </p>
            </header>

            {/* 3. Meta Principal del Día */}
            {registro.metas && (
                 <section className={`p-4 rounded-2xl bg-green-100/70 border-2 ${border} text-center`}>
                     <div className="flex justify-center items-center gap-2 mb-1">
                        <Star className="text-amber-500" size={18} />
                        <h3 className="font-['Patrick_Hand'] text-lg text-amber-800">Tu Norte ese día</h3>
                    </div>
                    <p className="text-xl text-zinc-900 font-semibold break-words">{registro.metas.descripcion}</p>
                </section>
            )}

            {/* 1. Embellecimiento: Cuerpo principal más ordenado */}
            <main className="bg-white/60 p-5 rounded-2xl shadow-sm space-y-2">
                <AspectoItem anim={aspectoMap.mente.anim} comentario={registro.mente_comentario} />
                <AspectoItem anim={aspectoMap.emocion.anim} comentario={registro.emocion_comentario} />
                <AspectoItem anim={aspectoMap.cuerpo.anim} comentario={registro.cuerpo_comentario} />
            </main>

            {/* 2. Integración del Diario (AHORA CORREGIDO) */}
            <section className="bg-white/60 p-5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-['Patrick_Hand'] text-xl text-zinc-800">Diario</h3>
                    <Link 
                        to={`/journal/${registro.id}`}
                        className="flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-800"
                    >
                        <Book size={16} />
                        {/* Ahora comprobamos si existe el objeto 'diario' y su contenido */}
                        {registro.diario && registro.diario.texto ? 'Editar' : 'Escribir'}
                    </Link>
                </div>
                {registro.diario && registro.diario.texto ? (
                    // Asumimos que la columna de texto se llama 'contenido'
                    <p className="text-zinc-700 whitespace-pre-wrap">{registro.diario.texto}</p>
                ) : (
                    <p className="text-zinc-500 italic text-center py-4">No escribiste en tu diario para este registro.</p>
                )}
            </section>
        </div>
    );
}