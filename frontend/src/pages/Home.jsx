import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';

// 1. Importamos los nuevos componentes que vamos a crear.
import RegistroDashboard from '../components/RegistroDashboard';
import RegistroForm from '../components/RegistroForm';
import WelcomeModal from '../components/WelcomeModal';
import './Home.css';

export default function Home() {
    const { user } = useOutletContext();
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    
    // Esta función se encarga de recargar los datos desde la API.
    const cargarRegistroDelDia = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const registroResponse = await api.getRegistroDeHoy();
            setRegistroDeHoy(registroResponse.data.registro);
        } catch (error) {
            // Si el backend devuelve un error (ej. 404 Not Found), es normal.
            // Significa que no hay registro y debemos mostrar el formulario.
            setRegistroDeHoy(null); 
            console.log("No se encontró registro para hoy, se mostrará el formulario.");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Efecto para la carga inicial de datos.
    useEffect(() => {
        const haVistoManifiesto = localStorage.getItem('sunself_manifiesto_visto');
        if (!haVistoManifiesto) {
            setShowWelcomeModal(true);
        }
        cargarRegistroDelDia();
    }, [cargarRegistroDelDia]);

    // Esta función se activará cuando el usuario quiera editar su registro.
    const handleEdit = () => {
        // Al poner el registro en null, forzamos que se renderice el formulario.
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
                // Si tenemos un registro, mostramos el Dashboard.
                <RegistroDashboard registro={registroDeHoy} onEdit={handleEdit} />
            ) : (
                // Si no hay registro, mostramos el Formulario.
                // Le pasamos la función para que pueda refrescar la página de Home tras guardar.
                <RegistroForm onSaveSuccess={cargarRegistroDelDia} />
            )}
        </div>
    );
}
