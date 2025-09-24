// Archivo: frontend/src/contexts/DiaContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const DiaContext = createContext();

export const DiaProvider = ({ children }) => {
    const { user } = useAuth();

    // ESTADOS SIMPLIFICADOS: Solo lo que necesitamos ahora.
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [metas, setMetas] = useState([]);

    const refrescarDia = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            setRegistroDeHoy(null);
            setMetas([]);
            return;
        }

        setIsLoading(true);
        try {
            // ÚNICA LLAMADA A LA API: Simple y directa.
            const [registroResponse, metasResponse] = await Promise.all([
                api.getRegistroDeHoy(),
                api.getMetasHoy()
            ]);

            setRegistroDeHoy(registroResponse.data?.registro || null);
            setMetas(metasResponse.data || []);

        } catch (error) {
            console.error("Error al cargar el registro del día en DiaContext:", error);
            setRegistroDeHoy(null); // Si falla, nos aseguramos de que el estado sea nulo.
        } finally {
            // Pase lo que pase, terminamos de cargar.
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refrescarDia();
    }, [refrescarDia]);

    // El valor compartido ahora es más limpio.
    const value = {
        registroDeHoy,
        isLoading,
        refrescarDia,
        setMetas,
        metas,
    };

    return (
        <DiaContext.Provider value={value}>
            {children}
        </DiaContext.Provider>
    );
};

export const useDia = () => {
    const context = useContext(DiaContext);
    if (context === undefined) {
        throw new Error('useDia debe ser usado dentro de un DiaProvider');
    }
    return context;
};