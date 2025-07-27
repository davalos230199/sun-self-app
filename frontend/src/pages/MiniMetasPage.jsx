import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import './MinimetasPage.css';

export default function MinimetasPage() {
    const { user } = useOutletContext();
    const [registro, setRegistro] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para el nuevo formulario
    const [newMetaText, setNewMetaText] = useState('');
    const [newMetaTime, setNewMetaTime] = useState('12:00');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const registroRes = await api.getRegistroDeHoy();
            const todayReg = registroRes?.data?.registro;

            if (todayReg) {
                setRegistro(todayReg);
                const metasRes = await api.getMiniMetas(todayReg.id);
                
                // Hacemos la función de ordenación más robusta para manejar valores nulos.
                const sortedMetas = (metasRes?.data || []).sort((a, b) => {
                    if (!a.hora_objetivo) return 1;
                    if (!b.hora_objetivo) return -1;
                    return a.hora_objetivo.localeCompare(b.hora_objetivo);
                });

                setMiniMetas(sortedMetas);
            } else {
                setError('Necesitas un registro diario para definir tus mini-metas.');
            }
        } catch (err) {
            console.error("Error al cargar la página de metas:", err);
            setError('Ocurrió un error al cargar tus metas.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateMeta = async (e) => {
        e.preventDefault();
        if (!newMetaText.trim() || !registro) return;
        try {
            const payload = { 
                descripcion: newMetaText, 
                registro_id: registro.id,
                hora_objetivo: newMetaTime // Incluimos la hora
            };
            await api.createMiniMeta(payload);
            
            // Volvemos a cargar y ordenar todo para mantener la consistencia
            fetchData(); 
            setNewMetaText('');
        } catch (err) {
            console.error("Error al crear mini-meta:", err);
        }
    };

    const handleToggleComplete = async (metaId, currentStatus) => {
        try {
            const response = await api.updateMiniMetaStatus(metaId, !currentStatus);
            // Actualizamos solo el item modificado para una respuesta visual más rápida
            setMiniMetas(prevMetas => 
                prevMetas.map(meta => meta.id === metaId ? response.data : meta)
            );
        } catch (err) {
            console.error("Error al actualizar mini-meta:", err);
        }
    };

    const handleDeleteMeta = async (metaId) => {
        try {
            await api.deleteMiniMeta(metaId);
            setMiniMetas(prevMetas => prevMetas.filter(meta => meta.id !== metaId));
        } catch (err) {
            console.error("Error al borrar mini-meta:", err);
        }
    };

    if (isLoading) {
        return <div className="minimetas-page-container loading">Cargando...</div>;
    }

    if (error) {
        return (
            <div className="minimetas-page-container error-page">
                <p>{error}</p>
                <Link to="/" className="btn-primary">Volver al Inicio</Link>
            </div>
        );
    }

    return (
        <div className="minimetas-page-container">
            <div className="page-background-header">
                <span>Hola, {user?.nombre || 'viajero'}</span>
                <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</span>
            </div>

            <div className="post-it main-goal-post-it">
                <h1 className="main-goal-text">
                    🎯 {registro?.meta_del_dia}
                </h1>
            </div>

            <div className="post-it-container">
                <form onSubmit={handleCreateMeta} className="post-it add-meta-post-it">
                    <div className="form-content">
                        <input 
                            type="time" 
                            value={newMetaTime}
                            onChange={e => setNewMetaTime(e.target.value)}
                            className="time-input"
                        />
                        <input
                            type="text"
                            value={newMetaText}
                            onChange={(e) => setNewMetaText(e.target.value)}
                            placeholder="Describe tu mini-meta..."
                            className="text-input"
                        />
                    </div>
                    <button type="submit" className="clip-button" aria-label="Añadir meta" disabled={!newMetaText.trim()}>
                        📎
                    </button>
                </form>

                <div className="minimetas-list-container">
                    {miniMetas.map(meta => (
                        <div key={meta.id} className={`meta-item-wrapper ${meta.completada ? 'completada' : ''}`}>
                            <div className="meta-item">
                                <div className="meta-time">
                                    {/* Mostramos la hora solo si existe */}
                                    {meta.hora_objetivo ? meta.hora_objetivo.substring(0, 5) : '--:--'}
                                </div>
                                <div className="meta-clickable-area" onClick={() => handleToggleComplete(meta.id, meta.completada)}>
                                    <span className="checkbox-visual">{meta.completada ? '✔' : ''}</span>
                                    <p>{meta.descripcion}</p>
                                </div>
                                <button onClick={() => handleDeleteMeta(meta.id)} className="delete-btn" aria-label="Borrar meta">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             <Link to="/" className="back-home-link">← Volver al Dashboard</Link>
        </div>
    );
}
