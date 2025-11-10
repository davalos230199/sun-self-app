// frontend/src/pages/Filosofia.jsx
// Esta es la nueva "Página de Informe Interactivo", reconstruida en React.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';

// Importamos las animaciones que vamos a usar
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';

// --- NUEVO: Animaciones para la sección "El Hábito" ---
import brainRevealAnimation from '../assets/animations/brain-loop.json';
import goalRevealAnimation from '../assets/animations/goal-loop.json';

// Importamos el Ladrillo InfoSlide y los iconos
import InfoSlide from '../components/InfoSlide.jsx';
import { Brain, Heart, Shield } from 'lucide-react';


// --- Sub-componente: Botón de Estado (con Lottie) ---
const StateButton = ({ lottieData, state, activeState, onSelect, 'aria-label': ariaLabel }) => {
    const isActive = activeState === state;
    let borderColor = 'border-transparent';
    let bgColor = 'bg-white';

    if (isActive) {
        if (state === 'soleado') {
            borderColor = 'border-amber-400';
            bgColor = 'bg-amber-50';
        } else if (state === 'nublado') {
            borderColor = 'border-blue-400';
            bgColor = 'bg-blue-50';
        } else if (state === 'lluvioso') {
            borderColor = 'border-gray-400';
            bgColor = 'bg-gray-100';
        }
    }

    return (
        <motion.button
            className={`p-3 rounded-2xl border-2 ${borderColor} ${bgColor} transition-all duration-200 ease-in-out`}
            onClick={() => onSelect(state)}
            whileHover={{ scale: 1.05 }}
            animate={{ scale: isActive ? 1.05 : 1 }}
            aria-label={ariaLabel}
        >
            <div className="w-16 h-16 pointer-events-none">
                <Lottie animationData={lottieData} loop={true} />
            </div>
        </motion.button>
    );
};

// --- Sub-componente: Descripción del Estado ---
const StateDescription = ({ state, target, text, subtext }) => {
    let bgColor = '';
    let textColor = '';
    let subtextColor = '';

    if (target === 'soleado') {
        bgColor = 'bg-amber-50';
        textColor = 'text-amber-800';
        subtextColor = 'text-amber-700';
    } else if (target === 'nublado') {
        bgColor = 'bg-blue-50';
        textColor = 'text-blue-800';
        subtextColor = 'text-blue-700';
    } else if (target === 'lluvioso') {
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        subtextColor = 'text-gray-700';
    }

    return (
        <AnimatePresence>
            {state === target && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    // Ponemos el 'absolute' para que se deslice DENTRO del contenedor
                    className={`p-3 rounded-lg ${bgColor} absolute inset-0`}
                >
                    <p className={`font-semibold ${textColor}`}>{text}</p>
                    <p className={`text-sm ${subtextColor}`}>{subtext}</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// --- Página Principal de Filosofía ---
export default function FilosofiaPage() {
    
    // --- 1. MEJORA: Estado por defecto "soleado" ---
    const [mindState, setMindState] = useState('soleado');
    const [emotionState, setEmotionState] = useState('soleado');
    const [bodyState, setBodyState] = useState('soleado');

    // Estado para los InfoSlides de Beneficios
    const [expandedBenefit, setExpandedBenefit] = useState(null);
    const handleBenefitToggle = (id) => {
        setExpandedBenefit(prevId => (prevId === id ? null : id));
    };


    return (
        // Usamos el fondo de la landing actual
        <div className="bg-white min-h-screen text-zinc-800">
            
            {/* --- Header (Robado de Landing.jsx) --- */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
                <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
                    <Link to="/" className="flex items-center space-x-2 no-underline">
                        <span className="font-['Patrick_Hand'] text-3xl font-bold text-orange-600">
                            Sun Self
                        </span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/login" 
                            className="font-['Patrick_Hand'] text-lg text-zinc-600 hover:text-orange-600"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link 
                            to="/login"
                            className="bg-orange-500 text-white font-['Patrick_Hand'] text-lg px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
                        >
                            Registrarse
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Contenedor principal con padding */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-12">
                
                {/* --- Hero Section (Traducida) --- */}
                <section className="text-center mb-20 pt-8">
                    <motion.h2 
                        className="text-4xl md:text-5xl font-bold mb-4 font-['Patrick_Hand']"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        ¿Cómo estás... <span className="text-orange-600">realmente</span>?
                    </motion.h2>
                    <motion.p 
                        className="text-lg text-zinc-600 max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        En el caos de la vida diaria, es fácil desconectarse de uno mismo. La auto-observación es el primer paso para recuperar el control. Descubre el poder de registrar tus pensamientos, emociones y estado físico.
                    </motion.p>
                </section>

                {/* --- Interactive State Section (Traducida y Mejorada) --- */}
                <section id="estado" className="mb-20 scroll-mt-20">
                    <h3 className="text-3xl font-bold text-center mb-4 font-['Patrick_Hand']">Identifica tu "Clima" Interno</h3>
                    <p className="text-center text-zinc-600 mb-8 max-w-2xl mx-auto">
                        Aprender a vernos implica reconocer nuestro estado sin juicio. ¿Cuál es tu clima hoy? Haz clic en un estado para ver qué significa.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card: Mente */}
                        <motion.div 
                            className="bg-blue-200 p-6 rounded-2xl shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h4 className="text-2xl font-bold text-center mb-4 font-['Patrick_Hand']">Mente</h4>
                            <div className="flex justify-around mb-4 gap-1 -ml-3">
                                <StateButton lottieData={sunLoopAnimation} state="soleado" activeState={mindState} onSelect={setMindState} aria-label="Mente Soleada" />
                                <StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={mindState} onSelect={setMindState} aria-label="Mente Nublada" />
                                <StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={mindState} onSelect={setMindState} aria-label="Mente Lluviosa" />
                            </div>
                            <div className="h-[100px] relative">
                                <StateDescription state={mindState} target="soleado" text="Mente Despejada" subtext="Tus pensamientos son claros, estás enfocado y optimista." />
                                <StateDescription state={mindState} target="nublado" text="Mente Nublada" subtext="Te sientes disperso, con niebla mental o indecisión." />
                                <StateDescription state={mindState} target="lluvioso" text="Mente Lluviosa" subtext="Pensamientos negativos, rumiación o sensación de agobio." />
                            </div>
                        </motion.div>

                        {/* Card: Emoción */}
                        <motion.div 
                            className="bg-pink-200 p-6 rounded-2xl shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h4 className="text-2xl font-bold text-center mb-4 font-['Patrick_Hand']">Emoción</h4>
                            <div className="flex justify-around mb-4 gap-1 -ml-3">
                                <StateButton lottieData={sunLoopAnimation} state="soleado" activeState={emotionState} onSelect={setEmotionState} aria-label="Emoción Alegre" />
                                <StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={emotionState} onSelect={setEmotionState} aria-label="Emoción Apática" />
                                <StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={emotionState} onSelect={setEmotionState} aria-label="Emoción Difícil" />
                            </div>
                             <div className="h-[100px] relative">
                                <StateDescription state={emotionState} target="soleado" text="Emoción Alegre" subtext="Sientes gratitud, alegría, paz o amor." />
                                <StateDescription state={emotionState} target="nublado" text="Emoción Apática" subtext="Te sientes plano, apático, aburrido o desconectado." />
                                <StateDescription state={emotionState} target="lluvioso" text="Emoción Difícil" subtext="Experimentas tristeza, enojo, miedo o ansiedad." />
                            </div>
                        </motion.div>

                        {/* Card: Cuerpo */}
                        <motion.div 
                            className="bg-green-200 p-6 rounded-2xl shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <h4 className="text-2xl font-bold text-center mb-4 font-['Patrick_Hand']">Cuerpo</h4>
                            <div className="flex justify-around mb-4 gap-1 -ml-3">
                                <StateButton lottieData={sunLoopAnimation} state="soleado" activeState={bodyState} onSelect={setBodyState} aria-label="Cuerpo Energético" />
                                <StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={bodyState} onSelect={setBodyState} aria-label="Cuerpo Cansado" />
                                <StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={bodyState} onSelect={setBodyState} aria-label="Cuerpo Adolorido" />
                            </div>
                             <div className="h-[100px] relative">
                                <StateDescription state={bodyState} target="soleado" text="Cuerpo Energético" subtext="Te sientes con energía, vitalidad y sin dolor." />
                                <StateDescription state={bodyState} target="nublado" text="Cuerpo Cansado" subtext="Fatiga, baja energía o sensación de pesadez." />
                                <StateDescription state={bodyState} target="lluvioso" text="Cuerpo Adolorido" subtext="Dolor, tensión muscular, malestar o enfermedad." />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- SECCIÓN Beneficios (Mejorada) --- */}
                <section id="beneficios" className="mb-20 scroll-mt-20">
                    {/* --- 3. MEJORA: Título cambiado --- */}
                    <h3 className="text-3xl font-bold text-center mb-4 font-['Patrick_Hand']">El Micro-Hábito de Escribir</h3>
                    <p className="text-center text-zinc-600 mb-8 max-w-2xl mx-auto">
                        El simple acto de "Journaling" tiene beneficios comprobados. No se trata de escribir bonito, se trata de procesar. Explora los beneficios clave.
                    </p>

                    {/* --- 2. MEJORA: Ancho corregido (se quitó max-w-2xl) --- */}
                    <div className="space-y-3">
                        {/* Slide Mental */}
                        <InfoSlide
                            icon={Brain}
                            title="Beneficios Mentales: Claridad y Enfoque"
                            isExpanded={expandedBenefit === 'mental'}
                            onToggle={() => handleBenefitToggle('mental')}
                        >
                            {/* --- 4. MEJORA: Contenido ampliado --- */}
                            <p>El mecanismo clave es la <strong>Externalización Cognitiva</strong>. La rumiación y la preocupación residen en tu "Memoria Operativa", un sistema de capacidad limitada. Al "descargar" esos pensamientos en la app, liberas esos recursos.</p>
                            <p className="mt-2">Este espacio liberado te permite organizar prioridades, resolver problemas de manera más efectiva y aumentar tu capacidad de concentración, evitando que los pensamientos negativos den vueltas en bucle.</p>
                        </InfoSlide>

                        {/* Slide Emocional */}
                        <InfoSlide
                            icon={Heart}
                            title="Beneficios Emocionales: Regulación y Autoconciencia"
                            isExpanded={expandedBenefit === 'emocional'}
                            onToggle={() => handleBenefitToggle('emocional')}
                        >
                            {/* --- 4. MEJORA: Contenido ampliado --- */}
                            <p>El simple acto de nombrar una emoción (<strong>Etiquetado de Afectos</strong>) activa tu corteza prefrontal (el "freno") y calma tu amígdala (el "acelerador"). Esto te da un espacio vital entre el impulso y la acción.</p>
                            <p className="mt-2">Escribir te permite procesar eventos difíciles y construir una <strong>Narrativa Coherente</strong>. Dejas de ser una víctima de tu emoción y te conviertes en el observador, construyendo resiliencia.</p>
                        </InfoSlide>

                        {/* Slide Físico */}
                        <InfoSlide
                            icon={Shield}
                            title="Beneficios Físicos: Reducción del Estrés Fisiológico"
                            isExpanded={expandedBenefit === 'fisico'}
                            onToggle={() => handleBenefitToggle('fisico')}
                        >
                            {/* --- 4. MEJORA: Contenido ampliado --- */}
                            <p>Suprimir pensamientos y sentimientos es un <strong>trabajo fisiológico</strong> arduo que consume la energía de tu cuerpo (Teoría de la Inhibición). Este estrés crónico debilita tu sistema inmunológico.</p>
                            <p className="mt-2">Al escribir, reduces esa "carga de inhibición". Tu cuerpo deja de gastar energía en "contener" el estrés y puede reasignar esa energía a tareas vitales, como fortalecer tu sistema inmune (reduciendo el cortisol) e incluso acelerar la curación física.</p>
                        </InfoSlide>
                    </div>
                </section>

               {/* --- NUEVA SECCIÓN: El Hábito (Traducida y Mejorada) --- */}
                <section id="como" className="mb-20 scroll-mt-20">
                    <h3 className="text-3xl font-bold text-center mb-4 font-['Patrick_Hand']">El Micro-Hábito: Un Proceso de 2 Pasos</h3>
                    <p className="text-center text-zinc-600 mb-8 max-w-2xl mx-auto">
                        El bienestar no es solo "verse", es también preguntarse: "¿Qué hacemos con ello?". El micro-hábito de Sun Self consiste en esta simple y poderosa secuencia diaria.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                        
                        {/* Step 1 */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-full md:w-1/2 flex flex-col items-center">
                            <div className="w-24 h-24">
                                <Lottie animationData={brainRevealAnimation} loop={true} />
                            </div>
                            <h4 className="text-2xl font-bold my-2 font-['Patrick_Hand']">Paso 1: Verse</h4>
                            <p className="text-zinc-600">
                                Observar y registrar con sinceridad tu estado mental, emocional y físico. Sin juicios.
                            </p>
                        </div>
                        
                        {/* Arrow */}
                        <span className="text-5xl font-light text-orange-400 transform rotate-90 md:rotate-0" role="img" aria-hidden="true">
                        &rarr;
                        </span>
                        
                        {/* Step 2 */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-full md:w-1/2 flex flex-col items-center">
                            <div className="w-24 h-24">
                                <Lottie animationData={goalRevealAnimation} loop={true} />
                            </div>
                            <h4 className="text-2xl font-bold my-2 font-['Patrick_Hand']">Paso 2: Actuar</h4>
                            <p className="text-zinc-600">
                                Definir una meta del día. Una acción pequeña e intencional basada en lo que has observado.
                            </p>
                        </div>
                    </div>

                    {/* --- El "Giro" (CTA Clave) --- */}
                    <div className="mt-12 text-center">
                        <button
                            // onClick={() => ... (lógica futura)}
                            className="bg-orange-500 text-white font-['Patrick_Hand'] text-xl px-8 py-3 rounded-full hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Probar el Micro-Hábito
                        </button>
                    </div>
                </section>


                {/* --- PRÓXIMOS MARTILLAZOS ---
                
                <section id="impacto"> ... (Aquí irá el gráfico de Recharts) ... </section>
                
                --- FIN DE PRÓXIMOS MARTILLAZOS ---
                */}
            
            </main>

            {/* --- Footer (Robado de Landing.jsx) --- */}
            <footer className="text-center p-10 mt-12 bg-white border-t border-zinc-100">
                <p className="text-zinc-500 text-base font-['Patrick_Hand']">
                    {new Date().getFullYear()} Sun Self. Un movimiento por la calma.
                </p>
            </footer>

        </div>
    );
}