import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const formatTiempo = (ms) => {
    if (ms <= 0) return "";
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
    const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
};

// --- WIDGET DE METAS (REDiseñado según tu visión) ---
const MetasWidget = ({ registro, proximaMeta }) => {
    return (
        // El Link ahora tiene una clase para poder quitarle los estilos de enlace.
        <Link to="/metas" className="meta-link-wrapper">
            <div className="meta-post-it post-it-base">
                {/* La meta del día ahora es el título principal */}
                <h3 className="meta-principal">{registro.meta_del_dia || 'Define tu meta principal del día.'}</h3>
                
                <div className="mini-metas-widget-container">
                    {!proximaMeta ? (
                        <div className="nube-vacia-widget">
                            <p>+ Define tus mini-metas para construir tu día</p>
                        </div>
                    ) : (
                        <div className="nube-proxima-widget">
                            <span>Próxima mini-meta: {proximaMeta.descripcion} a las {proximaMeta.hora_objetivo}</span>
                        </div>
                    )}
                </div>

                {/* El icono de la diana ahora está posicionado de forma absoluta */}
                <div className="meta-icono-esquina">🎯</div>
            </div>
        </Link>
    );
};

// --- WIDGET DE ESTADO: El post-it del estado del día ---
const EstadoWidget = ({ registro, onEdit }) => {
    const navigate = useNavigate();
    const [fraseDelDia, setFraseDelDia] = useState('...');
    const [tiempoRestante, setTiempoRestante] = useState(0);

    const determinarClima = useCallback((reg) => {
        if (!reg) return '';
        const valores = [reg.mente_estat, reg.emocion_estat, reg.cuerpo_estat];
        const puntaje = valores.reduce((acc, val) => {
            if (val === 'alto') return acc + 1; if (val === 'bajo') return acc - 1; return acc;
        }, 0);
        if (puntaje >= 2) return '☀️'; if (puntaje <= -2) return '🌧️'; return '⛅';
    }, []);

    useEffect(() => {
        if (!registro) return;
        const generarFrase = async () => {
            if (registro.frase_sunny) { setFraseDelDia(registro.frase_sunny); return; }
            setFraseDelDia('Sunny está reflexionando...');
            try {
                const frasePayload = { 
                    registroId: registro.id,
                    mente_estat: registro.mente_estat,
                    emocion_estat: registro.emocion_estat,
                    cuerpo_estat: registro.cuerpo_estat,
                    meta_del_dia: registro.meta_del_dia,
                 };
                const response = await api.generarFraseInteligente(frasePayload);
                setFraseDelDia(response.data.frase);
            } catch (error) {
                console.error("Error al generar la frase de Sunny:", error);
                setFraseDelDia("Hoy, las palabras descansan. Tu acción es el mejor poema.");
            }
        };
        generarFrase();
    }, [registro]);

    useEffect(() => {
        if (!registro?.created_at) return;
        const PERIODO_BLOQUEO = 4 * 60 * 60 * 1000;
        const registroTimestamp = new Date(registro.created_at).getTime();
        const ahora = Date.now();
        const tiempoPasado = ahora - registroTimestamp;
        const restanteInicial = PERIODO_BLOQUEO - tiempoPasado;
        setTiempoRestante(restanteInicial > 0 ? restanteInicial : 0);
        const intervalo = setInterval(() => {
            setTiempoRestante(prev => (prev > 1000 ? prev - 1000 : 0));
        }, 1000);
        return () => clearInterval(intervalo);
    }, [registro?.created_at]);

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

// --- COMPONENTE PRINCIPAL: AHORA SÓLO UN CONTENEDOR ---
export default function RegistroDashboard({ registro, miniMetas, onEdit }) {
    const proximaMeta = miniMetas.find(meta => !meta.completada);

    return (
        <div className="daily-dashboard">
            <MetasWidget 
                registro={registro}
                proximaMeta={proximaMeta}
            />
            <EstadoWidget 
                registro={registro}
                onEdit={onEdit}
            />
        </div>
    );
}
