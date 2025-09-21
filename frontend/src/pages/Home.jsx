import React, { useState, useEffect } from 'react';
import { useDia } from '../contexts/DiaContext';

import RegistroDashboard from '../components/RegistroDashboard';
import RitualFlow from '../components/RitualFlow';
import WelcomeModal from '../components/WelcomeModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {

    const { registroDeHoy, isLoading, refrescarDia } = useDia();
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        const haVistoManifiesto = localStorage.getItem('sunself_manifiesto_visto');
        if (!haVistoManifiesto) {
            setShowWelcomeModal(false); // Cambiado a false para evitar que se muestre por ahora
        }
    }, []);
    
    const handleRitualFinish = async () => {
        setIsSubmitting(true);
        await refrescarDia();
        setIsSubmitting(false);
    };

    // El modal de bienvenida.
    if (showWelcomeModal) {
        return (
            <WelcomeModal onAccept={() => {
                localStorage.setItem('sunself_manifiesto_visto', 'true');
                setShowWelcomeModal(false);
            }} />
        );
    }
    
    // 3. La condición de carga ahora es mucho más simple y robusta.
    if (isLoading || isSubmitting) {
        return <LoadingSpinner message="Preparando tu día..." />;
    }

    // El return principal ahora depende de una lógica clara.
    return (
        <> 
            {registroDeHoy ? (
                <RegistroDashboard onEdit={() => { console.log('Editar presionado')}} />
            ) : (
                <RitualFlow onFinish={handleRitualFinish} />
            )}
        </>
    );
}