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
    
    // Estados para los datos del día
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    const [fraseDelDia, setFraseDelDia] = useState('');
    
    const [isLoadingAdicional, setIsLoadingAdicional] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    const cargarDatosDelDia = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            // 1. Buscamos el registro principal.
            const registroResponse = await api.getRegistroDeHoy();

            // --- CORRECCIÓN #1: Validar la respuesta antes de usarla ---
            // Nos aseguramos de que la respuesta y su propiedad .data existan.
            const registro = registroResponse?.data?.registro || null;
            setRegistroDeHoy(registro);

            // 2. Si existe el registro, buscamos los datos secundarios.
            if (registro) {
                setIsLoadingAdicional(true);
                
                // --- CORRECCIÓN #2: Corregir el Promise.all ---
                // Ahora solo esperamos 2 resultados, porque solo pasamos 2 promesas.
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
                
                // --- CORRECCIÓN #3: Validar la respuesta de las metas ---
                // La respuesta de Axios contiene los datos en la propiedad .data
                const metas = metasResponse?.data || [];
                setMiniMetas(metas);
                console.log("Mini-metas cargadas desde el backend:", metas); // Log para confirmar

                setFraseDelDia(fraseResult);
                setIsLoadingAdicional(false);
            } else {
                // Si no hay registro, reseteamos los estados secundarios.
                setMiniMetas([]);
                setFraseDelDia('');
            }

        } catch (error) {
            // Este bloque ahora atrapará errores de red o del servidor (ej. 404, 500)
            console.error("Error al cargar datos del día (puede ser normal si no hay registro):", error);
            setRegistroDeHoy(null);
            setMiniMetas([]);
            setFraseDelDia('');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // El useEffect para cargar datos se mantiene igual.
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
                <RegistroDashboard 
                    registro={registroDeHoy} 
                    miniMetas={miniMetas}
                    fraseDelDia={fraseDelDia}
                    isLoadingAdicional={isLoadingAdicional}
                    onEdit={handleEdit} 
                />
            ) : (
                <RegistroForm onSaveSuccess={cargarDatosDelDia} />
            )}
        </div>
    );
}
