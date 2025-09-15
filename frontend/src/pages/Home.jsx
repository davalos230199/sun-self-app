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
        miniMetas,
        fraseDelDia,
        refrescarDia,
    } = useDia();

    const [isVisualLoading, setIsVisualLoading] = useState(true);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [isFinishingRitual, setIsFinishingRitual] = useState(false);
    
    // --- 1. AÑADIDO: El "interruptor" para mostrar el ritual a demanda ---
    const [mostrandoRitual, setMostrandoRitual] = useState(false);

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
    
    // --- 2. AÑADIDO: La función que activará el interruptor ---
    // Esta función se pasará al botón del lápiz en el Dashboard.
    const iniciarRitual = () => {
        setMostrandoRitual(true);
    };

    const handleRitualFinish = async () => {
        setIsFinishingRitual(true);
        if (refrescarDia) {
            await refrescarDia();
        }
        setMostrandoRitual(false); // Se asegura de apagar el interruptor al terminar.
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
            {/* --- 3. MODIFICADO: La lógica de renderizado ahora considera el interruptor --- */}
            {mostrandoRitual ? (
                // Si el interruptor está encendido, FORZAMOS la vista del ritual.
                <RitualFlow onFinish={handleRitualFinish} />
            ) : registroDeHoy ? (
                // Si el interruptor está apagado Y hay registro, mostramos el Dashboard...
                // ...y le conectamos la función para encender el interruptor.
                <RegistroDashboard
                    registro={registroDeHoy}
                    fraseDelDia={fraseDelDia}
                    miniMetas={miniMetas}
                    onEdit={iniciarRitual} // ¡Conexión establecida!
                />
            ) : (
                // Si el interruptor está apagado Y NO hay registro, es el inicio del día.
                <RitualFlow onFinish={handleRitualFinish} />
            )}
        </div>
    );
}