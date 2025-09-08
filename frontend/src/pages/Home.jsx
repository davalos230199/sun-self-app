// frontend/src/pages/Home.jsx

import { useOutletContext } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import RegistroDashboard from '../components/RegistroDashboard';
import RegistroForm from '../components/RegistroForm';
import WelcomeModal from '../components/WelcomeModal';
// Ya no necesitamos PageHeader aquí
import LoadingSpinner from '../components/LoadingSpinner';
import { useEffect, useState } from 'react';

export default function Home() {
    // CAMBIO: Recibimos todo del "cerebro" AppLayout a través del contexto
    const {
        isLoading,
        registroDeHoy,
        setRegistroDeHoy, // <-- Necesario para la función de editar
        miniMetas,
        fraseDelDia,
        isLoadingAdicional,
        cargarDatosDelDia // <-- Necesario para el onSaveSuccess del formulario
    } = useOutletContext();

    // La lógica del WelcomeModal se puede quedar aquí, es específica de Home
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    useEffect(() => {
        const haVistoManifiesto = localStorage.getItem('sunself_manifiesto_visto');
        if (!haVistoManifiesto) {
            setShowWelcomeModal(true);
        }
    }, []);

    // CAMBIO: La función de editar ahora usa el setRegistroDeHoy del padre
    const handleEdit = () => {
        setRegistroDeHoy(null);
    };

    if (showWelcomeModal) {
        return (
            <AnimatePresence>
                <WelcomeModal onAccept={(shouldHide) => {
                    if (shouldHide) {
                        localStorage.setItem('sunself_manifiesto_visto', 'true');
                    }
                    setShowWelcomeModal(false);
                }} />
            </AnimatePresence>
        );
    }
    
    // El renderizado es más simple, ya no incluye PageHeader
    return (
        <div className="h-full w-full">
            {isLoading ? (
                <LoadingSpinner message="Hoy estoy..." />
            ) : registroDeHoy ? (
                <RegistroDashboard
                    registro={registroDeHoy}
                    fraseDelDia={fraseDelDia}
                    miniMetas={miniMetas}
                    isLoadingAdicional={isLoadingAdicional}
                    onEdit={handleEdit}
                />
            ) : (
                <RegistroForm onSaveSuccess={cargarDatosDelDia} />
            )}
        </div>
    );
}