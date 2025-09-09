// frontend/src/pages/Home.jsx

import { useOutletContext } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import RegistroDashboard from '../components/RegistroDashboard';
import RegistroForm from '../components/RegistroForm';
import WelcomeModal from '../components/WelcomeModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useEffect, useState } from 'react';

export default function Home() {
    const {
        isLoading,
        registroDeHoy,
        setRegistroDeHoy,
        miniMetas,
        fraseDelDia,
        isLoadingAdicional,
        cargarDatosDelDia
    } = useOutletContext();

    // NUEVO ESTADO: Un estado de carga local para la página Home
    const [isHomeLoading, setIsHomeLoading] = useState(true);

    // NUEVO useEffect: Para controlar la animación de carga al entrar a Home
    useEffect(() => {
        // Simula un retardo de 500ms (medio segundo) para mostrar el spinner
        const timer = setTimeout(() => {
            setIsHomeLoading(false);
        }, 500); // Puedes ajustar este valor si lo deseas

        // Limpia el temporizador si el componente se desmonta
        return () => clearTimeout(timer);
    }, []);

    // La lógica del WelcomeModal se puede quedar aquí, es específica de Home
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
    
    return (
        <div className="h-full w-full">
            {/* CAMBIO: Ahora usamos el estado isHomeLoading para mostrar el spinner */}
            {isLoading || isHomeLoading ? (
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