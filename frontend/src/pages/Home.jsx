import React, { useState, useEffect } from 'react';
import { useDia } from '../contexts/DiaContext';
import { useHeader } from '../contexts/HeaderContext';
import api from '../services/api';

import RegistroDashboard from '../components/RegistroDashboard';
import RitualFlow from '../components/RitualFlow';
import DashboardDemo from '../components/DashboardDemo';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
    const { registroDeHoy, isLoading: isDiaLoading, refrescarDia } = useDia();
    const { setTitle } = useHeader();

    const [view, setView] = useState('loading'); // 'loading', 'dashboard', 'demo', 'ritual'

    useEffect(() => {
        const determineView = async () => {
            if (isDiaLoading) {
                setView('loading');
                return;
            }

            if (registroDeHoy) {
                setView('dashboard');
            } else {
                try {
                    const response = await api.checkRecordsExistence();
                    if (response.data.hasRecords) {
                        setView('ritual'); // Usuario recurrente, sin registro hoy
                    } else {
                        setView('demo'); // Usuario nuevo
                        setTitle("¡Bienvenido a Sun Self!");
                    }
                } catch (error) {
                    console.error("Error verificando historial:", error);
                    setView('ritual'); // Fallback seguro
                }
            }
        };

        determineView();

        return () => setTitle(null); // Limpieza del título
    }, [isDiaLoading, registroDeHoy, setTitle]);

    const handleRitualFinish = async () => {
        setView('loading'); // Mostramos spinner mientras se refresca
        await refrescarDia();
        // El useEffect se encargará de poner la vista en 'dashboard'
    };

    // --- LÓGICA DE RENDERIZADO BASADA EN EL ESTADO 'view' ---

    switch (view) {
        case 'loading':
            return <LoadingSpinner message="Preparando tu día..." />;
        
        case 'dashboard':
            // onEdit simplemente cambia la vista a 'ritual'
            return <RegistroDashboard onEdit={() => setView('ritual')} />;

        case 'demo':
            return <DashboardDemo onStart={() => setView('ritual')} />;

        case 'ritual':
            return <RitualFlow onFinish={handleRitualFinish} />;

        default:
            return <p>Error al determinar el estado.</p>;
    }
}