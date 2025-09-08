import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'; // <-- AÑADE ESTA LÍNEA
import api from '../services/api';

import RegistroDashboard from '../components/RegistroDashboard';
import RegistroForm from '../components/RegistroForm';
import WelcomeModal from '../components/WelcomeModal';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
    const { user } = useOutletContext();
    const [isLoading, setIsLoading] = useState(true);
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    const [fraseDelDia, setFraseDelDia] = useState('');
    const [isLoadingAdicional, setIsLoadingAdicional] = useState(false);
   const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // ... toda tu lógica (cargarDatosDelDia, useEffect, handleEdit) se mantiene exactamente igual ...
    const cargarDatosDelDia = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const registroResponse = await api.getRegistroDeHoy();
            const registro = registroResponse?.data?.registro || null;
            setRegistroDeHoy(registro);

            if (registro) {
                setIsLoadingAdicional(true);
                const [metasResponse, fraseResult] = await Promise.all([
                    api.getMiniMetas(registro.id),
                    registro.frase_sunny 
                        ? Promise.resolve(registro.frase_sunny) 
                        : api.generarFraseInteligente({
                            registroId: registro.id,
                            mente_estat: registro.mente_estat,
                            emocion_estat: registro.emocion_estat,
                            cuerpo_estat: registro.cuerpo_estat,
                            meta_del_dia: registro.meta_del_dia,
                        }).then(res => res.data.frase).catch(() => "Hoy, las palabras descansan.")
                ]);
                
                const metas = metasResponse?.data || [];
                setMiniMetas(metas);
                setFraseDelDia(fraseResult);
                setIsLoadingAdicional(false);
            } else {
                setMiniMetas([]);
                setFraseDelDia('');
            }
        } catch (error) {
            console.error("Error al cargar datos del día:", error);
            setRegistroDeHoy(null);
            setMiniMetas([]);
            setFraseDelDia('');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        const haVistoManifiesto = localStorage.getItem('sunself_manifiesto_visto');
        // Si el usuario NO lo ha visto, entonces y solo entonces, ponemos el estado en 'true'.
        if (!haVistoManifiesto) {
            setShowWelcomeModal(true);
        }
        cargarDatosDelDia();
    }, [cargarDatosDelDia]);

    const handleEdit = () => {
        setRegistroDeHoy(null);
    };

        // CAMBIO 3: La lógica de renderizado ahora es SECUENCIAL
    // Primero, si el modal debe mostrarse, se muestra SOLO el modal.
    if (showWelcomeModal) {
        return (
            <WelcomeModal onAccept={(shouldHide) => {
                if (shouldHide) {
                    localStorage.setItem('sunself_manifiesto_visto', 'true');
                }
                setShowWelcomeModal(false);
            }} />
        );
    }

return (
    <>
        {/*
            AnimatePresence es el componente mágico de Framer Motion.
            Detecta cuando WelcomeModal (su hijo directo) es eliminado del árbol de componentes
            y ejecuta la animación 'exit' que definimos dentro de WelcomeModal antes de quitarlo del DOM.
        */}
        <AnimatePresence>
            {showWelcomeModal && (
                <WelcomeModal
                    onAccept={(shouldHide) => {
                        if (shouldHide) {
                            localStorage.setItem('sunself_manifiesto_visto', 'true');
                        }
                        setShowWelcomeModal(false);
                    }}
                />
            )}
        </AnimatePresence>

        {/* Este es el div principal de tu página.
            Vive en paralelo al modal. No se renderizará nada dentro de él
            hasta que la lógica principal de la página (isLoading, etc.) se complete.
        */}
        <div className="p-2 sm:p-4 h-full w-full flex flex-col bg-zinc-50">
            <PageHeader
                title={registroDeHoy ? "Tu Día" : "¿Cómo estás hoy?"}
                showBackButton={false}
            />
            <main className="mt-4 flex-grow overflow-y-auto">
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
            </main>
        </div>
    </>
);
}