// frontend/src/contexts/TrackingContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api'; // 1. Importar API
import { useAuth } from './AuthContext'; // 2. Importar useAuth

const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
    const { user } = useAuth(); // 3. Depender del usuario

    // --- ESTADOS ORIGINALES ---
    const [activeStartDate, setActiveStartDate] = useState(new Date());

    // --- NUEVOS ESTADOS CENTRALIZADOS ---
    const [historial, setHistorial] = useState([]);
    const [entradasDiario, setEntradasDiario] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 4. FUNCIÓN DE CARGA
    useEffect(() => {
        const loadAllData = async () => {
            if (user) {
                setIsLoading(true);
                try {
                    // Hacemos las llamadas en paralelo
                    const [historialRes, diarioRes] = await Promise.all([
                        api.getHistorialRegistros(),
                        api.getDiario('mes') // Cargamos el mes por defecto
                    ]);
                    
                    setHistorial(historialRes.data || []);
                    setEntradasDiario(diarioRes.data || []);

                } catch (error) {
                    console.error("Error al cargar datos históricos:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Si no hay usuario, vaciamos los datos
                setHistorial([]);
                setEntradasDiario([]);
                setIsLoading(false);
            }
        };

        loadAllData();
    }, [user?.id]); // Se ejecuta 1 sola vez, cuando el usuario cambia.

    const value = {
        activeStartDate,
        setActiveStartDate,
        
        // --- NUEVOS VALORES ---
        historial,
        entradasDiario,
        isLoadingHistorial: isLoading,
        
        // (Podríamos añadir funciones para recargar si quisiéramos)
        setEntradasDiario, // <-- Le damos al Journal la habilidad de actualizarse
    };

    return (
        <TrackingContext.Provider value={value}>
            {children}
        </TrackingContext.Provider>
    );
};

export const useTracking = () => useContext(TrackingContext);