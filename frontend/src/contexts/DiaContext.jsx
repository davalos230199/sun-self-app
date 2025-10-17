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
    
    // 🎨 1. DEFINIMOS LA PALETA DE COLORES
    const getThemeColors = (estadoGeneral) => {
        switch (estadoGeneral) {
            case 'soleado':
                return {
                    bg: 'bg-gradient-to-b from-yellow-200 via-orange-200 to-amber-300', // Fondo general
                    headerBg: 'bg-amber-100', // Fondo del header
                    headerBorder: 'border-amber-400', // Borde del header
                    activeIcon: 'text-amber-500' // Icono activo en la navbar
                };
            case 'lluvioso':
                return {
                    bg: 'bg-gradient-to-b from-gray-300 via-blue-200 to-blue-300',
                    headerBg: 'bg-blue-100',
                    headerBorder: 'border-blue-400',
                    activeIcon: 'text-blue-500'
                };
            case 'nublado':
            default:
                return {
                    bg: 'bg-gradient-to-b from-gray-200 via-gray-300 to-slate-400',
                    headerBg: 'bg-slate-100',
                    headerBorder: 'border-slate-400',
                    activeIcon: 'text-slate-500'
                };
        }
    };
    // 🎨 2. OBTENEMOS EL TEMA DEL DÍA ACTUAL
    // Si no hay registro, usamos el tema por defecto (nublado)
    const theme = getThemeColors(registroDeHoy?.estado_general);

    return (
        <DiaContext.Provider value={{
            registroDeHoy,
            isLoading,
            refrescarDia,
            setMetas,
            metas,
            theme,
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