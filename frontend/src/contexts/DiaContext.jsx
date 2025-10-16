// contexts/DiaContext.jsx - VERSIÓN SEGURA
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const DiaContext = createContext();

export const DiaProvider = ({ children }) => {
    const { user } = useAuth();
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [metas, setMetas] = useState([]);
    
    // NUEVO: Control para evitar refetch constante
    const lastFetchTime = useRef(0);
    const fetchInProgress = useRef(false);
    
    const refrescarDia = useCallback(async (force = false) => {
        if (!user) {
            setIsLoading(false);
            setRegistroDeHoy(null);
            setMetas([]);
            return;
        }
        
        // NUEVO: Anti-spam protection
        const now = Date.now();
        if (!force && fetchInProgress.current) return;
        if (!force && (now - lastFetchTime.current) < 3000) return; // 3 segundos mínimo
        
        fetchInProgress.current = true;
        lastFetchTime.current = now;
        setIsLoading(true);
        
        try {
            const [registroResponse, metasResponse] = await Promise.all([
                api.getRegistroDeHoy(),
                api.getMetasHoy()
            ]);
            
            setRegistroDeHoy(registroResponse.data?.registro || null);
            setMetas(metasResponse.data || []);
        } catch (error) {
            console.error("Error al cargar el registro del día:", error);
            setRegistroDeHoy(null);
        } finally {
            setIsLoading(false);
            fetchInProgress.current = false;
        }
    }, [user]);
    
    // Solo fetch inicial cuando el usuario cambia
    useEffect(() => {
        if (user) {
            refrescarDia();
        }
    }, [user]); // IMPORTANTE: Solo dependemos de user, no de refrescarDia
    
    return (
        <DiaContext.Provider value={{
            registroDeHoy,
            isLoading,
            refrescarDia,
            setMetas,
            metas,
        }}>
            {children}
        </DiaContext.Provider>
    );
};

export const useDia = () => {
    const context = useContext(DiaContext);
    if (!context) throw new Error('useDia debe ser usado dentro de un DiaProvider');
    return context;
};