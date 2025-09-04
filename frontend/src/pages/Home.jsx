import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';

import RegistroDashboard from '../components/RegistroDashboard';
import RegistroForm from '../components/RegistroForm';
import WelcomeModal from '../components/WelcomeModal';
import PageHeader from '../components/PageHeader';

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
        if (!haVistoManifiesto) {
            setShowWelcomeModal(true);
        }
        cargarDatosDelDia();
    }, [cargarDatosDelDia]);

    const handleEdit = () => {
        setRegistroDeHoy(null);
    };

    // ELIMINAMOS EL if (isLoading) DE AQUÍ

    return (
        // LA ESTRUCTURA PRINCIPAL SIEMPRE SE RENDERIZA
        <div className="p-2 sm:p-4 w-full max-w-lg mx-auto flex flex-col h-full">
            {showWelcomeModal && <WelcomeModal onAccept={() => {
                setShowWelcomeModal(false);
                localStorage.setItem('sunself_manifiesto_visto', 'true');
            }} />}
            
            <PageHeader 
                title={registroDeHoy ? "Tu Día" : "¿Cómo estás hoy?"} 
                showBackButton={false} 
            />

            <main className="mt-4 flex-grow">
                {/* LA CONDICIÓN AHORA ESTÁ AQUÍ DENTRO */}
                {isLoading ? (
                    <p className="text-center text-zinc-500 italic py-10">Preparando tu día...</p>
                ) : registroDeHoy ? (
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
            </main>
        </div>
    );
}