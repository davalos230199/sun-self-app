import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import api from '../services/api';

// Rutas de importación a la nueva carpeta /ritual
import Step1_Breathing from './ritual/Step1_Breathing';
import Step2_Mind from './ritual/Step2_Mind';
import Step3_Emotion from './ritual/Step3_Emotion';
import Step4_Body from './ritual/Step4_Body';
import Step5_Calculating from './ritual/Step5_Calculating';
import Step6_Summary from './ritual/Step6_Summary';
import Step7_Goal from './ritual/Step7_Goal';

// --- Helper Function ---
const getEstadoCategoria = (valor) => {
    if (valor < 33) return 'bajo';
    if (valor > 66) return 'alto';
    return 'neutral';
};

// --- NUEVA FUNCIÓN CON LÓGICA DE REINTENTOS ---
const getSunnyQuoteWithRetry = async (payload, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await api.generarFraseInteligente(payload);
            return response; // Éxito!
        } catch (error) {
            if (i === retries - 1) {
                // Falla el último intento, se lanza el error.
                throw error;
            }
            // Espera antes de volver a intentar.
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

export default function RegistroForm({ onSaveSuccess }) {
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
    
    const handleProcessAndSave = async (meta) => {
        setIsProcessing(true);
        setStep(5); // Muestra la pantalla de "Calculando"

        const finalRitualData = { ...ritualData, meta };

        try {
            const payload = {
                mente: { seleccion: getEstadoCategoria(finalRitualData.mente.estado), comentario: finalRitualData.mente.comentario },
                emocion: { seleccion: getEstadoCategoria(finalRitualData.emocion.estado), comentario: finalRitualData.emocion.comentario },
                cuerpo: { seleccion: getEstadoCategoria(finalRitualData.cuerpo.estado), comentario: finalRitualData.cuerpo.comentario },
                meta_del_dia: meta,
                compartir_anonimo: false,
            };
            const savedRecordResponse = await api.saveRegistro(payload);
            const savedRecord = savedRecordResponse.data;

            // --- CORRECCIÓN FINAL: El payload de Sunny ahora usa el formato correcto ---
            const sunnyPayload = {
                registroId: savedRecord.id,
                mente: { seleccion: getEstadoCategoria(finalRitualData.mente.estado) },
                emocion: { seleccion: getEstadoCategoria(finalRitualData.emocion.estado) },
                cuerpo: { seleccion: getEstadoCategoria(finalRitualData.cuerpo.estado) },
                meta_del_dia: finalRitualData.meta,
            };
            
            const sunnyResponse = await getSunnyQuoteWithRetry(sunnyPayload);
            const fraseDelDia = sunnyResponse.data.frase;

            const avg = (parseInt(finalRitualData.mente.estado) + parseInt(finalRitualData.emocion.estado) + parseInt(finalRitualData.cuerpo.estado)) / 3;
            let estadoGeneral = 'nublado';
            if (avg > 66) estadoGeneral = 'soleado';
            if (avg < 33) estadoGeneral = 'lluvioso';

            setRitualData(prev => ({ ...prev, estadoGeneral, fraseDelDia, meta }));
            
            setStep(6);

        } catch (err) {
            console.error("Error durante el procesamiento del ritual:", err);
            setError("No se pudo completar el ritual. Inténtalo de nuevo.");
            setStep(1); 
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinishRitual = () => {
        onSaveSuccess(ritualData);
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1_Breathing onNextStep={() => advanceRitual(null, 2)} />;
            case 2: return <Step2_Mind onNextStep={(data) => advanceRitual(data)} />;
            case 3: return <Step3_Emotion onNextStep={(data) => advanceRitual(data)} />;
            case 4: return <Step4_Body onNextStep={(data) => advanceRitual(data, 7)} />;
            case 7: return <Step7_Goal onFinish={handleProcessAndSave} />;
            case 5: return <Step5_Calculating />;
            case 6: return <Step6_Summary ritualData={ritualData} onNextStep={handleFinishRitual} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full items-center justify-center">
            {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
            
            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>
        </div>
    );
};

