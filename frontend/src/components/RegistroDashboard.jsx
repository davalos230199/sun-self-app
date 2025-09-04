import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// --- Helper Functions ---
const formatTiempo = (ms) => {
    if (ms <= 0) return "";
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
    const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
};

const determinarClima = (reg) => {
    if (!reg) return '❔';
    const valores = [reg.mente_estat, reg.emocion_estat, reg.cuerpo_estat];
    const puntaje = valores.reduce((acc, val) => {
        if (val === 'alto') return acc + 1;
        if (val === 'bajo') return acc - 1;
        return acc;
    }, 0);
    if (puntaje >= 2) return '☀️';
    if (puntaje <= -2) return '🌧️';
    return '⛅';
};

// --- Sub-componentes Estilizados ---

const MetasWidget = ({ registro, proximaMeta, isLoading }) => {
    return (
        <Link to="/metas" className="no-underline text-inherit block">
            <div className="relative flex flex-col bg-green-100 border border-green-200 rounded-lg shadow-md p-5 text-center min-h-[180px]">
                <div className="absolute top-4 left-4 text-2xl">🎯</div>
                <h3 className="font-['Patrick_Hand'] text-2xl text-green-800 mt-8 mb-4 break-words">
                    {registro.meta_del_dia || 'Define tu meta principal del día.'}
                </h3>
                <div className="mt-auto pt-3 border-t border-dashed border-green-300 text-sm text-green-700 italic">
                    {isLoading ? <p>Cargando metas...</p> : (
                        !proximaMeta ? (
                            <p>¡Todas las metas completadas! ✨</p>
                        ) : (
                            <span>Próxima: {proximaMeta.descripcion} a las {proximaMeta.hora_objetivo.substring(0, 5)}</span>
                        )
                    )}
                </div>
            </div>
        </Link>
    );
};

const EstadoWidget = ({ registro, fraseDelDia, tiempoRestante, onEdit }) => {
    const navigate = useNavigate();
    
    return (
        <Link to="/tracking" className="no-underline text-inherit block">
            <div className="relative flex flex-col bg-yellow-100 border border-yellow-200 rounded-lg shadow-md p-5 text-center min-h-[180px]">
                {/* Header del post-it con timer y botones */}
                <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                    <div className="text-xs font-semibold text-zinc-500 bg-black/5 px-2 py-1 rounded-full min-w-[70px] text-center">
                        {tiempoRestante > 0 && `⏳ ${formatTiempo(tiempoRestante)}`}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            className="text-xl text-zinc-500 hover:text-zinc-800 transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                            title="Registrar nuevo estado"
                            disabled={tiempoRestante > 0}
                        >✏️</button>
                        <button
                            className="text-xl text-zinc-500 hover:text-zinc-800 transition-colors p-1"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/journal/${registro.id}`); }}
                            title="Escribir en La Hoja de Atrás"
                        >📝</button>
                    </div>
                </div>

                {/* Contenido principal */}
                <h3 className="font-['Patrick_Hand'] text-xl text-yellow-800 mt-8">Tu estado de hoy</h3>
                <div className="text-5xl my-2">{determinarClima(registro)}</div>
                <p className="flex-grow text-zinc-700 italic text-sm">"{fraseDelDia}"</p>
                <footer className="mt-auto pt-3 border-t border-dashed border-yellow-300 text-xs text-zinc-500 font-semibold">
                    Toca para ver tu historial completo...
                </footer>
            </div>
        </Link>
    );
};

// --- Componente Principal ---

export default function RegistroDashboard({ registro, miniMetas, fraseDelDia, isLoadingAdicional, onEdit }) {
    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [proximaMeta, setProximaMeta] = useState(null);

    // ... (Lógica de useEffects se mantiene igual)
    useEffect(() => {
        const actualizarProximaMeta = () => {
            const ahora = new Date();
            const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');
            const metasPendientes = miniMetas
                .filter(meta => !meta.completada && meta.hora_objetivo)
                .sort((a, b) => a.hora_objetivo.localeCompare(b.hora_objetivo));
            const siguiente = metasPendientes.find(meta => meta.hora_objetivo > horaActual) || metasPendientes[0] || null;
            setProximaMeta(siguiente);
        };

        actualizarProximaMeta();
        const intervalo = setInterval(actualizarProximaMeta, 60000);
        return () => clearInterval(intervalo);
    }, [miniMetas]);

    useEffect(() => {
        const createdAt = registro?.created_at;
        if (!createdAt) return;
        const PERIODO_BLOQUEO = 4 * 60 * 60 * 1000;
        const registroTimestamp = new Date(createdAt).getTime();
        const ahora = Date.now();
        const tiempoPasado = ahora - registroTimestamp;
        const restanteInicial = PERIODO_BLOQUEO - tiempoPasado;
        setTiempoRestante(restanteInicial > 0 ? restanteInicial : 0);

        const intervalo = setInterval(() => {
            setTiempoRestante(prevTiempo => (prevTiempo > 1000 ? prevTiempo - 1000 : 0));
        }, 1000);
        return () => clearInterval(intervalo);
    }, [registro?.created_at]);


    return (
        <div className="space-y-6">
            <MetasWidget 
                registro={registro}
                proximaMeta={proximaMeta}
                isLoading={isLoadingAdicional}
            />
            <EstadoWidget 
                registro={registro}
                fraseDelDia={fraseDelDia}
                tiempoRestante={tiempoRestante}
                onEdit={onEdit}
            />
        </div>
    );
}

