// frontend/src/pages/Landing.jsx
// Esta es AHORA la Landing Page principal.
// Es el "Informe Interactivo" reconstruido en React.

import React, { useState, useEffect } from 'react'; // <-- Importamos useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowDown } from 'lucide-react';

// Importamos las animaciones que vamos a usar
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import sunRevealAnimation from '../assets/animations/sun-reveal.json';
import cloudRevealAnimation from '../assets/animations/cloud-reveal.json';
import rainRevealAnimation from '../assets/animations/rain-reveal.json';

// --- CORRECCIÓN: Importamos los 'reveal' y 'loop' correctos para "El Hábito" ---
import brainRevealAnimation from '../assets/animations/brain-loop.json';
import goalRevealAnimation from '../assets/animations/goal-loop.json';

// Importamos el Ladrillo InfoSlide y los iconos
import InfoSlide from '../components/InfoSlide.jsx';
import { Brain, Heart, Shield } from 'lucide-react';


// --- Sub-componente: Botón de Estado (Sin cambios) ---
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

// --- Sub-componente: Descripción del Estado (Sin cambios) ---
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
                    className={`p-3 rounded-lg ${bgColor} absolute inset-0`}
                >
                    <p className={`font-semibold ${textColor}`}>{text}</p>
                    <p className={`text-sm ${subtextColor}`}>{subtext}</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Datos simulados para el gráfico (Sin cambios) ---
const chartData = [
    { name: 'Día 1-7', 'Estado General': 4.5, 'Metas Completadas': 3 },
    { name: 'Día 8-14', 'Estado General': 5.8, 'Metas Completadas': 5 },
    { name: 'Día 15-21', 'Estado General': 7.2, 'Metas Completadas': 6 },
    { name: 'Día 22-23', 'Estado General': 8.1, 'Metas Completadas': 8 },
];

// --- MARTILLAZO 2: Sub-componente para la Animación Secuencial del Hero ---
// --- MARTILLAZO: Hero "Épico" Secuencial (Lógica de Step6 + Timer) ---
const animMap = {
    sun: { reveal: sunRevealAnimation, loop: sunLoopAnimation },
    cloud: { reveal: cloudRevealAnimation, loop: cloudLoopAnimation },
    rain: { reveal: rainRevealAnimation, loop: rainLoopAnimation },
};
const states = ['sun', 'cloud', 'rain'];

const HeroAnimationSequence = () => {
    const [stateIndex, setStateIndex] = useState(0); // 0=sun, 1=cloud, 2=rain
    const [currentAnim, setCurrentAnim] = useState(animMap.sun.reveal);
    const [isLoop, setIsLoop] = useState(false);

    const currentStateKey = states[stateIndex];

    const handleComplete = () => {
        // Si el "reveal" terminó...
        if (!isLoop) {
            // 1. Ponemos el "loop"
            setCurrentAnim(animMap[currentStateKey].loop);
            setIsLoop(true);
            
            // 2. Seteamos el timer de 5 segundos para el *próximo* estado
            const timer = setTimeout(() => {
                const nextIndex = (stateIndex + 1) % states.length;
                const nextStateKey = states[nextIndex];
                
                // 3. Cambiamos al "reveal" del próximo estado
                setStateIndex(nextIndex);
                setCurrentAnim(animMap[nextStateKey].reveal);
                setIsLoop(false);
            }, 5000); // 5 segundos de loop

            return () => clearTimeout(timer);
        }
    };

    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 overflow-hidden">
            <AnimatePresence>
                <motion.div
                    key={currentStateKey} // La key (sun, cloud, rain) fuerza el fade
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute w-[130%] h-[130%]" // "Bien grande"
                >
                    <Lottie
                        animationData={currentAnim}
                        loop={isLoop}
                        onComplete={handleComplete}
                        className="w-full h-full"
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// --- Página Principal de la LANDING ---
export default function Landing() {
    
    // Estados (sin cambios)
    const [mindState, setMindState] = useState('soleado');
    const [emotionState, setEmotionState] = useState('soleado');
    const [bodyState, setBodyState] = useState('soleado');
    const [expandedBenefit, setExpandedBenefit] = useState(null);
    const handleBenefitToggle = (id) => {
        setExpandedBenefit(prevId => (prevId === id ? null : id));
    };
    
    // Lógica de Scroll Suave (sin cambios)
    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <div className="bg-white min-h-screen text-zinc-800">
            
            {/* --- Header (MARTILLAZO 1: Layout Corregido) --- */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
                <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
                    
                    {/* --- Grupo Izquierdo (Título + Navegación) --- */}
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex-shrink-0 flex items-center space-x-2 no-underline">
                            <span className="font-['Patrick_Hand'] text-3xl font-bold text-orange-600">
                                Sun Self
                            </span>
                        </Link>
                        
                        <div className="hidden md:flex items-center space-x-4">
                            <button onClick={() => scrollTo('estado')} className="font-['Patrick_Hand'] text-lg text-zinc-600 hover:text-orange-600">Tu Estado</button>
                            <button onClick={() => scrollTo('beneficios')} className="font-['Patrick_Hand'] text-lg text-zinc-600 hover:text-orange-600">Beneficios</button>
                            <button onClick={() => scrollTo('como')} className="font-['Patrick_Hand'] text-lg text-zinc-600 hover:text-orange-600">El Hábito</button>
                            <button onClick={() => scrollTo('impacto')} className="font-['Patrick_Hand'] text-lg text-zinc-600 hover:text-orange-600">Impacto</button>
                        </div>
                    </div>

                    {/* --- Grupo Derecho (Acciones) --- */}
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/filosofia" 
                            className="font-['Patrick_Hand'] text-lg text-zinc-600 hover:text-orange-600"
                        >
                            Noticias
                        </Link>
                        <Link 
                            to="/login"
                            className="bg-orange-500 text-white font-['Patrick_Hand'] text-lg px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
                        >
                            Ingresar a la App
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                
                {/* --- "HERO ÉPICO" (MARTILLAZO 2: Animación Secuencial) --- */}
                <section className="h-screen flex flex-col items-center justify-center text-center relative -mt-20">
                    
                    {/* NUEVO Fondo Secuencial Épico */}
                    <HeroAnimationSequence />

                    {/* Contenido del Hero (en primer plano) */}
                    <div className="relative z-10">
                        <motion.h2 
                            className="text-5xl md:text-7xl font-bold mb-4 font-['Patrick_Hand']"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            ¿Cómo estás... <span className="text-orange-600">realmente</span>?
                        </motion.h2>
                        <motion.p 
                            className="text-xl text-zinc-600 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            En el caos de la vida diaria, es fácil desconectarse de uno mismo. La auto-observación es el primer paso para recuperar el control.
                        </motion.p>
                    </div>

                    {/* Flecha de Scroll Down */}
                    <motion.div
                        className="absolute bottom-10 z-10"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 1 }}
                    >
                        <ArrowDown size={32} className="text-zinc-400 animate-bounce" />
                    </motion.div>
                </section>

                {/* --- Interactive State Section (Sin cambios) --- */}
                <section id="estado" className="mb-20 scroll-mt-20">
                    <h3 className="text-3xl font-bold text-center mb-4 font-['Patrick_Hand']">Identifica tu "Clima" Interno</h3>
                    <p className="text-center text-zinc-600 mb-8 max-w-2xl mx-auto">
                        Aprender a vernos implica reconocer nuestro estado sin juicio. ¿Cuál es tu clima hoy? Haz clic en un estado para ver qué significa.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card: Mente */}
                        <motion.div 
                            className="bg-blue-50 p-6 rounded-2xl shadow-lg"
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
                            className="bg-pink-50 p-6 rounded-2xl shadow-lg"
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
                            className="bg-green-50 p-6 rounded-2xl shadow-lg"
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

                {/* --- SECCIÓN Beneficios (Sin cambios) --- */}
                <section id="beneficios" className="mb-20 scroll-mt-20">
                    <h3 className="text-3xl font-bold text-center mb-4 font-['Patrick_Hand']">El Micro-Hábito de Escribir</h3>
                    <p className="text-center text-zinc-600 mb-8 max-w-2xl mx-auto">
                        El simple acto de "Journaling" tiene beneficios comprobados. No se trata de escribir bonito, se trata de procesar. Explora los beneficios clave.
                    </p>
                    <div className="space-y-3">
                        <InfoSlide
                            icon={Brain}
                            title="Beneficios Mentales: Claridad y Enfoque"
                            isExpanded={expandedBenefit === 'mental'}
                            onToggle={() => handleBenefitToggle('mental')}
                        >
                            <p>El mecanismo clave es la <strong>Externalización Cognitiva</strong>. La rumiación y la preocupación residen en tu "Memoria Operativa", un sistema de capacidad limitada. Al "descargar" esos pensamientos en la app, liberas esos recursos.</p>
                            <p className="mt-2">Este espacio liberado te permite organizar prioridades, resolver problemas de manera más efectiva y aumentar tu capacidad de concentración, evitando que los pensamientos negativos den vueltas en bucle.</p>
                        </InfoSlide>
                        <InfoSlide
                            icon={Heart}
                            title="Beneficios Emocionales: Regulación y Autoconciencia"
                            isExpanded={expandedBenefit === 'emocional'}
                            onToggle={() => handleBenefitToggle('emocional')}
                        >
                            <p>El simple acto de nombrar una emoción (<strong>Etiquetado de Afectos</strong>) activa tu corteza prefrontal (el "freno") y calma tu amígdala (el "acelerador"). Esto te da un espacio vital entre el impulso y la acción.</p>
                            <p className="mt-2">Escribir te permite procesar eventos difíciles y construir una <strong>Narrativa Coherente</strong>. Dejas de ser una víctima de tu emoción y te conviertes en el observador, construyendo resiliencia.</p>
                        </InfoSlide>
                        <InfoSlide
                            icon={Shield}
                            title="Beneficios Físicos: Reducción del Estrés Fisiológico"
                            isExpanded={expandedBenefit === 'fisico'}
                            onToggle={() => handleBenefitToggle('fisico')}
                        >
                            <p>Suprimir pensamientos y sentimientos es un <strong>trabajo fisiológico</strong> arduo que consume la energía de tu cuerpo (Teoría de la Inhibición). Este estrés crónico debilita tu sistema inmunológico.</p>
                            <p className="mt-2">Al escribir, reduces esa "carga de inhibición". Tu cuerpo deja de gastar energía en "contener" el estrés y puede reasignar esa energía a tareas vitales, como fortalecer tu sistema inmune (reduciendo el cortisol) e incluso acelerar la curación física.</p>
                        </InfoSlide>
                    </div>
                </section>

                
                {/* --- SECCIÓN El Hábito (Sin cambios) --- */}
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
                    {/* CTA "Probar" */}
                    <div className="mt-12 text-center">
                        <button
                            className="bg-orange-500 text-white font-['Patrick_Hand'] text-xl px-8 py-3 rounded-full hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Probar el Micro-Hábito
                        </button>
                    </div>
                </section>


                {/* --- SECCIÓN Impacto (MARTILLAZO 2: Giro 5 con Recharts) --- */}
                <section id="impacto" className="mb-12 scroll-mt-20">
                    <h3 className="text-3xl font-bold text-center mb-4 font-['Patrick_Hand']">El Impacto Comprobado del Hábito</h3>
                    <p className="text-center text-zinc-600 mb-8 max-w-2xl mx-auto">
                        El "journaling" consistente muestra mejoras medibles.
                    </p>
                    
                    {/* El contador que pediste */}
                    <div className="text-center mb-8">
                        <span className="text-4xl font-bold text-orange-600 font-['Patrick_Hand']">
                            23
                        </span>
                        <span className="text-xl text-zinc-600 ml-2">
                            Micro-Hábitos probados
                        </span>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                        <h4 className="text-lg font-bold text-zinc-800 text-center mb-4 font-['Patrick_Hand']">
                            Progreso Promedio (Datos de Prueba)
                        </h4>
                        {/* Contenedor del Gráfico (Recharts) */}
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                                >
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" domain={[0, 10]} />
                                    <Tooltip 
                                        cursor={{ fill: '#fef3c7' }} 
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', borderColor: '#fde68a' }} 
                                    />
                                    <Bar dataKey="Estado General" fill="#f97316" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Metas Completadas" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
            
            </main>

            {/* --- Footer (Sin cambios) --- */}
            <footer className="text-center p-10 mt-12 bg-white border-t border-zinc-100">
                <p className="text-zinc-500 text-base font-['Patrick_Hand']">
                    {new Date().getFullYear()} Sun Self. Un movimiento por la calma.
                </p>
            </footer>

        </div>
    );
}