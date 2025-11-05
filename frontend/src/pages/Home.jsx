import React, { useState, useEffect } from 'react';
import { useDia } from '../contexts/DiaContext';
import { useHeader } from '../contexts/HeaderContext';
// import api from '../services/api'; // <-- 1. YA NO LO NECESITAMOS AQUÍ
import { Layers } from 'lucide-react';

import RegistroDashboard from '../components/RegistroDashboard';
import DashboardCajas from '../components/DashboardCajas';
import RitualFlow from '../components/RitualFlow';
// import DashboardDemo from '../components/DashboardDemo'; // <-- 2. DEMOLIDO
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
    const { registroDeHoy, isLoading: isDiaLoading, refrescarDia } = useDia();
    const { setTitle } = useHeader();
    const [view, setView] = useState('loading'); // 'loading', 'dashboard', 'ritual'
    
    const [dashboardActivo, setDashboardActivo] = useState('cajas'); 
    
    useEffect(() => {
        // --- 3. LÓGICA DE VISTA SIMPLIFICADA ---
        const determineView = () => {
            if (isDiaLoading) {
                setView('loading');
                return;
            }
            // Ya no necesitamos verificar demo, solo ritual o dashboard
            setView('dashboard');
        };
        // --- FIN DE LA DEMOLICIÓN DE LÓGICA ---

        determineView();
        
        // Limpieza del título
        return () => setTitle(null);
    }, [isDiaLoading, registroDeHoy, setTitle]); // (Dejamos registroDeHoy por si acaso, aunque ya no es 100% necesario)

    const handleRitualFinish = async () => {
        setView('loading');
        await refrescarDia();
    };

    // --- Botón de Toggle (Sin cambios) ---
    const BotonToggleDashboard = () => {
        if (view !== 'dashboard') return null;

        return (
            <button
                onClick={() => setDashboardActivo(d => (d === 'registro' ? 'cajas' : 'registro'))}
                title="Cambiar vista del Dashboard"
                className="fixed bottom-20 right-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg animate-pulse"
            >
                <Layers size={24} />
            </button>
        );
    }

    return (
        <>
            {/* Renderizado Base (Dashboard, Demo o Loading) */}
            {view === 'loading' && <LoadingSpinner message="Preparando tu día..." />}
            
            {/* 4. DEMOLIDO */}
            {/* {view === 'demo' && <DashboardDemo onStart={() => setView('ritual')} />} */}
            
            {view === 'dashboard' && (
                dashboardActivo === 'registro' 
                ? <RegistroDashboard onEdit={() => setView('ritual')} />
                : <DashboardCajas onEdit={() => setView('ritual')} />
            )}
            
            <BotonToggleDashboard />

            {view === 'ritual' && <RitualFlow onFinish={handleRitualFinish} />}
        </>
    );
}