// frontend/src/pages/HistorialMetas.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MetaHistorialDia from '../components/MetaHistorialDia'; // El "mueble" (Paso 5)
import LoadingSpinner from '../components/LoadingSpinner';

export default function HistorialMetas() {
    const [dias, setDias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedDiaFecha, setExpandedDiaFecha] = useState(null);

    useEffect(() => {
        const fetchHistorial = async () => {
            setIsLoading(true);
            try {
                // 1. Llamamos a la nueva ruta de la API
                const response = await api.getHistorialMetas();
                
                // 2. El backend ya nos da los datos ordenados y listos
                setDias(response.data || []);
                
            } catch (err) {
                console.error("Error al cargar historial de metas:", err);
                setError("No se pudo cargar el historial.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistorial();
    }, []); // Se ejecuta solo una vez al montar

   // --- ¡AQUÍ LA OTRA PARTE DE LA MAGIA! ---
    // Esta función maneja cuál slide abrir o cerrar
    const handleToggle = (fecha) => {
        setExpandedDiaFecha(prevFecha => {
            // Si hago clic en el que ya estaba abierto, lo cierro (null)
            // Si hago clic en uno nuevo, se convierte en el nuevo abierto
            return prevFecha === fecha ? null : fecha;
        });
    };

    if (isLoading) {
        return <LoadingSpinner message="Buscando en tus archivos..." />;
    }

    if (error) {
        return <p className="text-center text-red-500 italic">{error}</p>;
    }

    if (dias.length === 0) {
        return <p className="text-center text-zinc-500 italic">Aún no hay metas en tu historial.</p>;
    }

    return (
        <div className="flex flex-col h-full">
            {/* El feed de días, con scroll */}
            <div className="flex-grow overflow-y-auto pr-2 -mr-2 pb-4">
                {dias.map(dia => (
                    // Usamos la fecha (que es un timestamp único) como key
                    <MetaHistorialDia 
                    key={dia.fecha} 
                    dia={dia} // --- ¡AQUÍ LA CONEXIÓN! ---
                    isExpanded={expandedDiaFecha === dia.fecha} // ¿Estoy abierto?
                    onToggle={() => handleToggle(dia.fecha)}    // Función para abrirme
                    />
                ))}
            </div>
        </div>
    );
}