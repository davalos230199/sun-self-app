import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';

import RegistroDashboard from '../components/RegistroDashboard';
import RegistroForm from '../components/RegistroForm';
import WelcomeModal from '../components/WelcomeModal';
import './Home.css';

export default function Home() {
    const { user } = useOutletContext();
    const [isLoading, setIsLoading] = useState(true);
    
    // Todos los datos del día ahora viven aquí, en el componente padre.
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // Esta única función se encarga de buscar TODO lo necesario para la página.
    const cargarDatosDelDia = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            // 1. Buscamos el registro principal.
            const registroResponse = await api.getRegistroDeHoy();
            const registro = registroResponse.data.registro;
            setRegistroDeHoy(registro);

            // 2. Si existe el registro, buscamos sus mini-metas.
            if (registro) {
                const metasData = await api.getMiniMetas(registro.id, user.id);
                setMiniMetas(metasData || []);
            } else {
                // Si no hay registro, nos aseguramos de que las metas estén vacías.
                setMiniMetas([]);
            }

        } catch (error) {
            // Si getRegistroDeHoy falla (ej. 404), es normal. Reseteamos los estados.
            setRegistroDeHoy(null);
            setMiniMetas([]);
            console.log("No se encontró registro para hoy o hubo un error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // El único useEffect que necesitamos para cargar datos.
    useEffect(() => {
        const haVistoManifiesto = localStorage.getItem('sunself_manifiesto_visto');
        if (!haVistoManifiesto) {
            setShowWelcomeModal(true);
        }
        cargarDatosDelDia();
    }, [cargarDatosDelDia]);

    const handleEdit = () => {
        setRegistroDeHoy(null);
    };
    
    if (isLoading) {
        return (
            <div className="home-content loading-state">
                <p>Cargando tu día...</p>
            </div>
        );
    }

    return (
        <div className="home-content">
            {showWelcomeModal && <WelcomeModal onAccept={() => {
                setShowWelcomeModal(false);
                localStorage.setItem('sunself_manifiesto_visto', 'true');
            }} />}
            
            <header className="home-header">
                <span className="greeting">Hola, {user?.nombre || 'viajero'}</span>
                <span className="date-display">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
            </header>

            {registroDeHoy ? (
                // Ahora le pasamos la información ya cocinada a RegistroDashboard.
                <RegistroDashboard 
                    registro={registroDeHoy} 
                    miniMetas={miniMetas}
                    onEdit={handleEdit} 
                />
            ) : (
                // Al guardar, volvemos a cargar TODOS los datos.
                <RegistroForm onSaveSuccess={cargarDatosDelDia} />
            )}
        </div>
    );
}
