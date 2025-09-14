// frontend/src/contexts/DiaContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Necesitamos saber quién es el usuario
import api from '../services/api';

const DiaContext = createContext();

export const DiaProvider = ({ children }) => {
    const { user } = useAuth(); // Obtenemos el usuario del contexto de autenticación

    // Todos los estados que antes vivían en AppLayout ahora viven aquí
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    const [fraseDelDia, setFraseDelDia] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // La función de carga completa, ahora dentro del contexto
    const cargarDatosDelDia = useCallback(async () => {
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
                // Si hay registro, buscamos los datos adicionales
                const metasResponse = await api.getMiniMetas(registro.id);
                setMiniMetas(metasResponse?.data || []);
                setFraseDelDia(registro.frase_sunny || "Una frase inspiradora te espera.");
            } else {
                // Si no hay registro, reseteamos los datos
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
    }, [user]); // Depende del usuario, si cambia el usuario, se vuelve a cargar

    useEffect(() => {
        cargarDatosDelDia();
    }, [cargarDatosDelDia]);

    // El valor que proveemos a toda la aplicación
    const value = {
        registroDeHoy,
        setRegistroDeHoy,
        miniMetas,
        fraseDelDia,
        isLoading,
        cargarDatosDelDia
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