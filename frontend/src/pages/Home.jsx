import React, { useState, useEffect } from 'react';
import { useDia } from '../contexts/DiaContext';
import { useHeader } from '../contexts/HeaderContext';
import api from '../services/api';
import { Layers } from 'lucide-react';

import RegistroDashboard from '../components/RegistroDashboard';
import DashboardCajas from '../components/DashboardCajas';
import RitualFlow from '../components/RitualFlow';
import DashboardDemo from '../components/DashboardDemo';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
    const { registroDeHoy, isLoading: isDiaLoading, refrescarDia } = useDia();
    const { setTitle } = useHeader();
    const [view, setView] = useState('loading'); // 'loading', 'dashboard', 'demo', 'ritual'
    const [dashboardActivo, setDashboardActivo] = useState('registro'); 
    // ----------------------

    useEffect(() => {
        // Esta lógica decide la *vista* (ritual, demo, dashboard)
        const determineView = async () => {
            if (isDiaLoading) {
                setView('loading');
                return;
            }

            if (registroDeHoy) {
                setView('dashboard');
            } else {
                try {
                    const response = await api.checkRecordsExistence();
                    if (response.data.hasRecords) {
                        setView('dashboard');
                    } else {
                        setView('demo');
                        setTitle("¡Bienvenido a Sun Self!"); // Mantenemos tu lógica de título
                    }
                } catch (error) {
                    console.error("Error verificando historial:", error);
                    setView('dashboard');
                }
            }
        };

        determineView();
        
        // Limpieza del título (tu lógica original)
        return () => setTitle(null);
    }, [isDiaLoading, registroDeHoy, setTitle]);

    const handleRitualFinish = async () => {
        setView('loading');
        await refrescarDia();
    };

    // --- [NUEVO] Helper para el Botón de Toggle ---
    const BotonToggleDashboard = () => {
        // Solo mostramos el botón si estamos en la vista 'dashboard'
        if (view !== 'dashboard') return null;

        return (
            <button
                onClick={() => setDashboardActivo(d => (d === 'registro' ? 'cajas' : 'registro'))}
                title="Cambiar vista del Dashboard"
                // Lo ponemos flotante, abajo a la derecha, encima de la navbar (z-50)
                className="fixed bottom-20 right-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg animate-pulse"
            >
                <Layers size={24} />
            </button>
        );
    }

    // --- LÓGICA DE RENDERIZADO (MODIFICADA) ---

    // Usamos una función helper para mantener el return principal limpio
    const renderView = () => {
        switch (view) {
            case 'loading':
                return <LoadingSpinner message="Preparando tu día..." />;
            
            case 'dashboard':
                // --- [NUEVA LÓGICA] ---
                // Revisa el estado 'dashboardActivo' para decidir cuál renderizar
                if (dashboardActivo === 'registro') {
                    return <RegistroDashboard onEdit={() => setView('ritual')} />;
                } else {
                    return <DashboardCajas onEdit={() => setView('ritual')} />;
                }

            case 'demo':
                return <DashboardDemo onStart={() => setView('ritual')} />;

            case 'ritual':
                return <RitualFlow onFinish={handleRitualFinish} />;

            default:
                return <p>Error al determinar el estado.</p>;
        }
    }

    // --- RETURN PRINCIPAL (AHORA INCLUYE EL TOGGLE) ---
const renderBaseView = () => {
         switch (view) {
            case 'loading':
                return <LoadingSpinner message="Preparando tu día..." />;
            
            case 'dashboard':
                if (dashboardActivo === 'registro') {
                    return <RegistroDashboard onEdit={() => setView('ritual')} />;
                } else {
                    return <DashboardCajas onEdit={() => setView('ritual')} />;
                }

            case 'demo':
                return <DashboardDemo onStart={() => setView('ritual')} />;

            default:
                 // Si está en 'ritual', la base sigue siendo el dashboard
                 // (o lo que estuviera antes de entrar al ritual).
                 // Asumimos que solo se puede entrar al ritual desde 'dashboard' o 'demo'.
                 // Para simplificar, si 'view' es 'ritual', mostramos el dashboard debajo.
                 // NOTA: Esto requiere que los componentes del dashboard manejen bien el 'registroDeHoy' nulo.
                 if (dashboardActivo === 'registro') {
                    return <RegistroDashboard onEdit={() => setView('ritual')} />;
                 } else {
                    return <DashboardCajas onEdit={() => setView('ritual')} />;
                 }
        }
    }

    return (
        <>
            {/* Esta lógica es un poco más compleja.
                Si estamos en 'ritual', queremos mostrar el dashboard *debajo*.
                Si el ritual es un modal (como parece serlo por el CSS de RitualFlow),
                la lógica anterior de `renderView` es correcta, porque el modal
                se superpone. 
                
                Voy a mantener tu lógica de renderizado original
                asumiendo que RitualFlow es un componente que reemplaza la vista.
                Si RitualFlow es un MODAL, avísame y cambiamos el renderizado.
                
                Revisando RitualFlow... "fixed inset-0 bg-black/50". OK.
                Es un MODAL. 
                
                Entonces la lógica de renderizado de Home debe cambiar.
                No es un switch, es condicional.
            */}
            
            {/* Renderizado Base (Dashboard, Demo o Loading) */}
            {view === 'loading' && <LoadingSpinner message="Preparando tu día..." />}
            
            {view === 'demo' && <DashboardDemo onStart={() => setView('ritual')} />}
            
            {view === 'dashboard' && (
                dashboardActivo === 'registro' 
                ? <RegistroDashboard onEdit={() => setView('ritual')} />
                : <DashboardCajas onEdit={() => setView('ritual')} />
            )}
            
            {/* Botón flotante (solo en dashboard) */}
            <BotonToggleDashboard />

            {/* Modal del Ritual (se muestra *sobre* la vista base si view === 'ritual') */}
            {view === 'ritual' && <RitualFlow onFinish={handleRitualFinish} />}
        </>
    );
}