// frontend/src/components/DashboardVacio.jsx (Reconstruido)

import React, { useState } from 'react';
import Lottie from 'lottie-react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Brain, Zap, Heart, Shield, Sparkles } from 'lucide-react';

import bookOpenAnimation from '../assets/animations/book-open.json'; 
import InfoSlide from './InfoSlide'; // <-- 1. IMPORTAMOS EL NUEVO LADRILLO

// Extraemos el contenido del informe en un objeto fácil de manejar
const materialDeEstudio = [
    {
        id: 'mental',
        icon: Brain,
        title: "Libera Espacio Mental",
        content: (
            <>
                <p><strong>Mecanismo:</strong> Externalización Cognitiva.</p>
                <p className="mt-1 italic">"Deja de dar vueltas al mismo pensamiento." Al escribirlo, liberas recursos de tu memoria operativa para poder concentrarte.</p>
            </>
        )
    },
    {
        id: 'neuro',
        icon: Zap,
        title: "Pasa de 'Modo Pánico' a 'Modo Control'",
        content: (
            <>
                <p><strong>Mecanismo:</strong> Etiquetado de Afectos (Affect Labeling).</p>
                <p className="mt-1 italic">"Pasa del 'modo pánico' al 'modo control' en 3 minutos." Nombrar una emoción activa tu corteza prefrontal y calma la amígdala.</p>
            </>
        )
    },
    {
        id: 'emocional',
        icon: Heart,
        title: "Tus Pensamientos No Te Definen",
        content: (
            <>
                <p><strong>Mecanismo:</strong> Desfusión Cognitiva (ACT).</p>
                <p className="mt-1 italic">"Aprende a observarlos." Creas una distancia saludable entre vos y tus pensamientos, entendiendo que no sos ellos.</p>
            </>
        )
    },
    {
        id: 'fisico',
        icon: Shield,
        title: "Fortalece Tus Defensas",
        content: (
            <>
                <p><strong>Mecanismo:</strong> Psiconeuroinmunología.</p>
                <p className="mt-1 italic">"Reduce el 'costo oculto' del estrés." Se ha demostrado que escribir reduce el cortisol y mejora la función de los Linfocitos-T.</p>
            </>
        )
    },
    {
        id: 'fisico_energia',
        icon: Sparkles,
        title: "Libera Energía para Sanar",
        content: (
            <>
                <p><strong>Mecanismo:</strong> Teoría de la Inhibición (Pennebaker).</p>
                <p className="mt-1 italic">"Libera la energía de tu cuerpo para sanar más rápido." Dejar de gastar energía en "contener" el estrés permite a tu cuerpo reasignarla a tareas vitales, como la curación física.</p>
            </>
        )
    }
];


export default function DashboardVacio({ onStartRitual }) {
    const { user } = useAuth(); 
    const nombreUsuario = user?.username.split(' ')[0] || 'Sol';

    // Estado para el acordeón (solo uno abierto a la vez)
    const [expandedSlideId, setExpandedSlideId] = useState(null);

    const handleToggle = (id) => {
        setExpandedSlideId(prevId => (prevId === id ? null : id));
    };

    return (
        // Usamos overflow-y-auto para que la página scrollee si el contenido es mucho
        <div className="flex flex-col h-full px-4 pt-16 overflow-y-auto">
            
            {/* --- SECCIÓN 1: El Saludo y el Ritual --- */}
            <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    ¿Cómo estás hoy, {nombreUsuario}?
                </h1>
                
                <div className="w-48 h-48 my-4">
                    <Lottie 
                        animationData={bookOpenAnimation}
                        loop={false} 
                    />
                </div>
                
                <p className="text-lg text-gray-600 mb-8 max-w-md">
                    El primer paso para ser libre es observarte. 
                    Tómate 3 minutos para anclarte en tu presente.
                </p>
                
                <button
                    onClick={onStartRitual}
                    className="flex items-center justify-center gap-2
                               bg-gradient-to-r from-amber-500 to-orange-500 
                               text-white text-lg font-semibold 
                               py-3 px-8 rounded-full shadow-lg
                               transform transition-all duration-300 hover:scale-105"
                >
                    <BookOpen size={20} />
                    Iniciar mi Sol
                </button>
            </div>

            {/* --- SECCIÓN 2: El "Material de Estudio" --- */}
            <div className="w-full max-w-lg mx-auto mt-16 pb-24">
                <h2 className="text-2xl font-['Patrick_Hand'] text-zinc-800 font-semibold mb-4 text-center">
                    El Poder de 3 Minutos de Escritura
                </h2>
                
                {/* Aquí renderizamos el acordeón interactivo */}
                <div className="space-y-3">
                    {materialDeEstudio.map((item) => (
                        <InfoSlide
                            key={item.id}
                            icon={item.icon}
                            title={item.title}
                            isExpanded={expandedSlideId === item.id}
                            onToggle={() => handleToggle(item.id)}
                        >
                            {item.content}
                        </InfoSlide>
                    ))}
                </div>
            </div>

        </div>
    );
}