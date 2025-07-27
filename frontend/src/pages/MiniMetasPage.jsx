import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import './MinimetasPage.css'; // Asegúrate de crear este archivo CSS

export default function MinimetasPage() {
    // --- ESTADOS DEL COMPONENTE ---
    const { user } = useOutletContext(); // Obtenemos el usuario para el saludo
    const [registro, setRegistro] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newMetaText, setNewMetaText] = useState('');

    // --- LÓGICA DE CARGA DE DATOS ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const registroRes = await api.getRegistroDeHoy();
            const todayReg = registroRes?.data?.registro;

            if (todayReg) {
                setRegistro(todayReg);
                const metasRes = await api.getMiniMetas(todayReg.id);
                // La ordenación ya debería venir del backend, pero aseguramos por si acaso.
                const sortedMetas = (metasRes?.data || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                setMiniMetas(sortedMetas);
            } else {
                setError('No has creado un registro para hoy. Ve a la página de inicio para empezar.');
            }
        } catch (err) {
            console.error("Error al cargar la página de metas:", err);
            setError('Ocurrió un error al cargar tus metas. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- MANEJADORES DE EVENTOS (CRUD) ---
    const handleCreateMeta = async (e) => {
        e.preventDefault();
        if (!newMetaText.trim() || !registro) return;
        try {
            const payload = { descripcion: newMetaText, registro_id: registro.id };
            const response = await api.createMiniMeta(payload);
            setMiniMetas([...miniMetas, response.data]);
            setNewMetaText('');
        } catch (err) {
            console.error("Error al crear mini-meta:", err);
        }
    };

    const handleToggleComplete = async (metaId, currentStatus) => {
        try {
            const response = await api.updateMiniMetaStatus(metaId, !currentStatus);
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

    // --- RENDERIZADO DEL COMPONENTE ---
    if (isLoading) {
        return <div className="minimetas-container loading">Cargando tus metas...</div>;
    }

    if (error) {
        return (
            <div className="minimetas-container error-page">
                <p>{error}</p>
                <Link to="/" className="btn-primary">Volver al Inicio</Link>
            </div>
        );
    }

    return (
        <div className="minimetas-container">
            <header className="minimetas-page-header">
                <div className="subheader">
                    <span>Hola, {user?.nombre || 'viajero'}</span>
                    <span>{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h1 className="main-goal">
                    🎯 {registro?.meta_del_dia || "Define tu meta principal"}
                </h1>
            </header>

            <div className="minimetas-content">
                <form onSubmit={handleCreateMeta} className="add-meta-form">
                    <input
                        type="text"
                        value={newMetaText}
                        onChange={(e) => setNewMetaText(e.target.value)}
                        placeholder="Añade una nueva mini-meta..."
                        aria-label="Nueva mini-meta"
                    />
                    <button type="submit" disabled={!newMetaText.trim()}>Añadir</button>
                </form>

                <div className="minimetas-list">
                    {miniMetas.length === 0 ? (
                        <p className="empty-state">¡Añade una mini-meta para empezar a construir tu día!</p>
                    ) : (
                        miniMetas.map(meta => (
                            <div key={meta.id} className={`meta-item ${meta.completada ? 'completada' : ''}`}>
                                <div className="meta-clickable-area" onClick={() => handleToggleComplete(meta.id, meta.completada)}>
                                    <span className="checkbox-visual">{meta.completada ? '✔' : ''}</span>
                                    <p>{meta.descripcion}</p>
                                </div>
                                <button onClick={() => handleDeleteMeta(meta.id)} className="delete-btn" aria-label="Borrar meta">
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

             <div className="back-home-link">
                <Link to="/">← Volver al Dashboard</Link>
            </div>
        </div>
    );
}
