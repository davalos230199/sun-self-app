import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
// 1. Importamos el nuevo modal que acabamos de crear
import AddMiniMetaModal from './AddMiniMetaModal';

// Función helper para formatear el tiempo.
const formatTiempo = (ms) => {
    if (ms <= 0) return "";
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
    const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
};

const ProximaMetaWidget = ({ proximaMeta, onCompletar, onNavegar }) => {
    if (!proximaMeta) {
        return (
            <div className="nube-vacia">
                <p>¡Define tus próximas nubes y construye tu día!</p>
                <button onClick={onNavegar} className="add-meta-btn-widget">
                    Añadir Meta
                </button>
            </div>
        );
    }
    return (
        <div className="nube-proxima">
            <div className="nube-header">
                <span>Próxima Meta ☁️</span>
                <span className="nube-hora">{proximaMeta.hora_objetivo}</span>
            </div>
            <p className="nube-descripcion">{proximaMeta.descripcion}</p>
            <button onClick={() => onCompletar(proximaMeta.id)} className="nube-completar-btn">
                ¡Completada!
            </button>
        </div>
    );
};


export default function RegistroDashboard({ registro, onEdit }) {
    const navigate = useNavigate();
    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [fraseDelDia, setFraseDelDia] = useState('Sunny está reflexionando...');
    const [miniMetas, setMiniMetas] = useState([]);
    const [isLoadingMetas, setIsLoadingMetas] = useState(true);
    
    // 2. Añadimos un estado para controlar la visibilidad del modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const determinarClima = useCallback((reg) => {
        if (!reg) return '';
        const valores = [reg.mente_estat, reg.emocion_estat, reg.cuerpo_estat];
        const puntaje = valores.reduce((acc, val) => {
            if (val === 'alto') return acc + 1;
            if (val === 'bajo') return acc - 1;
            return acc;
        }, 0);
        if (puntaje >= 2) return '☀️';
        if (puntaje <= -2) return '🌧️';
        return '⛅';
    }, []);

    const cargarMiniMetas = useCallback(async () => {
        if (!registro) return;
        setIsLoadingMetas(true);
        try {
            const data = await api.getMiniMetas(registro.id);
            setMiniMetas(data || []);
        } catch (error) {
            console.error("Error al cargar las mini-metas:", error);
            setMiniMetas([]);
        } finally {
            setIsLoadingMetas(false);
        }
    }, [registro]);

    useEffect(() => {
        cargarMiniMetas();
    }, [cargarMiniMetas]);

    useEffect(() => {
        if (!registro) return;
        if (registro.frase_sunny) {
            setFraseDelDia(registro.frase_sunny);
            return;
        }
        const generarFrase = async () => {
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
        if (!registro) return;
        const PERIODO_BLOQUEO = 4 * 60 * 60 * 1000;
        const registroTimestamp = new Date(registro.created_at).getTime();
        const ahora = Date.now();
        const tiempoPasado = ahora - registroTimestamp;
        const restanteInicial = PERIODO_BLOQUEO - tiempoPasado;
        setTiempoRestante(restanteInicial > 0 ? restanteInicial : 0);
        const intervalo = setInterval(() => {
            setTiempoRestante(prevTiempo => (prevTiempo > 1000 ? prevTiempo - 1000 : 0));
        }, 1000);
        return () => clearInterval(intervalo);
    }, [registro]);

    const handleCompletarMeta = async (metaId) => {
        try {
            await api.updateMiniMetaStatus(metaId, true);
            cargarMiniMetas();
        } catch (error) {
            console.error("Error al marcar la meta como completada:", error);
        }
    };

    const proximaMeta = miniMetas.find(meta => !meta.completada);

    return (
        <>
            {/* 3. Renderizamos el modal solo si isModalOpen es true */}
            {isModalOpen && (
                <AddMiniMetaModal 
                    registroId={registro.id}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={cargarMiniMetas}
                />
            )}

            <div className="daily-dashboard">
                {registro.meta_del_dia && (
                    <div className="meta-post-it">
                        <div className="meta-header"><h4>Meta del Día</h4><span>🎯</span></div>
                        <p>{registro.meta_del_dia}</p>
                    </div>
                )}

                <div className="mini-metas-widget-container">
                    {isLoadingMetas ? (
                        <p>Buscando tu próxima meta...</p>
                    ) : (
                        <ProximaMetaWidget 
                            proximaMeta={proximaMeta} 
                            onCompletar={handleCompletarMeta}
                            // 4. El botón ahora abre el modal
                            onNavegar={() => setIsModalOpen(true)} 
                        />
                    )}
                </div>

                <div className="post-it-display">
                    <div className="post-it-top-bar">
                        <div className="timer-display">
                            {tiempoRestante > 0 && `⏳ ${formatTiempo(tiempoRestante)}`}
                        </div>
                        <button 
                            className="edit-button" 
                            onClick={onEdit} 
                            title="Registrar nuevo estado" 
                            disabled={tiempoRestante > 0}
                        >
                            ✏️
                        </button>
                    </div>
                    <h3>Tu estado de hoy</h3>
                    <div className="clima-visual">{determinarClima(registro)}</div>
                    <p className="frase-del-dia">{fraseDelDia}</p>
                    <footer className="post-it-footer">
                        <a onClick={() => navigate(`/journal/${registro.id}`)}>Escribir en la hoja de atrás...</a>
                    </footer>
                </div>
            </div>
        </>
    );
}
