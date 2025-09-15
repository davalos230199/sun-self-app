// Archivo: frontend/src/contexts/DiaContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const DiaContext = createContext();

export const DiaProvider = ({ children }) => {
    const { user } = useAuth();

    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    const [fraseDelDia, setFraseDelDia] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const refrescarDia = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {


            const registroResponse = await api.getRegistroDeHoy();
            const registro = registroResponse?.data?.registro || null;
            setRegistroDeHoy(registro);

            if (registro) {
                const metasResponse = await api.getMiniMetas(registro.id);
                setMiniMetas(metasResponse?.data || []);
                setFraseDelDia(registro.frase_sunny || "Una frase inspiradora te espera.");
            } else {
                setMiniMetas([]);
                setFraseDelDia('');
            }
        } catch (error) {
            console.error("Error al cargar datos del día en DiaContext:", error);
            setRegistroDeHoy(null);
            setMiniMetas([]);
            setFraseDelDia('');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refrescarDia();
    }, [refrescarDia]);

    const value = {
        registroDeHoy,
        miniMetas,
        fraseDelDia,
        isLoading,
        refrescarDia,
    };

    return (
        <DiaContext.Provider value={value}>
            {children}
        </DiaContext.Provider>
    );
};

export const useDia = () => {
    return useContext(DiaContext);
};