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
        estadoGeneral: null,
        fraseDelDia: null,
    });

    const advanceRitual = (stepData, nextStepOverride = null) => {
        if (stepData) {
            setRitualData(prev => ({ ...prev, ...stepData }));
        }
        setStep(prev => (nextStepOverride !== null ? nextStepOverride : prev + 1));
    };
    
    const handleProcessAndSave = async (metaData) => {
        if (!ritualData.mente || !ritualData.emocion || !ritualData.cuerpo) {
            console.error("Intento de procesar el ritual con datos incompletos.", ritualData);
            setError("Faltan datos de los pasos anteriores. Por favor, reinicia el ritual.");
            return;
        }

        setIsProcessing(true);
        setError('');
        setStep(6);

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
            const response = await api.saveRegistro(registroParaEnviar);
            const registroCompleto = response.data;

            setRitualData(prev => ({
                ...prev,
                ...registroParaEnviar,
                fraseDelDia: registroCompleto.frase_sunny,
                estadoGeneral: registroCompleto.estado_general,
            }));
            
            setStep(7);

        } catch (err) {
            console.error("Error al guardar el ritual:", err);
            setError(err.response?.data?.error || "No se pudo guardar tu registro. Por favor, intenta de nuevo.");
            setStep(7); 
        } finally {
            setIsProcessing(false);
        }
    };

    const renderStep = () => {
        // --- 3. CAMBIO DE LÓGICA: Re-numeramos el switch ---
        switch (step) {
            case 1: return <Step1_Breathing onNextStep={() => advanceRitual(null, 2)} />;
            case 2: return <Step2_Mind onNextStep={(data) => advanceRitual(data)} />; // va al 3
            case 3: return <Step3_Emotion onNextStep={(data) => advanceRitual(data)} />; // va al 4
            case 4: return <Step4_Body onNextStep={(data) => advanceRitual(data, 5)} />; // va al 5
            case 5: return <Step5_Goal onFinish={handleProcessAndSave} />; // onFinish lo manda al 6
            case 6: return <Step6_Calculating />; // Pantalla de carga
            case 7: return <Step7_Summary ritualData={ritualData} onNextStep={onFinish} />; // El final
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