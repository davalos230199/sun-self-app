import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useDia } from '../contexts/DiaContext'; // 1. Ahora el Dashboard obtiene sus propios datos.

// --- Importar animaciones ---
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import { Edit2, BookOpen } from 'lucide-react'; // Iconos para los botones

// --- Sub-componente: ClimaAnimado (Sin cambios, es perfecto) ---
const ClimaAnimado = ({ estadoGeneral }) => {
    const animationMap = {
        soleado: sunLoopAnimation,
        nublado: cloudLoopAnimation,
        lluvioso: rainLoopAnimation,
    };
    const animationData = animationMap[estadoGeneral] || cloudLoopAnimation;
    return (
        <div className="w-24 h-24 mx-auto -my-2">
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
};

// --- Sub-componente: MetasWidget (Simplificado y corregido) ---
const MetasWidget = ({ metas }) => {
    const metasCompletadas = metas.filter(meta => meta.completada).length;
    const totalMetas = metas.length;

    return (
        <Link to="/metas" className="no-underline text-inherit block">
            <div className="card-animada relative flex flex-col bg-green-50 border border-green-200 rounded-2xl p-5 text-center min-h-[160px] justify-center">
                <div className="absolute top-4 left-4 text-2xl">🎯</div>
                <h3 className="font-['Patrick_Hand'] text-2xl text-green-800 mb-2">
                    Tus Metas de Hoy
                </h3>
                <p className="text-green-700">
                    {totalMetas > 0 
                        ? `${metasCompletadas} de ${totalMetas} completadas`
                        : "Aún no has definido metas para hoy."
                    }
                </p>
                <footer className="mt-auto pt-3 border-t border-dashed border-green-200 text-xs text-zinc-500 font-semibold">
                    Toca para ver y editar tus metas...
                </footer>
            </div>
        </Link>
    );
};

// --- Sub-componente: EstadoWidget (Simplificado y corregido) ---
const EstadoWidget = ({ registro, onEdit }) => {
    const navigate = useNavigate();
    // La frase de Sunny ahora viene directamente del objeto registro.
    const fraseDelDia = registro.frase_sunny || "Tu reflexión te espera...";

    return (
        <Link to="/tracking" className="no-underline text-inherit block">
            <div className="card-animada relative flex flex-col border border-amber-200 bg-amber-50 rounded-2xl p-5 text-center min-h-[220px]">
                {/* Botones de acción */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/journal/${registro.id}`); }}
                        title="Escribir en La Hoja de Atrás"
                        className="p-2 rounded-full hover:bg-amber-100 text-zinc-500 hover:text-zinc-800 transition-colors"
                    >
                        <BookOpen size={20} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                        title="Editar registro (nuevo ritual)"
                        className="p-2 rounded-full hover:bg-amber-100 text-zinc-500 hover:text-zinc-800 transition-colors"
                    >
                        <Edit2 size={20} />
                    </button>
                </div>

                {/* Contenido principal */}
                <h3 className="font-['Patrick_Hand'] text-xl text-amber-800">Tu estado de hoy</h3>
                <ClimaAnimado estadoGeneral={registro.estado_general} />
                <p className="flex-grow text-zinc-700 italic text-sm">"{fraseDelDia}"</p>
                <footer className="mt-auto pt-3 border-t border-dashed border-amber-200 text-xs text-zinc-500 font-semibold">
                    Toca para ver tu historial completo...
                </footer>
            </div>
        </Link>
    );
};


// --- Componente Principal (Ahora más limpio) ---
export default function RegistroDashboard({ onEdit }) {
    // 2. Obtiene los datos directamente del contexto. Ya no necesita recibir props complejos.
    const { registroDeHoy, metas } = useDia();

    // El timer de 4 horas se queda, pero ahora es más simple
    // const [tiempoRestante, setTiempoRestante] = useState(0); // Este timer puede ser una mejora futura, lo desactivamos por ahora para simplificar
    
    // Si por alguna razón no hay registro, no renderizamos nada (Home se encargará de mostrar el ritual).
    if (!registroDeHoy) {
        return null; 
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <MetasWidget 
                metas={metas}
            />
            <EstadoWidget 
                registro={registroDeHoy}
                onEdit={onEdit}
            />
        </div>
    );
}