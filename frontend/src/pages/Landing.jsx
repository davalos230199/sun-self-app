import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowDown, Brain, Heart, Shield, X, Sun, Sparkles } from 'lucide-react';

// --- Importaciones de Animaciones ---
// Asegúrate de que estas rutas coincidan con tu estructura de carpetas
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import sunRevealAnimation from '../assets/animations/sun-reveal.json';
import cloudRevealAnimation from '../assets/animations/cloud-reveal.json';
import rainRevealAnimation from '../assets/animations/rain-reveal.json';
import brainLoopAnimation from '../assets/animations/brain-loop.json'; 
import goalLoopAnimation from '../assets/animations/goal-loop.json';

// --- Componentes ---
import InfoSlide from '../components/InfoSlide.jsx';
import RitualFlow from '../components/RitualFlow.jsx'; 

// --- Sub-componente: Botón de Estado ---
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
        <AnimatePresence mode='wait'>
            {state === target && (
                <motion.div
                    key={target}
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

// --- Datos simulados para el gráfico ---
const chartData = [
    { name: 'Semana 1', 'Estado General': 4.5, 'Metas': 3 },
    { name: 'Semana 2', 'Estado General': 5.8, 'Metas': 5 },
    { name: 'Semana 3', 'Estado General': 7.2, 'Metas': 6 },
    { name: 'Semana 4', 'Estado General': 8.5, 'Metas': 8 },
];

// --- Animación Secuencial del Hero ---
const animMap = {
    sun: { reveal: sunRevealAnimation, loop: sunLoopAnimation },
    cloud: { reveal: cloudRevealAnimation, loop: cloudLoopAnimation },
    rain: { reveal: rainRevealAnimation, loop: rainLoopAnimation },
};
const states = ['sun', 'cloud', 'rain'];

const HeroAnimationSequence = () => {
    const [stateIndex, setStateIndex] = useState(0);
    const [currentAnim, setCurrentAnim] = useState(animMap.sun.reveal);
    const [isLoop, setIsLoop] = useState(false);
    const currentStateKey = states[stateIndex];

    const handleComplete = () => {
        if (!isLoop) {
            setCurrentAnim(animMap[currentStateKey].loop);
            setIsLoop(true);
            const timer = setTimeout(() => {
                const nextIndex = (stateIndex + 1) % states.length;
                const nextStateKey = states[nextIndex];
                setStateIndex(nextIndex);
                setCurrentAnim(animMap[nextStateKey].reveal);
                setIsLoop(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    };

    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 overflow-hidden pointer-events-none">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentStateKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute w-[130%] h-[130%]"
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

// --- COMPONENTE PRINCIPAL: LANDING ---
export default function Landing() {
    const [mindState, setMindState] = useState('soleado');
    const [emotionState, setEmotionState] = useState('soleado');
    const [bodyState, setBodyState] = useState('soleado');
    const [expandedBenefit, setExpandedBenefit] = useState(null);
    
    // Estado para controlar el modal del Ritual Demo
    const [showDemoRitual, setShowDemoRitual] = useState(false);

    const handleBenefitToggle = (id) => {
        setExpandedBenefit(prevId => (prevId === id ? null : id));
    };
    
    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Handler para cuando termina el ritual en modo demo
    const handleFinishDemo = (meta) => {
        // Al ser demo y anónimo, cuando termina simplemente cerramos el modal
        // Los datos ya se habrán enviado al backend anónimo gracias a RitualFlow mode="anon"
        console.log("Ritual anónimo finalizado.");
        setShowDemoRitual(false);
    };

    return (
        <div className="bg-white min-h-screen text-zinc-800 relative overflow-x-hidden">
            
            {/* --- BOTÓN FLOTANTE (FAB) - SOL PULSANTE --- */}
            <motion.button
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1, rotate: 45 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDemoRitual(true)}
                className="fixed bottom-6 right-6 z-40 bg-amber-400 text-white p-4 rounded-full shadow-2xl border-4 border-white flex items-center justify-center group ring-4 ring-amber-100/50"
                title="Probar Micro-Hábito"
            >
                <div className="absolute inset-0 bg-amber-300 rounded-full animate-ping opacity-20"></div>
                <Sun size={32} className="text-white relative z-10 fill-amber-100" strokeWidth={2.5} />
                
                {/* Tooltip flotante */}
                <span className="absolute right-full mr-4 bg-zinc-800 text-white text-sm font-['Patrick_Hand'] px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 shadow-lg">
                    ¡Haz un Check-in Rápido!
                </span>
            </motion.button>

            {/* --- MODAL DEL RITUAL DEMO --- */}
            <AnimatePresence>
                {showDemoRitual && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-white/60 backdrop-blur-lg flex items-center justify-center p-4"
                    >
                        {/* Botón Cerrar */}
                        <button 
                            onClick={() => setShowDemoRitual(false)}
                            className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg text-zinc-400 hover:text-red-500 hover:scale-110 transition-all z-50 border border-zinc-100"
                        >
                            <X size={24} />
                        </button>
                        
                        {/* Contenedor del Ritual */}
                        <div className="w-full max-w-lg relative">
                            <RitualFlow 
                                mode="anon" // <-- MODO ANÓNIMO ACTIVADO
                                onFinish={handleFinishDemo} 
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- HEADER --- */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">
                <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex-shrink-0 flex items-center space-x-2 no-underline group">
                            <Sun className="text-orange-500 group-hover:rotate-45 transition-transform duration-500" size={28} />
                            <span className="font-['Patrick_Hand'] text-3xl font-bold text-zinc-800 group-hover:text-orange-600 transition-colors">
                                Sun Self
                            </span>
                        </Link>
                        
                        <div className="hidden md:flex items-center space-x-6">
                            {['Tu Estado', 'Beneficios', 'El Hábito', 'Impacto'].map((item, index) => {
                                const ids = ['estado', 'beneficios', 'como', 'impacto'];
                                return (
                                    <button 
                                        key={item}
                                        onClick={() => scrollTo(ids[index])} 
                                        className="font-['Patrick_Hand'] text-lg text-zinc-500 hover:text-orange-500 transition-colors"
                                    >
                                        {item}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/filosofia" className="hidden sm:block font-['Patrick_Hand'] text-lg text-zinc-500 hover:text-orange-500 transition-colors">Noticias</Link>
                        <Link 
                            to="/login"
                            className="bg-zinc-900 text-white font-['Patrick_Hand'] text-lg px-6 py-2 rounded-full hover:bg-zinc-800 hover:scale-105 transition-all shadow-md"
                        >
                            Ingresar
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
                
                {/* --- HERO SECTION --- */}
                <section className="min-h-[90vh] flex flex-col items-center justify-center text-center relative -mt-20">
                    <HeroAnimationSequence />
                    <div className="relative z-10 px-4 mt-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                             <h2 className="text-5xl md:text-8xl font-bold mb-6 font-['Patrick_Hand'] text-zinc-800 drop-shadow-sm leading-tight">
                                ¿Cómo estás... <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">realmente</span>?
                            </h2>
                        </motion.div>
                       
                        <motion.p 
                            className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto font-light leading-relaxed mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            En el caos de la vida diaria, es fácil desconectarse. <br className="hidden md:block"/> 
                            <strong>Sun Self</strong> es tu micro-habito diario de calma y estrategia.
                        </motion.p>
                        
                        <motion.button
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.5 }}
                             onClick={() => setShowDemoRitual(true)}
                             className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-['Patrick_Hand'] text-2xl px-10 py-4 rounded-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg flex items-center gap-3 mx-auto"
                        >
                            <Sparkles size={24} className="text-amber-200" />
                            Hacer un Check-in Ahora
                        </motion.button>
                    </div>

                    <motion.div
                        className="absolute bottom-10 z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 10, 0] }}
                        transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                    >
                        <ArrowDown size={32} className="text-zinc-300" />
                    </motion.div>
                </section>

                {/* --- ESTADOS INTERACTIVOS --- */}
                <section id="estado" className="mb-32 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold mb-4 font-['Patrick_Hand'] text-zinc-800">Tu "Clima" Interno</h3>
                        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
                            Antes de actuar, observa. Haz clic para explorar los estados.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card: Mente */}
                        <motion.div 
                            className="bg-white/60 backdrop-blur-sm border border-blue-100 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h4 className="text-3xl font-bold text-center mb-8 font-['Patrick_Hand'] text-blue-600">Mente</h4>
                            <div className="flex justify-center mb-8 gap-2">
                                <StateButton lottieData={sunLoopAnimation} state="soleado" activeState={mindState} onSelect={setMindState} />
                                <StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={mindState} onSelect={setMindState} />
                                <StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={mindState} onSelect={setMindState} />
                            </div>
                            <div className="h-[80px] relative">
                                <StateDescription state={mindState} target="soleado" text="Despejada" subtext="Pensamientos claros, enfoque y optimismo." />
                                <StateDescription state={mindState} target="nublado" text="Nublada" subtext="Dispersión, niebla mental o indecisión." />
                                <StateDescription state={mindState} target="lluvioso" text="Lluviosa" subtext="Rumiación, negatividad o agobio." />
                            </div>
                        </motion.div>

                        {/* Card: Emoción */}
                        <motion.div 
                            className="bg-white/60 backdrop-blur-sm border border-pink-100 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <h4 className="text-3xl font-bold text-center mb-8 font-['Patrick_Hand'] text-pink-600">Emoción</h4>
                            <div className="flex justify-center mb-8 gap-2">
                                <StateButton lottieData={sunLoopAnimation} state="soleado" activeState={emotionState} onSelect={setEmotionState} />
                                <StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={emotionState} onSelect={setEmotionState} />
                                <StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={emotionState} onSelect={setEmotionState} />
                            </div>
                             <div className="h-[80px] relative">
                                <StateDescription state={emotionState} target="soleado" text="Alegre" subtext="Gratitud, paz o amor." />
                                <StateDescription state={emotionState} target="nublado" text="Apática" subtext="Aburrimiento, desconexión o plano." />
                                <StateDescription state={emotionState} target="lluvioso" text="Difícil" subtext="Tristeza, enojo, miedo o ansiedad." />
                            </div>
                        </motion.div>

                        {/* Card: Cuerpo */}
                        <motion.div 
                            className="bg-white/60 backdrop-blur-sm border border-green-100 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <h4 className="text-3xl font-bold text-center mb-8 font-['Patrick_Hand'] text-green-600">Cuerpo</h4>
                            <div className="flex justify-center mb-8 gap-2">
                                <StateButton lottieData={sunLoopAnimation} state="soleado" activeState={bodyState} onSelect={setBodyState} />
                                <StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={bodyState} onSelect={setBodyState} />
                                <StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={bodyState} onSelect={setBodyState} />
                            </div>
                             <div className="h-[80px] relative">
                                <StateDescription state={bodyState} target="soleado" text="Energético" subtext="Vitalidad y fuerza." />
                                <StateDescription state={bodyState} target="nublado" text="Cansado" subtext="Fatiga o pesadez." />
                                <StateDescription state={bodyState} target="lluvioso" text="Adolorido" subtext="Tensión, dolor o malestar." />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- BENEFICIOS --- */}
                <section id="beneficios" className="mb-32 scroll-mt-24">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="w-full md:w-1/2">
                             <h3 className="text-4xl font-bold mb-6 font-['Patrick_Hand'] text-zinc-800">Ciencia, no Magia</h3>
                             <p className="text-zinc-600 text-lg mb-8 leading-relaxed">
                                El acto de externalizar tus pensamientos libera memoria operativa y reduce la carga fisiológica del estrés. Es como limpiar el caché de tu mente.
                             </p>
                             <div className="space-y-4">
                                <InfoSlide
                                    icon={Brain}
                                    title="Claridad Mental"
                                    isExpanded={expandedBenefit === 'mental'}
                                    onToggle={() => handleBenefitToggle('mental')}
                                >
                                    <p>Libera tu "RAM" mental. Al descargar pensamientos en bucle, recuperas capacidad para resolver problemas reales.</p>
                                </InfoSlide>
                                <InfoSlide
                                    icon={Heart}
                                    title="Regulación Emocional"
                                    isExpanded={expandedBenefit === 'emocional'}
                                    onToggle={() => handleBenefitToggle('emocional')}
                                >
                                    <p>Nombrar una emoción ("Etiquetado de Afectos") calma la amígdala y activa tu corteza prefrontal.</p>
                                </InfoSlide>
                                <InfoSlide
                                    icon={Shield}
                                    title="Salud Física"
                                    isExpanded={expandedBenefit === 'fisico'}
                                    onToggle={() => handleBenefitToggle('fisico')}
                                >
                                    <p>Reduces el costo energético de "contener" emociones, mejorando tu sistema inmune.</p>
                                </InfoSlide>
                             </div>
                        </div>
                        <div className="w-full md:w-1/2 flex justify-center">
                            <div className="bg-orange-50 rounded-full w-80 h-80 flex items-center justify-center relative">
                                <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-200 animate-spin-slow"></div>
                                <div className="absolute inset-4 rounded-full border border-orange-100"></div>
                                <Brain size={120} className="text-orange-400 drop-shadow-sm" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- EL HÁBITO --- */}
                <section id="como" className="mb-32 scroll-mt-24 text-center">
                    <h3 className="text-4xl font-bold mb-12 font-['Patrick_Hand'] text-zinc-800">El Método de 2 Pasos</h3>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-10 relative">
                        {/* Línea conectora */}
                        <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-orange-100 to-amber-100 -z-10 border-t-2 border-dashed border-orange-200"></div>

                        {/* Step 1 */}
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-sm w-full relative group hover:-translate-y-2 transition-transform duration-300 border border-zinc-50">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center absolute -top-7 left-1/2 -translate-x-1/2 text-orange-500 font-bold text-2xl border-4 border-orange-100 shadow-sm">1</div>
                            <div className="w-32 h-32 mx-auto mb-6">
                                <Lottie animationData={brainLoopAnimation} loop={true} />
                            </div>
                            <h4 className="text-2xl font-bold mb-3 font-['Patrick_Hand'] text-zinc-800">Verse</h4>
                            <p className="text-zinc-500 leading-relaxed">Registra tu estado con honestidad radical. Sin juicios, solo datos.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-sm w-full relative group hover:-translate-y-2 transition-transform duration-300 border border-zinc-50">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center absolute -top-7 left-1/2 -translate-x-1/2 text-amber-500 font-bold text-2xl border-4 border-amber-100 shadow-sm">2</div>
                            <div className="w-32 h-32 mx-auto mb-6">
                                <Lottie animationData={goalLoopAnimation} loop={true} />
                            </div>
                            <h4 className="text-2xl font-bold mb-3 font-['Patrick_Hand'] text-zinc-800">Actuar</h4>
                            <p className="text-zinc-500 leading-relaxed">Define una estrategia táctica. Convierte la observación en intención.</p>
                        </div>
                    </div>
                    
                    <div className="mt-20">
                        <button
                            onClick={() => setShowDemoRitual(true)}
                            className="bg-zinc-800 text-white font-['Patrick_Hand'] text-xl px-12 py-5 rounded-full hover:bg-zinc-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
                        >
                            <Sparkles size={22} className="text-amber-300" />
                            Probar (Sin Registro)
                        </button>
                    </div>
                </section>

                {/* --- IMPACTO --- */}
                <section id="impacto" className="mb-20 scroll-mt-24">
                     <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white rounded-[3rem] p-8 md:p-16 shadow-inner border border-orange-100/50">
                        <h3 className="text-4xl font-bold text-center mb-4 font-['Patrick_Hand'] text-zinc-800">Progreso Visible</h3>
                        <p className="text-center text-zinc-600 mb-12 max-w-2xl mx-auto text-lg">
                            Lo que se mide, mejora. Visualiza tu evolución.
                        </p>
                        
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                            {/* Contador "Vivo" */}
                            <div className="bg-white p-10 rounded-[2rem] shadow-xl text-center w-full max-w-xs transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300 border border-zinc-50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Sun size={80} className="text-orange-500" />
                                </div>
                                <span className="block text-7xl font-black text-orange-500 font-['Patrick_Hand'] mb-2 tracking-tighter">23</span>
                                <span className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Rituales Probados</span>
                                <div className="w-full h-2 bg-zinc-100 mt-6 rounded-full overflow-hidden">
                                    <div className="w-2/3 h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
                                </div>
                                <p className="text-xs text-zinc-400 mt-2 text-left font-mono">Meta semanal: 46%</p>
                            </div>

                            {/* Gráfico */}
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-xl h-[400px] border border-zinc-50">
                                <h4 className="text-lg font-bold text-zinc-800 mb-8 font-['Patrick_Hand'] flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    Tu Tendencia de Bienestar
                                </h4>
                                <ResponsiveContainer width="100%" height="85%">
                                    <BarChart data={chartData} barSize={24}>
                                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                                        <Tooltip 
                                            cursor={{ fill: '#fff7ed', radius: 8 }} 
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.15)', padding: '12px' }} 
                                            itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                                        />
                                        <Bar dataKey="Estado General" stackId="a" radius={[0, 0, 6, 6]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#fed7aa', '#fdba74', '#fb923c', '#ea580c'][index]} />
                                            ))}
                                        </Bar>
                                        <Bar dataKey="Metas" stackId="a" fill="#fcd34d" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                     </div>
                </section>

            </main>

            {/* --- FOOTER --- */}
            <footer className="text-center p-12 bg-white border-t border-zinc-100 relative z-10">
                <p className="text-zinc-400 text-sm font-['Patrick_Hand']">
                    &copy; {new Date().getFullYear()} Sun Self. Construido con calma para mentes inquietas.
                </p>
            </footer>

        </div>
    );
}