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
        setIsLoading(true);
        try {
            // Primero, necesitamos el registro de hoy para saber a qué vincular las metas
            const registroResponse = await api.getRegistroDeHoy();
            if (registroResponse.data.registro) {
                setRegistroDeHoy(registroResponse.data.registro);
                // Si hay registro, buscamos sus metas
                const metasData = await api.getMiniMetas(registroResponse.data.registro.id);
                setMiniMetas(metasData || []);
            }
        } catch (error) {
            console.error("Error al cargar datos de la página de metas:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    if (isLoading) {
        return <div>Cargando tu cielo de metas...</div>;
    }

    if (!registroDeHoy) {
        return <div>Primero necesitas completar tu registro del día en la página de inicio.</div>;
    }

    return (
        <div className="mini-metas-page">
            {isModalOpen && (
                <AddMiniMetaModal
                    registroId={registroDeHoy.id}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={cargarDatos} // Al guardar, recargamos todo
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
