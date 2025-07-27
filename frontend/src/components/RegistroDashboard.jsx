import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const formatTiempo = (ms) => {
    if (ms <= 0) return "";
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
    const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
};

const MetasWidget = ({ registro, proximaMeta, isLoading }) => {
    return (
        <Link to="/metas" className="meta-link-wrapper">
            <div className="meta-post-it post-it-base">
                <h3 className="meta-principal">{registro.meta_del_dia || 'Define tu meta principal del día.'}</h3>
                <div className="mini-metas-widget-container">
                    {isLoading ? <p>Cargando metas...</p> : (
                        !proximaMeta ? (
                            <div className="nube-vacia-widget">
                                <p>¡Todas las metas completadas! ✨</p>
                            </div>
                        ) : (
                            <div className="nube-proxima-widget">
                                <span>Próxima: {proximaMeta.descripcion} a las {proximaMeta.hora_objetivo.substring(0, 5)}</span>
                            </div>
                        )
                    )}
                </div>
                <div className="meta-icono-esquina">🎯</div>
            </div>
        </Link>
    );
};

const EstadoWidget = ({ registro, fraseDelDia, tiempoRestante, onEdit }) => {
    const navigate = useNavigate();
    const determinarClima = useCallback((reg) => {
        if (!reg) return '';
        const valores = [reg.mente_estat, reg.emocion_estat, reg.cuerpo_estat];
        const puntaje = valores.reduce((acc, val) => {
            if (val === 'alto') return acc + 1; if (val === 'bajo') return acc - 1; return acc;
        }, 0);
        if (puntaje >= 2) return '☀️'; if (puntaje <= -2) return '🌧️'; return '⛅';
    }, []);

    return (
        <div className="post-it-display post-it-base">
            <div className="post-it-top-bar">
                <div className="timer-display">
                    {tiempoRestante > 0 && `⏳ ${formatTiempo(tiempoRestante)}`}
                </div>
                <button className="edit-button" onClick={onEdit} title="Registrar nuevo estado" disabled={tiempoRestante > 0}>✏️</button>
            </div>
            <h3>Tu estado de hoy</h3>
            <div className="clima-visual">{determinarClima(registro)}</div>
            <p className="frase-del-dia">{fraseDelDia}</p>
            <footer className="post-it-footer">
                <a onClick={() => navigate(`/journal/${registro.id}`)}>Escribir en la hoja de atrás...</a>
            </footer>
        </div>
    );
};

export default function RegistroDashboard({ registro, miniMetas, fraseDelDia, isLoadingAdicional, onEdit }) {
    const [tiempoRestante, setTiempoRestante] = useState(0);
    // --- NUEVO ESTADO PARA LA PRÓXIMA META ---
    const [proximaMeta, setProximaMeta] = useState(null);

    // --- USEEFFECT PARA ACTUALIZAR LA PRÓXIMA META EN TIEMPO REAL ---
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

        actualizarProximaMeta(); // Ejecutar al inicio
        const intervalo = setInterval(actualizarProximaMeta, 60000); // Y luego cada minuto

        return () => clearInterval(intervalo); // Limpieza al desmontar
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
        <div className="daily-dashboard">
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
