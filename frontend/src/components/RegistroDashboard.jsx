import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const formatTiempo = (ms) => {         
        if (ms <= 0) return "00:00:00";
        const totalSegundos = Math.floor(ms / 1000);
        const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
        const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
        const segundos = (totalSegundos % 60).toString().padStart(2, '0');
        return `${horas}:${minutos}:${segundos}`; 
};

export default function RegistroDashboard({ registro, onEdit }) {
    const navigate = useNavigate();
    const [tiempoRestante, setTiempoRestante] = useState(0);
    // NUEVO ESTADO: Guardamos la frase de Sunny aquí.
    const [fraseDelDia, setFraseDelDia] = useState('Sunny está reflexionando...');

    const determinarClima = useCallback((registro) => { const valores = [registro.mente_estat, registro.emocion_estat, registro.cuerpo_estat]; const puntaje = valores.reduce((acc, val) => { if (val === 'alto') return acc + 1; if (val === 'bajo') return acc - 1; return acc; }, 0); if (puntaje >= 2) return '☀️'; if (puntaje <= -2) return '🌧️'; return '⛅'; }, []);

    // NUEVO EFECTO: Se encarga de buscar la frase de Sunny.
    useEffect(() => {
        // Si el registro ya tiene una frase (de una carga anterior), la usamos.
        if (registro.frase_sunny) {
            setFraseDelDia(registro.frase_sunny);
            return;
        }

        // Si no, la pedimos al backend.
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
    }, [registro]); // Se ejecuta cada vez que el registro cambie.

    // useEffect para el timer (sin cambios)
    useEffect(() => { /* ...lógica del timer sin cambios... */ }, [registro]);

    const edicionBloqueada = tiempoRestante <= 0;

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
                    <div className="timer-display">{formatTiempo(tiempoRestante)}</div>
                    <button className="edit-button" onClick={onEdit} title="Editar estado" disabled={tiempoRestante > 0}>✏️</button>
                </div>
                <h3>Tu estado de hoy</h3>
                <div className="clima-visual">{determinarClima(registro)}</div>
                {/* Mostramos la frase desde nuestro nuevo estado local */}
                <p className="frase-del-dia">{fraseDelDia}</p>
                <footer className="post-it-footer">
                    <a onClick={() => navigate(`/journal/${registro.id}`)}>Escribir en la hoja de atrás...</a>
                </footer>
            </div>
        </div>
    );
}
