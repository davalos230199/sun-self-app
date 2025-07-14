// src/pages/MuroDeSoles.jsx

import { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import './MuroDeSoles.css';

// Componente helper para obtener el emoji correcto (sin cambios)
const ClimaEmoji = ({ estado }) => {
    switch (estado) {
        case 'soleado': return '☀️';
        case 'nublado': return '⛅';
        case 'lluvioso': return '🌧️';
        default: return '❔';
    }
};

export default function MuroDeSoles() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // CAMBIO: Nuevo estado para saber qué tarjeta está seleccionada
    const [selectedCardIndex, setSelectedCardIndex] = useState(null);

    useEffect(() => {
        const fetchEstados = async () => {
            try {
                setLoading(true);
                const response = await api.getMuroEstados();
                setRegistros(response.data);
                setError(null);
            } catch (err) {
                console.error("Error al cargar los estados del muro:", err);
                setError("No se pudo cargar el clima de la comunidad. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchEstados();
    }, []);

    // CAMBIO: Nueva función para manejar el clic en una tarjeta
    const handleCardClick = (index, event) => {
        event.stopPropagation(); // Evita que el clic se propague al contenedor principal
        // Si se hace clic en la misma tarjeta, se deselecciona. Si no, se selecciona la nueva.
        setSelectedCardIndex(prevIndex => prevIndex === index ? null : index);
    };

    // CAMBIO: Función para cerrar la burbuja si se hace clic fuera de la grilla
    const handleContainerClick = () => {
        setSelectedCardIndex(null);
    };


    const renderContent = () => {
        if (loading) {
            return <p className="muro-mensaje">Tejiendo los reflejos de la comunidad...</p>;
        }

        if (error) {
            return <p className="muro-mensaje error">{error}</p>;
        }

        if (registros.length === 0) {
            return <p className="muro-mensaje">El muro está en calma. Nadie ha compartido su reflejo hoy.</p>;
        }

        return (
            <div className="muro-grid">
                {registros.map((registro, index) => (
                    // CAMBIO: Añadimos la clase 'selected' dinámicamente y el evento onClick
                    <div 
                        key={index} 
                        className={`muro-card ${selectedCardIndex === index ? 'selected' : ''}`}
                        onClick={(e) => handleCardClick(index, e)}
                    >
                        <div className="muro-emoji-container">
                            <ClimaEmoji estado={registro.estado_general} />
                        </div>
                        
                        {/* CAMBIO: La burbuja solo se renderiza si la tarjeta está seleccionada */}
                        {selectedCardIndex === index && (
                            <div className="muro-frase-burbuja">
                                <p>"{registro.frase_sunny}"</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        // CAMBIO: Añadimos el evento onClick al contenedor principal para cerrar las burbujas
        <div className="muro-container" onClick={handleContainerClick}>
            <PageHeader title="Muro de Soles" />
            {/* CAMBIO: Actualizamos el subtítulo para explicar la nueva interacción */}
            <p className="muro-subtitle">Un mosaico anónimo de los reflejos de hoy. Toca un reflejo para ver su pensamiento.</p>
            {renderContent()}
        </div>
    );
}