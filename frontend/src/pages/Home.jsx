import React, { useState, useEffect } from 'react';
import { useDia } from '../contexts/DiaContext';
import { useHeader } from '../contexts/HeaderContext';
import api from '../services/api';

import RegistroDashboard from '../components/RegistroDashboard';
import RitualFlow from '../components/RitualFlow';
import DashboardDemo from '../components/DashboardDemo'; // Usamos el nuevo DashboardDemo
import LoadingSpinner from '../components/LoadingSpinner';
import { Eye } from 'lucide-react';

export default function Home() {
    const { registroDeHoy, isLoading: isDiaLoading, refrescarDia } = useDia();
    const { setTitle } = useHeader();

    const [isFirstTime, setIsFirstTime] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [devShowDemo, setDevShowDemo] = useState(false); // Cambiado para mayor claridad

    useEffect(() => {
        const checkForFirstTime = async () => {
            if (!isDiaLoading && !registroDeHoy) {
                try {
                    const response = await api.checkRecordsExistence();
                    setIsFirstTime(!response.data.hasRecords);
                } catch (error) {
                    console.error("Error verificando registros:", error);
                    setIsFirstTime(false);
                }
            } else if (registroDeHoy) {
                setIsFirstTime(false);
            }
        };
        checkForFirstTime();
    }, [isDiaLoading, registroDeHoy]);

    useEffect(() => {
        // Si es la primera vez (real) O estamos en modo DEV, muestra el título de bienvenida
        if (isFirstTime || devShowDemo) {
            setTitle("¡Bienvenido a Sun Self!");
        }
        return () => setTitle(null);
    }, [isFirstTime, devShowDemo, setTitle]);

    const handleRitualFinish = async () => {
        setIsSubmitting(true);
        await refrescarDia();
        setIsSubmitting(false);
        setIsFirstTime(false);
    };

    // Botón de desarrollador para previsualizar la demo
    const DevToggleButton = () => (
        <button 
            onClick={() => setDevShowDemo(prev => !prev)}
            title="Previsualizar Dashboard Demo"
            className={`fixed bottom-20 right-5 z-50 p-3 rounded-full shadow-lg transition-colors ${devShowDemo ? 'bg-green-500 text-white' : 'bg-slate-700 text-white'}`}
        >
            <Eye size={24} />
        </button>
    );

    // Condición de carga principal
    if (isDiaLoading || isSubmitting || isFirstTime === null) {
        return <LoadingSpinner message="Preparando tu día..." />;
    }
    
    // --- Lógica de Renderizado Principal ---
    
    // Variable para decidir qué componente principal mostrar
    let content;

    if (registroDeHoy) {
        content = <RegistroDashboard />;
    } else if (isFirstTime) {
        // Si es la primera vez, muestra la DEMO.
        // El botón "Iniciar" simplemente cambiará el estado para mostrar el Ritual.
        content = <DashboardDemo onStart={() => setIsFirstTime(false)} />;
    } else {
        // Si no es la primera vez y no hay registro, muestra el ritual.
        content = <RitualFlow onFinish={handleRitualFinish} />;
    }
    
    // Si estamos en modo DEV, forzamos la vista de la DEMO
    if (devShowDemo) {
        content = <DashboardDemo onStart={() => setDevShowDemo(false)} />;
    }

    return (
        <div className="relative h-full w-full">
            <DevToggleButton />
            {content}
        </div>
    );
}