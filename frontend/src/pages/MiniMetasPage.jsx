import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import AddMiniMetaModal from '../components/AddMiniMetaModal';
// Necesitaremos un CSS para esta página
// import './MiniMetasPage.css';

export default function MiniMetasPage() {
    const { user } = useOutletContext();
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const cargarDatos = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const registroResponse = await api.getRegistroDeHoy();
            const registro = registroResponse.data.registro;
            if (registro) {
                setRegistroDeHoy(registro);
                const metasData = await api.getMiniMetas(registro.id, user.id);
                setMiniMetas(metasData || []);
            }
            } catch (error) {
            console.error("Error al cargar datos de la página de metas:", error);
            } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    if (isLoading) { return <div>Cargando...</div>; }
    if (!registroDeHoy) { return <div>Completa tu registro del día.</div>; }

    return (
        <div className="mini-metas-page">
            {isModalOpen && (
                <AddMiniMetaModal
                    registroId={registroDeHoy.id}
                    userId={user.id} 
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={cargarDatos}
                />
            )}

            <header className="metas-header">
                <h1>Tu Cielo de Hoy</h1>
                <div className="metas-progreso">
                    {/* Aquí irá el futuro gráfico de progreso */}
                    <p>Progreso: X%</p>
                </div>
            </header>

            <div className="metas-lista">
                {miniMetas.length > 0 ? (
                    miniMetas.map(meta => (
                        <div key={meta.id} className={`meta-item ${meta.completada ? 'completada' : ''}`}>
                            <p>{meta.descripcion}</p>
                            <span>{meta.hora_objetivo}</span>
                            {!meta.completada && <button>Completar</button>}
                        </div>
                    ))
                ) : (
                    <p>Aún no has definido ninguna meta para hoy. ¡Añade una!</p>
                )}
            </div>
            
            <button className="add-meta-fab" onClick={() => setIsModalOpen(true)}>+</button>
        </div>
    );
}
