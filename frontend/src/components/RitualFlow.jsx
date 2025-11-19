// Archivo: frontend/src/components/RitualFlow.jsx

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import api from '../services/api'; 
import Step1_Breathing from './ritual/Step1_Breathing';
import Step2_Mind from './ritual/Step2_Mind';
import Step3_Emotion from './ritual/Step3_Emotion';
import Step4_Body from './ritual/Step4_Body';
import Step5_Goal from './ritual/Step5_Goal'; // Correcto
import Step6_Calculating from './ritual/Step6_Calculating'; // Lo renombramos para claridad
import Step7_Summary from './ritual/Step7_Summary';

export default function RitualFlow({ onFinish }) { 
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
const [ritualData, setRitualData] = useState({
        mente: null,
        emocion: null,
        cuerpo: null,
        meta: null,
        // --- ESTADO CORREGIDO ---
        // 'consejos' inicia como null, reemplazando 'fraseDelDia'
        consejos: null, 
        estadoGeneral: null,
    });

    const advanceRitual = (stepData, nextStepOverride = null) => {
        if (stepData) {
            setRitualData(prev => ({ ...prev, ...stepData }));
        }
        setStep(prev => (nextStepOverride !== null ? nextStepOverride : prev + 1));
    };
    
// --- FUNCIÓN 'handleProcessAndSave' CORREGIDA ---
    const handleProcessAndSave = async (metaData) => {
        if (!ritualData.mente || !ritualData.emocion || !ritualData.cuerpo) {
            console.error("Intento de procesar el ritual con datos incompletos.", ritualData);
            setError("Faltan datos de los pasos anteriores. Por favor, reinicia el ritual.");
            return;
        }

        setIsProcessing(true);
        setError('');
        setStep(6); // Mostramos "Calculando..."

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
            // --- LLAMADA ÚNICA ---
            // 'api.saveRegistro' llama a POST /registros
            // El backend (registros.js) hace todo (guarda, llama a IA, actualiza)
            // y nos devuelve el registro YA ACTUALIZADO con los consejos.
            const response = await api.saveRegistro(registroParaEnviar);
            const registroCompleto = response.data; // Este objeto SÍ tiene los consejos

            // --- EL MARTILLAZO ESTÁ AQUÍ ---
            // Leemos los nuevos campos del 'registroCompleto'
            setRitualData(prev => ({
                ...prev,
                ...registroParaEnviar, // Guardamos los inputs (mente, emocion, etc.)
                consejos: {
                    consejo_mente: registroCompleto.consejo_mente,
                    consejo_emocion: registroCompleto.consejo_emocion,
                    consejo_cuerpo: registroCompleto.consejo_cuerpo,
                    frase_aliento: registroCompleto.frase_aliento
                },
                estadoGeneral: registroCompleto.estado_general,
            }));
            
            setStep(7); // Mostramos el Resumen

        } catch (err) {
            console.error("Error al guardar el ritual:", err);
            setError(err.response?.data?.error || "No se pudo guardar tu registro. Por favor, intenta de nuevo.");
            // Mandamos al Step 7 igualmente para mostrar el error o un fallback
            setRitualData(prev => ({ ...prev, ...registroParaEnviar })); // Guardamos al menos lo que tenemos
            setStep(7); 
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
            // CAMBIO AQUI: Pasamos 'ritualData' como prop
            case 5: return <Step5_Goal onFinish={handleProcessAndSave} ritualData={ritualData} />; // onFinish llama a nuestra nueva lógica
            case 6: return <Step6_Calculating />;
            case 7: return <Step7_Summary ritualData={ritualData} onNextStep={onFinish} />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {error && <p className="absolute top-5 text-red-500 bg-white p-2 rounded-md">{error}</p>}
            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>
        </div>
    );
};