import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { ArrowDown, Menu, X, Sun, Sparkles, Users, Zap, ShieldCheck, Microscope } from 'lucide-react';
import api from '../services/api'; 

// --- Importaciones de Animaciones ---
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import sunRevealAnimation from '../assets/animations/sun-reveal.json';
import cloudRevealAnimation from '../assets/animations/cloud-reveal.json';
import rainRevealAnimation from '../assets/animations/rain-reveal.json';
import brainLoopAnimation from '../assets/animations/brain-loop.json'; 
import goalLoopAnimation from '../assets/animations/goal-loop.json';

// --- Importaciones de SVGs ---
import brainIcon from '../assets/icons/brain.svg';
import emotionIcon from '../assets/icons/emotion.svg';
import bodyIcon from '../assets/icons/body.svg';

import RitualFlow from '../components/RitualFlow.jsx'; 

// --- 1. Componentes Auxiliares (Botones, Descripciones, Animaciones) ---

const StateButton = ({ lottieData, state, activeState, onSelect }) => {
    const isActive = activeState === state;
    let borderColor = 'border-transparent', bgColor = 'bg-white';
    if (isActive) {
        if (state === 'soleado') { borderColor = 'border-amber-400'; bgColor = 'bg-amber-50'; }
        else if (state === 'nublado') { borderColor = 'border-blue-400'; bgColor = 'bg-blue-50'; }
        else if (state === 'lluvioso') { borderColor = 'border-gray-400'; bgColor = 'bg-gray-100'; }
    }
    return (
        <motion.button onClick={() => onSelect(state)} whileHover={{ scale: 1.05 }} animate={{ scale: isActive ? 1.05 : 1 }} className={`p-3 rounded-2xl border-2 ${borderColor} ${bgColor} transition-all duration-200 ease-in-out`}>
            <div className="w-16 h-16 pointer-events-none"><Lottie animationData={lottieData} loop={true} /></div>
        </motion.button>
    );
};

const StateDescription = ({ state, target, text, subtext }) => {
    let bgColor = '', textColor = '', subtextColor = '';
    if (target === 'soleado') { bgColor = 'bg-amber-50'; textColor = 'text-amber-800'; subtextColor = 'text-amber-700'; }
    else if (target === 'nublado') { bgColor = 'bg-blue-50'; textColor = 'text-blue-800'; subtextColor = 'text-blue-700'; }
    else if (target === 'lluvioso') { bgColor = 'bg-gray-100'; textColor = 'text-gray-800'; subtextColor = 'text-gray-700'; }
    return (
        <AnimatePresence mode='wait'>
            {state === target && (
                <motion.div key={target} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-3 rounded-lg ${bgColor} absolute inset-0`}>
                    <p className={`font-semibold ${textColor}`}>{text}</p><p className={`text-sm ${subtextColor}`}>{subtext}</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

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
                    <Lottie animationData={currentAnim} loop={isLoop} onComplete={handleComplete} className="w-full h-full" />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const ScienceCard = ({ icon: Icon, title, highlight, description, colorClass }) => (
    <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-zinc-100 hover:shadow-xl transition-shadow">
        <div className={`w-14 h-14 rounded-2xl ${colorClass.bg} flex items-center justify-center mb-6`}>
            <Icon size={28} className={colorClass.text} />
        </div>
        <h4 className="text-xl font-bold font-['Patrick_Hand'] text-zinc-800 mb-2">{title}</h4>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide mb-4">{highlight}</p>
        <p className="text-zinc-600 leading-relaxed">{description}</p>
    </div>
);

// --- 2. Componente AppShowcase (NUEVO - Muestra la App) ---
const AppShowcase = () => {
    return (
        <section className="py-24 bg-zinc-50 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-bold mb-4 font-['Patrick_Hand'] text-zinc-800">Tu Laboratorio de Bolsillo</h3>
                    <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
                        Toda esa neurociencia, empaquetada en una interfaz minimalista diseñada para no estresarte más.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
                    {/* Features */}
                    <div className="space-y-12 max-w-md">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-600 font-bold text-xl font-['Patrick_Hand']">1</div>
                            <div>
                                <h4 className="text-xl font-bold text-zinc-800 mb-2">El Ritual Guiado</h4>
                                <p className="text-zinc-600 leading-relaxed">No te enfrentes a la página en blanco. Un flujo de 7 pasos te lleva de la mano en menos de 2 minutos.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-xl font-['Patrick_Hand']">2</div>
                            <div>
                                <h4 className="text-xl font-bold text-zinc-800 mb-2">Historial Inteligente</h4>
                                <p className="text-zinc-600 leading-relaxed">Detecta patrones invisibles. Sun Self te muestra con datos cómo fluctúa tu estado de ánimo.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-green-600 font-bold text-xl font-['Patrick_Hand']">3</div>
                            <div>
                                <h4 className="text-xl font-bold text-zinc-800 mb-2">Sunny (IA Privada)</h4>
                                <p className="text-zinc-600 leading-relaxed">Un asistente entrenado en psicología que analiza tu entrada y te devuelve una "pregunta poderosa".</p>
                            </div>
                        </div>
                    </div>

                    {/* Mockup Celular */}
                    <div className="relative">
                        <div className="w-[300px] h-[600px] bg-zinc-900 rounded-[3rem] p-4 shadow-2xl border-8 border-zinc-800 relative z-10">
                            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative flex flex-col">
                                <div className="h-14 bg-white border-b border-zinc-100 flex items-center justify-between px-6 pt-2">
                                    <div className="w-4 h-4 rounded-full bg-zinc-200"></div>
                                    <span className="font-['Patrick_Hand'] text-zinc-400">Sun Self</span>
                                    <div className="w-4 h-4 rounded-full bg-zinc-200"></div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-orange-50/50 to-white">
                                    <div className="w-24 h-24 mb-6 bg-white rounded-full shadow-sm flex items-center justify-center p-4">
                                         <Lottie animationData={sunLoopAnimation} loop={true} />
                                    </div>
                                    <div className="w-32 h-4 bg-zinc-100 rounded-full mb-3"></div>
                                    <div className="w-48 h-3 bg-zinc-50 rounded-full mb-8"></div>
                                    <div className="w-full space-y-3">
                                        <div className="h-12 w-full bg-white border border-orange-100 rounded-xl shadow-sm flex items-center px-4"><div className="w-6 h-6 rounded-full bg-orange-100 mr-3"></div><div className="w-20 h-2 bg-zinc-50 rounded-full"></div></div>
                                        <div className="h-12 w-full bg-white border border-blue-100 rounded-xl shadow-sm flex items-center px-4"><div className="w-6 h-6 rounded-full bg-blue-100 mr-3"></div><div className="w-24 h-2 bg-zinc-50 rounded-full"></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-3xl -z-0"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- 3. Gráfico de Promedios ---
const GlobalAverageBars = ({ averages }) => {
    const BarItem = ({ label, svgIcon, value, barColorClass }) => (
        <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="w-16 md:w-20 flex flex-col items-center justify-center shrink-0">
                <img src={svgIcon} alt={label} className="w-10 h-10 md:w-12 md:h-12 mb-1 object-contain opacity-90" />
                <span className="font-['Patrick_Hand'] text-zinc-500 text-sm md:text-base">{label}</span>
            </div>
            <div className="flex-1 relative h-10 md:h-14 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-inner overflow-hidden group">
                <div className="absolute inset-0 flex pointer-events-none"><div className="w-1/3 h-full border-r border-dashed border-zinc-200"></div><div className="w-1/3 h-full border-r border-dashed border-zinc-200"></div></div>
                <motion.div className={`absolute top-1 bottom-1 left-1 md:top-2 md:bottom-2 md:left-2 rounded-xl shadow-sm opacity-90 ${barColorClass}`} initial={{ width: '0%' }} animate={{ width: `${value}%` }} transition={{ duration: 1.5, ease: "easeOut" }} />
            </div>
        </div>
    );
    return (
        <div className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-lg border border-zinc-100">
            <h4 className="text-center font-['Patrick_Hand'] text-xl md:text-2xl text-zinc-800 mb-6 md:mb-10">Promedio Global (Últimos 50)</h4>
            <div className="relative z-10 mb-2">
                <BarItem label="Mente" svgIcon={brainIcon} value={averages.mente || 0} barColorClass="bg-blue-400" />
                <BarItem label="Emoción" svgIcon={emotionIcon} value={averages.emocion || 0} barColorClass="bg-pink-400" />
                <BarItem label="Cuerpo" svgIcon={bodyIcon} value={averages.cuerpo || 0} barColorClass="bg-green-400" />
            </div>
            <div className="flex gap-3 md:gap-6 pl-[4rem] md:pl-[5rem]">
                <div className="flex-1 grid grid-cols-3 h-12 md:h-16 opacity-70 relative">
                     <div className="flex justify-center items-start pt-1"><div className="w-10 h-10 md:w-14 md:h-14"><Lottie animationData={rainLoopAnimation} loop={true} /></div></div>
                     <div className="flex justify-center items-start pt-1"><div className="w-10 h-10 md:w-14 md:h-14"><Lottie animationData={cloudLoopAnimation} loop={true} /></div></div>
                     <div className="flex justify-center items-start pt-1"><div className="w-10 h-10 md:w-14 md:h-14"><Lottie animationData={sunLoopAnimation} loop={true} /></div></div>
                </div>
            </div>
        </div>
    );
};

// --- 4. COMPONENTE PRINCIPAL LANDING ---
export default function Landing() {
    const [mindState, setMindState] = useState('soleado');
    const [emotionState, setEmotionState] = useState('soleado');
    const [bodyState, setBodyState] = useState('soleado');
    const [showDemoRitual, setShowDemoRitual] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [globalStats, setGlobalStats] = useState({ totalRegistros: 0, promedios: { mente: 0, emocion: 0, cuerpo: 0 } });

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.getStatsGlobales(); 
            if (res && res.data) setGlobalStats(res.data);
        } catch (error) { console.error("Error cargando stats:", error); }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const scrollTo = (id) => {
        setIsMobileMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFinishDemo = () => { setShowDemoRitual(false); fetchStats(); };

    // Navbar Links
    const NavLinks = ({ mobile = false }) => {
        const baseClass = mobile ? "block py-4 text-xl font-['Patrick_Hand'] text-zinc-600 border-b border-zinc-50" : "font-['Patrick_Hand'] text-lg text-zinc-500 hover:text-orange-500 transition-colors";
        const links = ['Tu Estado', 'Ciencia', 'El Hábito', 'Impacto'];
        const ids = ['estado', 'ciencia', 'como', 'impacto'];
        return (
            <>
                {links.map((item, index) => (
                    <button key={item} onClick={() => scrollTo(ids[index])} className={baseClass}>{item}</button>
                ))}
                <Link to="/filosofia" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}>Noticias</Link>
            </>
        );
    };

    return (
        <div className="bg-white min-h-screen text-zinc-800 relative overflow-x-hidden">
            
            {/* Modal del Ritual */}
            <AnimatePresence>
                {showDemoRitual && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-white/60 backdrop-blur-lg flex items-center justify-center p-4">
                        <button onClick={() => setShowDemoRitual(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg text-zinc-400 hover:text-red-500 border border-zinc-100"><X size={24} /></button>
                        <div className="w-full max-w-lg relative">
                             <RitualFlow mode="anon" onFinish={handleFinishDemo} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Navbar Fixed */}
            <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm transition-all">
                 <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
                    <Link to="/" className="flex items-center space-x-2 z-50 relative hover:scale-105 transition-transform shrink-0">
                        <Sun className="text-orange-500" size={28} />
                        <span className="font-['Patrick_Hand'] text-3xl font-bold text-zinc-800">Sun Self</span>
                    </Link>
                    
                    <div className="hidden md:flex items-center space-x-6"><NavLinks /></div>
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/login" className="bg-zinc-900 text-white font-['Patrick_Hand'] text-lg px-6 py-2 rounded-full hover:bg-zinc-800 hover:scale-105 transition-all">Ingresar</Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <Link to="/login" className="bg-zinc-900 text-white font-['Patrick_Hand'] text-sm px-4 py-2 rounded-full mr-3 hover:scale-105 transition-transform shadow-sm">Ingresar</Link>
                        <button className="p-2 text-zinc-600 z-50 relative" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-0 left-0 w-full h-screen bg-white flex flex-col pt-24 px-6 md:hidden shadow-xl">
                                <NavLinks mobile={true} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                 </nav>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 pt-24 md:pt-32">
                
                {/* HERO SECTION */}
                <section className="min-h-[85vh] flex flex-col items-center justify-center text-center relative -mt-20">
                    <HeroAnimationSequence />
                    <div className="relative z-10 px-4 mt-10">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                             <h2 className="text-5xl md:text-8xl font-bold mb-6 font-['Patrick_Hand'] text-zinc-800 drop-shadow-sm leading-tight">
                                ¿Cómo estás... <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">realmente</span>?
                            </h2>
                        </motion.div>
                        <motion.p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto font-light leading-relaxed mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            No es magia, es <strong>gestión cognitiva</strong>. <br className="hidden md:block"/> 
                            Sun Self es tu herramienta diaria para liberar memoria operativa.
                        </motion.p>
                        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} onClick={() => setShowDemoRitual(true)} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-['Patrick_Hand'] text-2xl px-10 py-4 rounded-full hover:shadow-2xl hover:-translate-y-1 transition-all shadow-lg flex items-center gap-3 mx-auto">
                            <Sparkles size={24} className="text-amber-200" /> Probar <strong>Micro-Hábito</strong>
                        </motion.button>
                    </div>
                    <motion.div className="absolute bottom-10 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, 10, 0] }} transition={{ delay: 1.5, duration: 2, repeat: Infinity }}>
                        <ArrowDown size={32} className="text-zinc-300" />
                    </motion.div>
                </section>

                {/* TU ESTADO */}
                <section id="estado" className="mb-32 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold mb-4 font-['Patrick_Hand'] text-zinc-800">Tu Clima Interno</h3>
                        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">Etiquetar tus afectos (Affect Labeling) reduce la actividad de la amígdala.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white/60 border border-blue-100 p-8 rounded-[2rem] shadow-lg">
                            <h4 className="text-3xl font-bold text-center mb-6 font-['Patrick_Hand'] text-blue-600">Mente</h4>
                            <div className="flex justify-center mb-6 gap-2"><StateButton lottieData={sunLoopAnimation} state="soleado" activeState={mindState} onSelect={setMindState}/><StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={mindState} onSelect={setMindState}/><StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={mindState} onSelect={setMindState}/></div>
                            <div className="h-20 relative"><StateDescription state={mindState} target="soleado" text="Mente Despejada" subtext="Claridad cognitiva." /><StateDescription state={mindState} target="nublado" text="Mente Nublada" subtext="Sobrecarga cognitiva." /><StateDescription state={mindState} target="lluvioso" text="Mente Lluviosa" subtext="Rumiación excesiva." /></div>
                        </div>
                        <div className="bg-white/60 border border-pink-100 p-8 rounded-[2rem] shadow-lg">
                            <h4 className="text-3xl font-bold text-center mb-6 font-['Patrick_Hand'] text-pink-600">Emoción</h4>
                            <div className="flex justify-center mb-6 gap-2"><StateButton lottieData={sunLoopAnimation} state="soleado" activeState={emotionState} onSelect={setEmotionState}/><StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={emotionState} onSelect={setEmotionState}/><StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={emotionState} onSelect={setEmotionState}/></div>
                            <div className="h-20 relative"><StateDescription state={emotionState} target="soleado" text="Alegre" subtext="Regulación positiva." /><StateDescription state={emotionState} target="nublado" text="Apático" subtext="Desconexión afectiva." /><StateDescription state={emotionState} target="lluvioso" text="Difícil" subtext="Alta reactividad." /></div>
                        </div>
                        <div className="bg-white/60 border border-green-100 p-8 rounded-[2rem] shadow-lg">
                            <h4 className="text-3xl font-bold text-center mb-6 font-['Patrick_Hand'] text-green-600">Cuerpo</h4>
                            <div className="flex justify-center mb-6 gap-2"><StateButton lottieData={sunLoopAnimation} state="soleado" activeState={bodyState} onSelect={setBodyState}/><StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={bodyState} onSelect={setBodyState}/><StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={bodyState} onSelect={setBodyState}/></div>
                            <div className="h-20 relative"><StateDescription state={bodyState} target="soleado" text="Energético" subtext="Recursos disponibles." /><StateDescription state={bodyState} target="nublado" text="Cansado" subtext="Baja energía." /><StateDescription state={bodyState} target="lluvioso" text="Adolorido" subtext="Tensión somática." /></div>
                        </div>
                    </div>
                </section>

                {/* CIENCIA */}
                <section id="ciencia" className="mb-10 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold mb-4 font-['Patrick_Hand'] text-zinc-800">Lo que dice la Ciencia</h3>
                        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">Basado en la Teoría de la Inhibición y el Etiquetado de Afectos.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ScienceCard icon={Zap} title="Memoria Operativa" highlight="Externalización Cognitiva" description="La rumiación consume tu 'RAM' mental. Al externalizar pensamientos, liberas recursos cognitivos para resolver problemas reales." colorClass={{ bg: 'bg-amber-100', text: 'text-amber-600' }}/>
                        <ScienceCard icon={Microscope} title="Regulación Neuronal" highlight="Etiquetado de Afectos" description="Poner nombre a una emoción ('Estoy ansioso') activa la corteza prefrontal y frena la amígdala, reduciendo la intensidad emocional." colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }}/>
                        <ScienceCard icon={ShieldCheck} title="Sistema Inmune" highlight="Teoría de la Inhibición" description="Reprimir emociones es un trabajo físico que agota al cuerpo. Al expresarlas, reasignas esa energía para fortalecer tus defensas." colorClass={{ bg: 'bg-green-100', text: 'text-green-600' }}/>
                    </div>
                </section>

                {/* --- APP SHOWCASE (MUESTRA LA APP) --- */}
                <AppShowcase />

                {/* EL HÁBITO (COMO) */}
                <section id="como" className="mb-32 scroll-mt-24 text-center">
                    <h3 className="text-4xl font-bold mb-12 font-['Patrick_Hand'] text-zinc-800">El Método de 2 Pasos</h3>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-10 relative">
                        <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-orange-100 to-amber-100 -z-10 border-t-2 border-dashed border-orange-200"></div>
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-sm w-full relative group hover:-translate-y-2 transition-transform duration-300 border border-zinc-50">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center absolute -top-7 left-1/2 -translate-x-1/2 text-orange-500 font-bold text-2xl border-4 border-orange-100 shadow-sm">1</div>
                            <div className="w-32 h-32 mx-auto mb-6"><Lottie animationData={brainLoopAnimation} loop={true} /></div>
                            <h4 className="text-2xl font-bold mb-3 font-['Patrick_Hand'] text-zinc-800">Verse</h4>
                            <p className="text-zinc-500 leading-relaxed">Registra tu estado con honestidad radical. Sin juicios, solo datos.</p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-sm w-full relative group hover:-translate-y-2 transition-transform duration-300 border border-zinc-50">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center absolute -top-7 left-1/2 -translate-x-1/2 text-amber-500 font-bold text-2xl border-4 border-amber-100 shadow-sm">2</div>
                            <div className="w-32 h-32 mx-auto mb-6"><Lottie animationData={goalLoopAnimation} loop={true} /></div>
                            <h4 className="text-2xl font-bold mb-3 font-['Patrick_Hand'] text-zinc-800">Actuar</h4>
                            <p className="text-zinc-500 leading-relaxed">Define una estrategia táctica. Convierte la observación en intención.</p>
                        </div>
                    </div>
                    <div className="mt-20">
                        <button onClick={() => setShowDemoRitual(true)} className="bg-zinc-800 text-white font-['Patrick_Hand'] text-xl px-12 py-5 rounded-full hover:bg-zinc-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3 mx-auto">
                            <Sparkles size={22} className="text-amber-300" /> Probar (Sin Registro)
                        </button>
                    </div>
                </section>

                {/* IMPACTO */}
                <section id="impacto" className="mb-20 md:mb-32">
                    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 shadow-inner border border-orange-100/50">
                        <h3 className="text-3xl md:text-4xl font-bold text-center mb-4 font-['Patrick_Hand'] text-zinc-800">Resultados en Tiempo Real</h3>
                        <p className="text-center text-zinc-600 mb-12">Datos agregados de la comunidad (anónimos).</p>
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
                            <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl text-center w-full max-w-[250px] md:w-64 md:h-64 flex flex-col justify-center items-center border border-zinc-50 relative shrink-0">
                                <div className="mb-2 opacity-20"><Users size={40} className="text-orange-500" /></div>
                                <span className="block text-6xl md:text-7xl font-black text-orange-500 font-['Patrick_Hand'] tracking-tighter leading-none">{globalStats.totalRegistros || 0}</span>
                                <span className="text-zinc-400 text-[10px] md:text-xs uppercase tracking-widest font-bold mt-2">Personas observadas</span>
                            </div>
                            <GlobalAverageBars averages={globalStats.promedios} />
                        </div>
                    </div>
                </section>

            </main>

            {/* FOOTER */}
            <footer className="text-center p-12 bg-white border-t border-zinc-100 relative z-10">
                <p className="text-zinc-400 text-sm font-['Patrick_Hand']">&copy; {new Date().getFullYear()} Sun Self. Construido con calma para mentes inquietas.</p>
            </footer>
        </div>
    );
}