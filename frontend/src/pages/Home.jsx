import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';

// Componentes refactorizados
import PageHeader from '../components/PageHeader';
import RegistroDashboard from '../components/RegistroDashboard';
import RegistroForm from '../components/RegistroForm';
import WelcomeModal from '../components/WelcomeModal';
// Ya no necesitamos Home.css

export default function Home() {
    const { user } = useOutletContext();
    const [isLoading, setIsLoading] = useState(true);
    
    const [registroDeHoy, setRegistroDeHoy] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    const [fraseDelDia, setFraseDelDia] = useState('');
    
    const [isLoadingAdicional, setIsLoadingAdicional] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // --- Lógica de carga de datos (sin cambios funcionales) ---
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
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500 animate-pulse">Cargando tu día...</p>
            </div>
        );
    }

    return (
        // CAMBIO ESTRUCTURAL: Aplicamos el layout estándar
        <div className="p-2 sm:p-4 h-full w-full flex flex-col">
            {/* Usamos el PageHeader estandarizado */}
            <PageHeader title="Tu Día" showBackButton={false} />
            
            {showWelcomeModal && <WelcomeModal onAccept={() => {
                setShowWelcomeModal(false);
                localStorage.setItem('sunself_manifiesto_visto', 'true');
            }} />}
            
            {/* El contenido principal ahora vive dentro de <main> */}
            <main className="flex-grow overflow-y-auto mt-4">
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
            </main>
        </div>
    );
}

