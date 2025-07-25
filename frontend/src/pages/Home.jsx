import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';

import RegistroDashboard from '../components/RegistroDashboard';
import RegistroForm from '../components/RegistroForm';
import WelcomeModal from '../components/WelcomeModal';
import './Home.css';

export default function Home() {
    const { user } = useOutletContext();
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    
    // Declaramos el estado para las miniMetas aquí, en el componente padre.
    const [miniMetas, setMiniMetas] = useState([]);

    const cargarRegistroDelDia = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const registroResponse = await api.getRegistroDeHoy();
            const registro = registroResponse.data.registro;
            setRegistroDeHoy(registro);

            if (registro) {
                // Le pasamos el user.id a la función de la API.
                const metasData = await api.getMiniMetas(registro.id, user.id);
                setMiniMetas(metasData || []);
            }

        } catch (error) {
            setRegistroDeHoy(null); 
            console.log("No se encontró registro para hoy o hubo un error en la carga:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        const haVistoManifiesto = localStorage.getItem('sunself_manifiesto_visto');
        if (!haVistoManifiesto) {
            setShowWelcomeModal(true);
        }
        cargarRegistroDelDia();
    }, [cargarRegistroDelDia]);

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
                // Le pasamos el estado 'miniMetas' que ya cargamos.
                <RegistroDashboard 
                    registro={registroDeHoy} 
                    miniMetas={miniMetas}
                    onEdit={handleEdit} 
                />
            ) : (
                <RegistroForm onSaveSuccess={cargarRegistroDelDia} />
            )}
        </div>
    );
}
