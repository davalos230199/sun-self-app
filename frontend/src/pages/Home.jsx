import React, { useState, useEffect } from 'react';
import { useDia } from '../contexts/DiaContext';
import { useHeader } from '../contexts/HeaderContext';
import api from '../services/api';

import RegistroDashboard from '../components/RegistroDashboard';
import RitualFlow from '../components/RitualFlow'; // Lo renombraremos en el futuro si es necesario
import DashboardVacio from '../components/DashboardVacio';
import LoadingSpinner from '../components/LoadingSpinner';
import { Eye } from 'lucide-react';

export default function Home() {
    const { registroDeHoy, isLoading: isDiaLoading, refrescarDia } = useDia();
    const { setTitle } = useHeader();

    const [isFirstTime, setIsFirstTime] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [devShowVacio, setDevShowVacio] = useState(false);
    
    useEffect(() => {
        const checkForFirstTime = async () => {
            // Se ejecuta solo si el día ha cargado y NO hay registro
            if (!isDiaLoading && !registroDeHoy) {
                try {
                    const response = await api.checkRecordsExistence();
                    setIsFirstTime(!response.data.hasRecords); // true si no tiene, false si tiene
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
    
    // Efecto para el título del header
    useEffect(() => {
        if (isFirstTime || devShowVacio) {
            setTitle("¡Bienvenido!");
        }
        return () => setTitle(null);
    }, [isFirstTime, devShowVacio, setTitle]);

    const handleRitualFinish = async () => {
        setIsSubmitting(true);
        await refrescarDia();
        setIsSubmitting(false);
        setIsFirstTime(false);
    };

    // --- LÓGICA DE RENDERIZADO CORREGIDA Y MÁS ROBUSTA ---

    // Botón de desarrollador
    const DevToggleButton = () => (
        <button 
            onClick={() => setDevShowVacio(prev => !prev)}
            title="Previsualizar Dashboard Vacío"
            className={`fixed bottom-20 right-5 z-50 p-3 rounded-full shadow-lg transition-colors ${devShowVacio ? 'bg-green-500 text-white' : 'bg-slate-700 text-white'}`}
        >
            <Eye size={24} />
        </button>
    );

    // Si el modo DEV está activo, tiene la máxima prioridad
    if (devShowVacio) {
        return (
            <div className="relative h-full w-full">
                <DevToggleButton />
                <DashboardVacio onStart={() => setDevShowVacio(false)} />
            </div>
        );
    }
    
    // Condición de carga principal: esperamos a que DiaContext termine Y a que el chequeo de 'isFirstTime' termine.
    if (isDiaLoading || isSubmitting || isFirstTime === null) {
        return <LoadingSpinner message="Preparando tu día..." />;
    }

    // Ahora que sabemos todo, decidimos qué mostrar
    return (
        <div className="relative h-full w-full">
            <DevToggleButton />
            {registroDeHoy ? (
                <RegistroDashboard />
            ) : isFirstTime ? (
                // Si no hay registro y es la primera vez, muestra la bienvenida
                <DashboardVacio onStart={() => setIsFirstTime(false)} />
            ) : (
                // Si no hay registro y NO es la primera vez, muestra el micro-hábito
                <RitualFlow onFinish={handleRitualFinish} />
            )}
        </div>
    );
}