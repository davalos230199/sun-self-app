import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../services/api'; 
import Step1_Breathing from './ritual/Step1_Breathing';
import Step2_Mind from './ritual/Step2_Mind';
import Step3_Emotion from './ritual/Step3_Emotion';
import Step4_Body from './ritual/Step4_Body';
import Step5_Goal from './ritual/Step5_Goal'; 
import Step6_Calculating from './ritual/Step6_Calculating'; 
import Step7_Summary from './ritual/Step7_Summary';

// Aceptamos la prop 'mode' ('user' por defecto, o 'anon' para la landing)
export default function RitualFlow({ onFinish, mode = 'user' }) { 
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const [ritualData, setRitualData] = useState({
        mente: null,
        emocion: null,
        cuerpo: null,
        meta: null,
        consejos: null, 
        estadoGeneral: null,
    });

    // Función para la salida de emergencia
    const handleExit = () => {
        // Si estamos en medio de una carga, quizás queramos prevenir, 
        // pero por pragmatismo permitimos salir siempre.
        if (mode === 'anon') {
            // En la Landing, simplemente cerramos el modal o recargamos/vamos al inicio
            // Si onFinish se usa para cerrar el modal en la Landing, lo llamamos.
            if (onFinish) {
                onFinish();
            } else {
                navigate('/');
            }
        } else {
            // En la App, volvemos al Home/Dashboard
            navigate('/home');
        }
    };

    const advanceRitual = (stepData, nextStepOverride = null) => {
        if (stepData) {
            setRitualData(prev => ({ ...prev, ...stepData }));
        }
        setStep(prev => (nextStepOverride !== null ? nextStepOverride : prev + 1));
    };
    
    const handleProcessAndSave = async (metaData) => {
        // Validación: Aseguramos que los pasos anteriores existen
        if (!ritualData.mente || !ritualData.emocion || !ritualData.cuerpo) {
            console.error("Intento de procesar el ritual con datos incompletos.", ritualData);
            setError("Faltan datos de los pasos anteriores. Por favor, reinicia el ritual.");
            return;
        }

        setIsProcessing(true);
        setError('');
        setStep(6); // Mostramos pantalla "Calculando..."

        // Preparamos el objeto plano para enviar al backend
        const registroParaEnviar = {
            mente_estado: ritualData.mente.estado,
            mente_comentario: ritualData.mente.comentario,
            emocion_estado: ritualData.emocion.estado,
            emocion_comentario: ritualData.emocion.comentario,
            cuerpo_estado: ritualData.cuerpo.estado,
            cuerpo_comentario: ritualData.cuerpo.comentario,
            meta_descripcion: metaData,
        };

        try {
            let response;
            
            // --- BIFURCACIÓN CLAVE: ¿Usuario o Anónimo? ---
            if (mode === 'anon') {
                // Ruta Pública (Landing) - No requiere Auth
                response = await api.saveRegistroAnonimo(registroParaEnviar);
            } else {
                // Ruta Privada (App) - Requiere Auth
                response = await api.saveRegistro(registroParaEnviar);
            }

            // En ambos casos, el backend devuelve el registro procesado con la IA en .data
            const registroCompleto = response.data; 

            // Actualizamos el estado local con la respuesta de Sunny (Consejos)
            setRitualData(prev => ({
                ...prev,
                ...registroParaEnviar, // Guardamos los inputs (mente, emocion, etc.)
                consejos: {
                    consejo_mente: registroCompleto.consejo_mente,
                    consejo_emocion: registroCompleto.consejo_emocion,
                    consejo_cuerpo: registroCompleto.consejo_cuerpo,
                    frase_aliento: registroCompleto.frase_aliento
                },
                // En modo anónimo quizás no venga 'estado_general' calculado igual, usamos fallback
                estadoGeneral: registroCompleto.estado_general || 'soleado',
            }));
            
            setStep(7); // Éxito -> Vamos al Resumen

        } catch (err) {
            console.error("Error al guardar el ritual:", err);
            setError(err.response?.data?.error || "No se pudo conectar con Sunny. Por favor, intenta de nuevo.");
            // Mandamos al Step 5 (Meta) para que no pierda lo escrito y pueda reintentar
            setStep(5); 
        } finally {
            setIsProcessing(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1_Breathing onNextStep={() => advanceRitual(null, 2)} />;
            case 2: return <Step2_Mind onNextStep={(data) => advanceRitual(data)} />;
            case 3: return <Step3_Emotion onNextStep={(data) => advanceRitual(data)} />;
            case 4: return <Step4_Body onNextStep={(data) => advanceRitual(data, 5)} />;
            // IMPORTANTE: Pasamos 'mode' al Step 5 para que sepa si usar la sugerencia anónima o normal
            case 5: return <Step5_Goal onFinish={handleProcessAndSave} ritualData={ritualData} mode={mode} />; 
            case 6: return <Step6_Calculating />;
            case 7: return <Step7_Summary ritualData={ritualData} onNextStep={onFinish} />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            
            {/* --- BOTÓN DE SALIDA DE EMERGENCIA (X) --- */}
            <button 
                onClick={handleExit}
                className="absolute top-6 right-6 z-[60] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 shadow-sm"
                title="Salir del Micro-Hábito"
            >
                <X size={24} />
            </button>

            {error && <p className="absolute top-5 text-red-500 bg-white p-2 rounded-md shadow-lg z-50 font-medium">{error}</p>}
            
            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>
        </div>
    );
};