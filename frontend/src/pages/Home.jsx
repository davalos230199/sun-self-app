import React, { useState, useEffect } from 'react';
import { useDia } from '../contexts/DiaContext';
import { useHeader } from '../contexts/HeaderContext';
import api from '../services/api';
import { Layers } from 'lucide-react';

import RegistroDashboard from '../components/RegistroDashboard';
import DashboardCajas from '../components/DashboardCajas';
import RitualFlow from '../components/RitualFlow';
import DashboardDemo from '../components/DashboardDemo';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
    const { registroDeHoy, isLoading: isDiaLoading, refrescarDia } = useDia();
    const { setTitle } = useHeader();
    const [view, setView] = useState('loading'); // 'loading', 'dashboard', 'demo', 'ritual'

    // --- [NUEVO ESTADO] ---
    // 'registro' = El viejo dashboard
    // 'cajas' = El nuevo dashboard de 6 cajas
    const [dashboardActivo, setDashboardActivo] = useState('registro'); 
    // ----------------------

    useEffect(() => {
        // Esta lógica decide la *vista* (ritual, demo, dashboard)
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
                        setView('ritual');
                    } else {
                        setView('demo');
                        setTitle("¡Bienvenido a Sun Self!"); // Mantenemos tu lógica de título
                    }
                } catch (error) {
                    console.error("Error verificando historial:", error);
                    setView('ritual');
                }
            }
        };

        determineView();
        
        // Limpieza del título (tu lógica original)
        return () => setTitle(null);
    }, [isDiaLoading, registroDeHoy, setTitle]);

    const handleRitualFinish = async () => {
        setView('loading');
        await refrescarDia();
    };

    // --- [NUEVO] Helper para el Botón de Toggle ---
    const BotonToggleDashboard = () => {
        // Solo mostramos el botón si estamos en la vista 'dashboard'
        if (view !== 'dashboard') return null;

        return (
            <button
                onClick={() => setDashboardActivo(d => (d === 'registro' ? 'cajas' : 'registro'))}
                title="Cambiar vista del Dashboard"
                // Lo ponemos flotante, abajo a la derecha, encima de la navbar (z-50)
                className="fixed bottom-20 right-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg animate-pulse"
            >
                <Layers size={24} />
            </button>
        );
    }

    // --- LÓGICA DE RENDERIZADO (MODIFICADA) ---

    // Usamos una función helper para mantener el return principal limpio
    const renderView = () => {
        switch (view) {
            case 'loading':
                return <LoadingSpinner message="Preparando tu día..." />;
            
            case 'dashboard':
                // --- [NUEVA LÓGICA] ---
                // Revisa el estado 'dashboardActivo' para decidir cuál renderizar
                if (dashboardActivo === 'registro') {
                    return <RegistroDashboard onEdit={() => setView('ritual')} />;
                } else {
                    return <DashboardCajas onEdit={() => setView('ritual')} />;
                }

            case 'demo':
                return <DashboardDemo onStart={() => setView('ritual')} />;

            case 'ritual':
                return <RitualFlow onFinish={handleRitualFinish} />;

            default:
                return <p>Error al determinar el estado.</p>;
        }
    }

    // --- RETURN PRINCIPAL (AHORA INCLUYE EL TOGGLE) ---
    return (
        <>
            {renderView()}
            <BotonToggleDashboard />
        </>
    );
}