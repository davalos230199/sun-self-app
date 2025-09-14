import React, { useState, useEffect } from 'react';
import { useDia } from '../contexts/DiaContext';

import RegistroDashboard from '../components/RegistroDashboard';
import RitualFlow from '../components/RitualFlow';
import WelcomeModal from '../components/WelcomeModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
    const {
        isLoading: isContextLoading,
        registroDeHoy,
        setRegistroDeHoy,
        miniMetas,
        fraseDelDia,
        cargarDatosDelDia
    } = useDia();

    const [isVisualLoading, setIsVisualLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisualLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    useEffect(() => {
        const haVistoManifiesto = localStorage.getItem('sunself_manifiesto_visto');
        if (!haVistoManifiesto) {
            setShowWelcomeModal(true);
        }
    }, []);

    const handleEdit = () => {
        setRegistroDeHoy(null);
    };

    const handleRitualFinish = (nuevoRegistro) => {
        setRegistroDeHoy(nuevoRegistro);
        if (cargarDatosDelDia) {
            cargarDatosDelDia();
        }
    };

    if (showWelcomeModal) {
        // Tu lógica completa para el WelcomeModal, ahora presente.
        return (
            <WelcomeModal onAccept={(shouldHide) => {
                if (shouldHide) {
                    localStorage.setItem('sunself_manifiesto_visto', 'true');
                }
                setShowWelcomeModal(false);
            }} />
        );
    }
    
    if (isContextLoading || isVisualLoading) {
        return <LoadingSpinner message="Hoy estoy..." estadoGeneral={registroDeHoy?.estado_general} />;
    }

    return (
        <div className="h-full w-full">
            {registroDeHoy ? (
                <RegistroDashboard
                    registro={registroDeHoy}
                    fraseDelDia={fraseDelDia}
                    miniMetas={miniMetas}
                    onEdit={handleEdit}
                />
            ) : (
                <RitualFlow onFinish={handleRitualFinish} />
            )}
        </div>
    );
}