import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Función helper para formatear el tiempo.
const formatTiempo = (ms) => {
    // Si no queda tiempo, no es necesario mostrar un contador.
    if (ms <= 0) return "";
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
    const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
};

export default function RegistroDashboard({ registro, onEdit }) {
    const navigate = useNavigate();
    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [fraseDelDia, setFraseDelDia] = useState('Sunny está reflexionando...');

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

    // Efecto para buscar la frase de Sunny.
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

    // Este efecto maneja el contador del tiempo de bloqueo.
    useEffect(() => {
        if (!registro) return;
        
        // El período de bloqueo antes de poder registrar un nuevo estado.
        const PERIODO_BLOQUEO = 4 * 60 * 60 * 1000; // 4 horas
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

    return (
        <div className="daily-dashboard">
            {registro.meta_del_dia && (
                <div className="meta-post-it">
                    <div className="meta-header"><h4>Meta del Día</h4><span>🎯</span></div>
                    <p>{registro.meta_del_dia}</p>
                </div>
            )}
            <div className="post-it-display">
                <div className="post-it-top-bar">
                    <div className="timer-display">
                        {/* --- CORRECCIÓN AQUÍ ---
                            El texto ahora refleja que hay que esperar para el *próximo* registro.
                        */}
                        {tiempoRestante > 0 
                            ? `⏳ ${formatTiempo(tiempoRestante)}`
                            : '¡Ya puedes registrar tu próximo estado!'
                        }
                    </div>
                    {/* --- CORRECCIÓN AQUÍ ---
                        La lógica de 'disabled' está invertida para cumplir el nuevo requisito.
                        El botón se deshabilita MIENTRAS haya tiempo restante.
                    */}
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
    );
}
