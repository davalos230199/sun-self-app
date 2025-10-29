import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Lottie from 'lottie-react'; // <-- REVIVIDO
import { useDia } from '../contexts/DiaContext'; // <-- IMPORTADO DIRECTAMENTE
import api from '../services/api';
import { TrendingUp, Settings, Check, Zap } from 'lucide-react';

// --- Animaciones (REVIVIDAS) ---
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import brainLoopAnimation from '../assets/animations/brain-loop.json';
import emotionLoopAnimation from '../assets/animations/emotion-loop.json';
import bodyLoopAnimation from '../assets/animations/body-loop.json';

// --- COMPONENTES ELIMINADOS (Como antes) ---
// MiniHistorial, MetaPrincipalWidget, MicroHabitoButton (flotante) siguen borrados.

/**
 * El "Lienzo Diario".
 * AHORA: Unifica Estado, Metas, Y los 3 Comentarios.
 */
export const EstadoWidget = ({ registro, metaPrincipal, onEdit }) => {
    const navigate = useNavigate();
    // Accedemos al contexto de Dia para poder *actualizar* las metas
    const { metas, setMetas } = useDia();

    // 1. Calculamos los contadores (usando 'metas' del context)
    const metasDelDia = metas;
    const completadas = metasDelDia?.filter(m => m.completada).length || 0;
    const total = metasDelDia?.length || 0;

    // 2. Encontramos la "Próxima Meta"
    const proximaMeta = metasDelDia?.find(m => !m.completada && m.id !== metaPrincipal?.id);

    // 3. [NUEVA LÓGICA] - El "Tilde" (copiado de MetasPage)
    const handleCompletarMeta = async (metaId) => {
        // Lógica de actualización optimista
        const metasOriginales = [...metas];
        setMetas(prev => prev.map(m => m.id === metaId ? { ...m, completada: true } : m));
        
        try {
            // Llamada a la API (usamos updateMeta, no patch genérico)
            await api.updateMeta(metaId, { completada: true });
        } catch (error) {
            console.error("Error al completar meta", error);
            setMetas(metasOriginales); // Revertir en caso de error
        }
    };

    // 4. [COMPONENTE REVIVIDO] - Para llenar el "vacío"
    const ComentarioItem = ({ anim, text }) => (
        <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 flex-shrink-0 -ml-1">
                <Lottie animationData={anim} loop={true} />
            </div>
            <p className="text-sm font-['Patrick_Hand'] lowercase italic text-zinc-600">"{text}"</p>
        </div>
    );

    return (
        <div className="relative flex flex-col border border-amber-400 bg-amber-100 rounded-2xl p-4 text-center shadow-lg h-full justify-between">
            
            <Link to="/app/tracking" className="no-underline text-inherit flex flex-col items-center justify-center flex-grow pt-10">
                <div className="w-24 h-24 mx-auto -my-2">
                    <Lottie 
                        animationData={
                            registro.estado_general === 'soleado' ? sunLoopAnimation : 
                            registro.estado_general === 'lluvioso' ? rainLoopAnimation : 
                            cloudLoopAnimation
                        } 
                        loop={true} 
                    />
                </div>
                <h3 className="font-['Patrick_Hand'] text-xl text-amber-800 -mb-1">Hoy</h3>
                
                {/* 1. Frase de Sunny */}
                <p className="flex-grow text-zinc-700 font-['Patrick_Hand'] px-4">
                    "{registro.frase_sunny || '...'}"
                </p>
                
                {/* 2. Borde y sección de Metas */}
                <div className="w-full border-t border-dashed border-amber-300 pt-3 text-left">
                    
                    {/* Meta Principal */}
                    {metaPrincipal ? (
                        <div className="text-center mb-3">
                            <h3 className="text-xl uppercase text-green-900 break-words mt-1 -mb-1">{metaPrincipal.descripcion}</h3>
                            <h2 className="font-['Patrick_Hand'] text-base text-amber-800 -mb-1">Tu Meta Principal</h2>
                        </div>
                    ) : (
                        <div className="text-center mb-3">
                            <h3 className="font-['Patrick_Hand'] text-lg text-amber-800">No definiste una meta principal hoy.</h3>
                        </div>
                    )}

                    {/* Próxima Meta (con Tilde funcional) */}
                    {proximaMeta && (
                        <div className="bg-white/60 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-zinc-700">{proximaMeta.descripcion}</span>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    handleCompletarMeta(proximaMeta.id);
                                }} 
                                className="w-8 h-8 flex-shrink-0 rounded-full bg-green-200 border border-green-400 flex items-center justify-center"
                            >
                                <Check size={16} className="text-green-700" />
                            </button>
                        </div>
                    )}
                    
                    {/* Contador de Metas */}
                    {total > 0 && (
                        <p className="text-xs font-semibold text-amber-800 italic bg-white/50 rounded-full mt-3 p-1 text-center">
                            {completadas} de {total} metas completadas
                        </p>
                    )}
                </div>

                {/* 3. [SECCIÓN REVIVIDA] - Los 3 Comentarios */}
                <div className="w-full border-t border-dashed border-amber-300 pt-3 text-left mt-3">
                    <ComentarioItem anim={brainLoopAnimation} text={registro.mente_comentario} />
                    <ComentarioItem anim={emotionLoopAnimation} text={registro.emocion_comentario} />
                    <ComentarioItem anim={bodyLoopAnimation} text={registro.cuerpo_comentario} />
                </div>
                
                <footer className="mt-auto pt-3 border-t border-dashed italic border-amber-200 text-xs text-zinc-500 font-semibold">
                    Toca para acceder a tu calendario
                </footer>
            </Link>      
        </div>
    );
};

export const DiarioWidget = ({ registroId }) => (
    <Link to={`/app/journal/${registroId}`} className="no-underline text-inherit block h-full group">
        <div className="h-full bg-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-slate-600 transition-colors">
            <h3 className="font-['Patrick_Hand'] italic text-lg text-white">Tablero</h3>
            <p className="text-xs font-['Patrick_Hand'] italic text-slate-300">Organiza tu dia.</p>
        </div>
    </Link>
);

/**
 * [COMPONENTE REDISEÑADO]
 * Vuelve el Sol. Vuela el gris.
 */
export const MicroHabitoWidget = ({ onEdit }) => (
    <button onClick={onEdit} className="h-full w-full bg-amber-100 border border-amber-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center group hover:bg-amber-200 transition-colors shadow-lg">
        <div className="w-16 h-16">
            <Lottie animationData={sunLoopAnimation} loop={true} />
        </div>
        <h4 className="font-['Patrick_Hand'] text-lg italic text-amber-800 mt-2">Micro-Hábito</h4>
    </button>
);


// --- COMPONENTE PRINCIPAL REFACTORIZADO ---
export default function RegistroDashboard({ onEdit }) {
    // AHORA importamos 'metas' también, para pasarlo a EstadoWidget
    const { registroDeHoy, metas } = useDia(); 

    if (!registroDeHoy) return null;
    
    const metaPrincipal = registroDeHoy.meta_principal_id
        ? metas.find(meta => meta.id === registroDeHoy.meta_principal_id)
        : null;

    return (
        <div className="h-full grid grid-rows-[1fr_auto] gap-4 animate-fade-in">
            
            {/* 1. El "Lienzo Diario" (ahora pasa 'metas' también) */}
            <div>
                <EstadoWidget 
                    registro={registroDeHoy} 
                    metaPrincipal={metaPrincipal} 
                    // 'metas' ya no se pasa como prop, EstadoWidget lo toma del context
                    onEdit={onEdit} 
                />
            </div>
            
            {/* 2. Los botones inferiores */}
            <div className="grid grid-cols-2 gap-4 h-32">
                <div className="col-span-1"><DiarioWidget registroId={registroDeHoy.id} /></div>
                <div className="col-span-1"><MicroHabitoWidget onEdit={onEdit} /></div>
            </div>
        </div>
    );
}
