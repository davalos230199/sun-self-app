import React, { useState, useEffect } from 'react';
import { useDia } from '../contexts/DiaContext';

import RegistroDashboard from '../components/RegistroDashboard';
import RitualFlow from '../components/RitualFlow';
import WelcomeModal from '../components/WelcomeModal';
import LoadingSpinner from '../components/LoadingSpinner';
// Limpieza: Se elimina la importación de V2
// import RegistroDashboardV2 from '../components/RegistroDashboardV2';

export default function Home() {
    const {
        isLoading: isContextLoading,
        registroDeHoy,
        miniMetas,
        fraseDelDia,
        refrescarDia,
    } = useDia();

    const [isVisualLoading, setIsVisualLoading] = useState(true);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    // Limpieza: Se elimina el estado de control de V2
    // const [verDashboardV2, setVerDashboardV2] = useState(false);
    
    const [isFinishingRitual, setIsFinishingRitual] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisualLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const haVistoManifiesto = localStorage.getItem('sunself_manifiesto_visto');
        if (!haVistoManifiesto) {
            setShowWelcomeModal(true);
        }
    }, []);

    const handleRitualFinish = async () => {
        setIsFinishingRitual(true);
        if (refrescarDia) {
            await refrescarDia();
        }
        setIsFinishingRitual(false);
    };

    if (showWelcomeModal) {
        return (
            <WelcomeModal onAccept={() => {
                localStorage.setItem('sunself_manifiesto_visto', 'true');
                setShowWelcomeModal(false);
            }} />
        );
    }
    
    if (isContextLoading || isVisualLoading || isFinishingRitual) {
        return <LoadingSpinner message="Preparando tu día..." estadoGeneral={registroDeHoy?.estado_general} />;
    }

    return (
        <div className="h-full w-full">
            {/* --- Lógica de Renderizado Simplificada --- */}
            {registroDeHoy ? (
                // Si hay registro, SÓLO muestra el Dashboard original
                <RegistroDashboard
                    registro={registroDeHoy}
                    fraseDelDia={fraseDelDia}
                    miniMetas={miniMetas}
                />
            ) : (
                // Si NO hay registro, muestra el Ritual
                <RitualFlow onFinish={handleRitualFinish} />
            )}
        </div>
    );
}