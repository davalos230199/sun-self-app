import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
// api.js ya no es estrictamente necesario para el modo visual, pero lo dejamos por si se reactiva
import api from '../services/api'; 

// Importamos todos los steps que ahora viven en la carpeta /ritual
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

// Renombramos el componente para claridad y ajustamos el prop a onFinish
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
    
    // --- LÓGICA DE PROCESAMIENTO MODIFICADA (SIN LLAMADAS A LA API) ---
    const handleProcessAndSave = async (meta) => {
        setIsProcessing(true);
        setStep(5); // Muestra la pantalla de "Calculando"

        const finalRitualData = { ...ritualData, meta };

        // Simulación del tiempo de procesamiento del backend
        await new Promise(resolve => setTimeout(resolve, 2500)); 

        try {
            // --- BLOQUE DE API DESACTIVADO ---
            /*
            // 1. Guardar el registro inicial (COMENTADO)
            const payload = { ... };
            const savedRecordResponse = await api.saveRegistro(payload);
            const savedRecord = savedRecordResponse.data;

            // 2. Llamar a Sunny (COMENTADO)
            const sunnyPayload = { ... };
            const sunnyResponse = await api.generarFraseInteligente(sunnyPayload);
            const fraseDelDia = sunnyResponse.data.frase;
            */
            // --- FIN DEL BLOQUE DESACTIVADO ---

            // Usamos datos simulados para continuar el flujo visual
            const fraseDelDia = "Este es un modo de prueba. Tu registro no ha sido guardado.";

            // Calculamos el estado general como siempre
            const avg = (parseInt(finalRitualData.mente.estado) + parseInt(finalRitualData.emocion.estado) + parseInt(finalRitualData.cuerpo.estado)) / 3;
            let estadoGeneral = 'nublado';
            if (avg > 66) estadoGeneral = 'soleado';
            if (avg < 33) estadoGeneral = 'lluvioso';

            // Actualizamos el estado para el resumen
            setRitualData(prev => ({ ...prev, estadoGeneral, fraseDelDia, meta }));
            
            setStep(6); // Avanzamos al resumen

        } catch (err) {
            // Este bloque ahora es menos probable que se ejecute, pero lo mantenemos por seguridad
            console.error("Error durante la simulación del ritual:", err);
            setError("Ocurrió un error en la simulación.");
            setStep(1); 
        } finally {
            setIsProcessing(false);
        }
    };

    // La función que se llama al final del todo, ahora conectada a onFinish
    const handleFinishRitual = () => {
        onFinish();
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             {error && <p className="absolute top-5 text-red-500 bg-white p-2 rounded-md">{error}</p>}
            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>
        </div>
    );
};

