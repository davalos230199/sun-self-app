import React, { useState, useEffect, useCallback } from 'react'; // <--- AQUÍ ESTABA EL ERROR (Faltaba useCallback)
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { ArrowDown, Brain, Heart, Shield, X, Sun, Sparkles, Users, Menu } from 'lucide-react'; // Agregué Menu para el responsive
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

// --- Importaciones de SVGs (Tus Assets Reales) ---
import brainIcon from '../assets/icons/brain.svg';
import emotionIcon from '../assets/icons/emotion.svg';
import bodyIcon from '../assets/icons/body.svg';

// --- Componentes ---
import InfoSlide from '../components/InfoSlide.jsx';
import RitualFlow from '../components/RitualFlow.jsx'; 

// --- Sub-componente: Botón de Estado ---
const StateButton = ({ lottieData, state, activeState, onSelect, 'aria-label': ariaLabel }) => {
    const isActive = activeState === state;
    let borderColor = 'border-transparent';
    let bgColor = 'bg-white';
    if (isActive) {
        if (state === 'soleado') { borderColor = 'border-amber-400'; bgColor = 'bg-amber-50'; }
        else if (state === 'nublado') { borderColor = 'border-blue-400'; bgColor = 'bg-blue-50'; }
        else if (state === 'lluvioso') { borderColor = 'border-gray-400'; bgColor = 'bg-gray-100'; }
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
    let bgColor = '', textColor = '', subtextColor = '';
    if (target === 'soleado') { bgColor = 'bg-amber-50'; textColor = 'text-amber-800'; subtextColor = 'text-amber-700'; }
    else if (target === 'nublado') { bgColor = 'bg-blue-50'; textColor = 'text-blue-800'; subtextColor = 'text-blue-700'; }
    else if (target === 'lluvioso') { bgColor = 'bg-gray-100'; textColor = 'text-gray-800'; subtextColor = 'text-gray-700'; }
    return (
        <AnimatePresence mode='wait'>
            {state === target && (
                <motion.div key={target} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-3 rounded-lg ${bgColor} absolute inset-0`}>
                    <p className={`font-semibold ${textColor}`}>{text}</p>
                    <p className={`text-sm ${subtextColor}`}>{subtext}</p>
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

// --- GRÁFICO ACTUALIZADO ---
const GlobalAverageBars = ({ averages }) => {
    const BarItem = ({ label, svgIcon, value, barColorClass }) => {
        return (
            <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-8">
                <div className="w-16 md:w-20 flex flex-col items-center justify-center shrink-0">
                    <img src={svgIcon} alt={label} className="w-10 h-10 md:w-12 md:h-12 mb-1 object-contain opacity-90" />
                    <span className="font-['Patrick_Hand'] text-zinc-500 text-sm md:text-base">{label}</span>
                </div>
                <div className="flex-1 relative h-10 md:h-14 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-inner overflow-hidden group">
                    <div className="absolute inset-0 flex pointer-events-none">
                        <div className="w-1/3 h-full border-r border-dashed border-zinc-200"></div>
                        <div className="w-1/3 h-full border-r border-dashed border-zinc-200"></div>
                    </div>
                    <motion.div 
                        className={`absolute top-1 bottom-1 left-1 md:top-2 md:bottom-2 md:left-2 rounded-xl shadow-sm opacity-90 ${barColorClass}`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${value}%` }} 
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-lg border border-zinc-100">
            <h4 className="text-center font-['Patrick_Hand'] text-xl md:text-2xl text-zinc-800 mb-6 md:mb-10">
                Promedio Global (Últimos 50)
            </h4>
            <div className="relative z-10 mb-2">
                <BarItem label="Mente" svgIcon={brainIcon} value={averages.mente || 0} barColorClass="bg-blue-400" />
                <BarItem label="Emoción" svgIcon={emotionIcon} value={averages.emocion || 0} barColorClass="bg-pink-400" />
                <BarItem label="Cuerpo" svgIcon={bodyIcon} value={averages.cuerpo || 0} barColorClass="bg-green-400" />
            </div>
            <div className="flex gap-3 md:gap-6 pl-[4rem] md:pl-[5rem]">
                <div className="flex-1 grid grid-cols-3 h-12 md:h-16 opacity-70 relative">
                     <div className="flex justify-center items-start pt-1">
                        <div className="w-10 h-10 md:w-14 md:h-14"><Lottie animationData={rainLoopAnimation} loop={true} /></div>
                     </div>
                     <div className="flex justify-center items-start pt-1">
                        <div className="w-10 h-10 md:w-14 md:h-14"><Lottie animationData={cloudLoopAnimation} loop={true} /></div>
                     </div>
                     <div className="flex justify-center items-start pt-1">
                        <div className="w-10 h-10 md:w-14 md:h-14"><Lottie animationData={sunLoopAnimation} loop={true} /></div>
                     </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL: LANDING ---
export default function Landing() {
    const [mindState, setMindState] = useState('soleado');
    const [emotionState, setEmotionState] = useState('soleado');
    const [bodyState, setBodyState] = useState('soleado');
    const [expandedBenefit, setExpandedBenefit] = useState(null);
    const [showDemoRitual, setShowDemoRitual] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const [globalStats, setGlobalStats] = useState({ 
        totalRegistros: 0, 
        promedios: { mente: 0, emocion: 0, cuerpo: 0 } 
    });

    // 1. DEFINICIÓN DE FETCHSTATS CON USECALLBACK
    const fetchStats = useCallback(async () => {
        try {
            const res = await api.getStatsGlobales(); 
            if (res && res.data) {
                setGlobalStats(res.data);
            }
        } catch (error) {
            console.error("Error cargando stats:", error);
        }
    }, []);

    // 2. LLAMADA INICIAL
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleBenefitToggle = (id) => setExpandedBenefit(prevId => (prevId === id ? null : id));
    
    const scrollTo = (id) => {
        setIsMobileMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFinishDemo = () => {
        setShowDemoRitual(false);
        // 3. RECARGA AL FINALIZAR
        fetchStats(); 
    };

    // --- Navbar Links ---
    const NavLinks = ({ mobile = false }) => {
        const baseClass = mobile 
            ? "block py-4 text-xl font-['Patrick_Hand'] text-zinc-600 border-b border-zinc-50" 
            : "font-['Patrick_Hand'] text-lg text-zinc-500 hover:text-orange-500 transition-colors";
        
        return (
            <>
                {['Tu Estado', 'Beneficios', 'El Hábito', 'Impacto'].map((item, index) => {
                    const ids = ['estado', 'beneficios', 'como', 'impacto'];
                    return (
                        <button key={item} onClick={() => scrollTo(ids[index])} className={baseClass}>
                            {item}
                        </button>
                    )
                })}
                <Link to="/filosofia" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}>
                    Noticias
                </Link>
            </>
        );
    };

    return (
        <div className="bg-white min-h-screen text-zinc-800 relative overflow-x-hidden">
            
            {/* FAB y Modales */}
            <motion.button onClick={() => setShowDemoRitual(true)} className="fixed bottom-6 right-6 z-40 bg-amber-400 text-white p-4 rounded-full shadow-2xl border-4 border-white flex items-center justify-center group ring-4 ring-amber-100/50">
                <Sun size={32} className="text-white relative z-10 fill-amber-100" strokeWidth={2.5} />
            </motion.button>

             <AnimatePresence>
                {showDemoRitual && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-white/60 backdrop-blur-lg flex items-center justify-center p-4">
                        <button onClick={() => setShowDemoRitual(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg text-zinc-400 hover:text-red-500 border border-zinc-100"><X size={24} /></button>
                        <div className="w-full max-w-lg relative"><RitualFlow mode="anon" onFinish={handleFinishDemo} /></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- NAVBAR FIJO (FIXED) --- */}
            <header className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">
                 <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
                    
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 z-50 relative">
                        <Sun className="text-orange-500" size={28} />
                        <span className="font-['Patrick_Hand'] text-3xl font-bold text-zinc-800">Sun Self</span>
                    </Link>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <NavLinks />
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/login" className="bg-zinc-900 text-white font-['Patrick_Hand'] text-lg px-6 py-2 rounded-full hover:scale-105 transition-transform">Ingresar</Link>
                    </div>

                    {/* Mobile Burger Button */}
                    <button 
                        className="md:hidden p-2 text-zinc-600 z-50 relative"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>

                    {/* Mobile Menu Overlay */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute top-0 left-0 w-full h-screen bg-white flex flex-col pt-24 px-6 md:hidden shadow-xl"
                            >
                                <NavLinks mobile={true} />
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-6 w-full bg-zinc-900 text-white font-['Patrick_Hand'] text-xl py-4 rounded-full text-center shadow-lg">
                                    Ingresar
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                 </nav>
            </header>

            {/* Padding Top compensatorio para el Header Fijo */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 pt-24 md:pt-32">              
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
                            <strong>Sun Self</strong> es tu micro-hábito diario de calma y estrategia.
                        </motion.p>
                        
                        <motion.button
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.5 }}
                             onClick={() => setShowDemoRitual(true)}
                             className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-['Patrick_Hand'] text-2xl px-10 py-4 rounded-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg flex items-center gap-3 mx-auto"
                        >
                            <Sparkles size={24} className="text-amber-200" />
                            Probar <strong>Micro-Hábito</strong>
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
                        <h3 className="text-4xl font-bold mb-4 font-['Patrick_Hand'] text-zinc-800">Tu Clima Interno</h3>
                        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
                            Antes de actuar, observate. Hace click para explorar los estados.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Cards (Mente, Emocion, Cuerpo) */}
                        <motion.div className="bg-white/60 backdrop-blur-sm border border-blue-100 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h4 className="text-3xl font-bold text-center mb-8 font-['Patrick_Hand'] text-blue-600">Mente</h4>
                            <div className="flex justify-center mb-8 gap-2">
                                <StateButton lottieData={sunLoopAnimation} state="soleado" activeState={mindState} onSelect={setMindState} />
                                <StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={mindState} onSelect={setMindState} />
                                <StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={mindState} onSelect={setMindState} />
                            </div>
                            <div className="h-[80px] relative">
                                <StateDescription state={mindState} target="soleado" text="Tenes la mente Despejada" subtext="Pensamientos claros, enfoque y optimismo." />
                                <StateDescription state={mindState} target="nublado" text="Tenes la mente Nublada" subtext="Dispersión, niebla mental o indecisión." />
                                <StateDescription state={mindState} target="lluvioso" text="Tenes la mente Lluviosa" subtext="Rumiación, negatividad o agobio." />
                            </div>
                        </motion.div>

                        <motion.div className="bg-white/60 backdrop-blur-sm border border-pink-100 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                            <h4 className="text-3xl font-bold text-center mb-8 font-['Patrick_Hand'] text-pink-600">Emoción</h4>
                            <div className="flex justify-center mb-8 gap-2">
                                <StateButton lottieData={sunLoopAnimation} state="soleado" activeState={emotionState} onSelect={setEmotionState} />
                                <StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={emotionState} onSelect={setEmotionState} />
                                <StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={emotionState} onSelect={setEmotionState} />
                            </div>
                             <div className="h-[80px] relative">
                                <StateDescription state={emotionState} target="soleado" text="Te sentís Alegre" subtext="Gratitud, paz o amor." />
                                <StateDescription state={emotionState} target="nublado" text="Te sentís Apático" subtext="Aburrimiento, desconexión o plano." />
                                <StateDescription state={emotionState} target="lluvioso" text="Te sentís Difícil" subtext="Tristeza, enojo, miedo o ansiedad." />
                            </div>
                        </motion.div>

                        <motion.div className="bg-white/60 backdrop-blur-sm border border-green-100 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                            <h4 className="text-3xl font-bold text-center mb-8 font-['Patrick_Hand'] text-green-600">Cuerpo</h4>
                            <div className="flex justify-center mb-8 gap-2">
                                <StateButton lottieData={sunLoopAnimation} state="soleado" activeState={bodyState} onSelect={setBodyState} />
                                <StateButton lottieData={cloudLoopAnimation} state="nublado" activeState={bodyState} onSelect={setBodyState} />
                                <StateButton lottieData={rainLoopAnimation} state="lluvioso" activeState={bodyState} onSelect={setBodyState} />
                            </div>
                             <div className="h-[80px] relative">
                                <StateDescription state={bodyState} target="soleado" text="Te sentís Energético" subtext="Vitalidad y fuerza." />
                                <StateDescription state={bodyState} target="nublado" text="Te sentís Cansado" subtext="Fatiga o pesadez." />
                                <StateDescription state={bodyState} target="lluvioso" text="Te sentís Adolorido" subtext="Tensión, dolor o malestar." />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- BENEFICIOS --- */}
                <section id="beneficios" className="mb-32 scroll-mt-24">
                     <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="w-full md:w-1/2">
                             <h3 className="text-4xl font-bold mb-6 font-['Patrick_Hand'] text-zinc-800">Neuro-Ciencia, no Magia</h3>
                             <p className="text-zinc-600 text-lg mb-8 leading-relaxed">
                                El acto de externalizar tus pensamientos libera memoria operativa y reduce la carga fisiológica del estrés. Es como limpiar el caché de tu mente.
                             </p>
                             <div className="space-y-4">
                                <InfoSlide icon={Brain} title="Claridad Mental" isExpanded={expandedBenefit === 'mental'} onToggle={() => handleBenefitToggle('mental')}>
                                    <p>Libera tu "RAM" mental. Al descargar pensamientos en bucle, recuperas capacidad para resolver problemas reales.</p>
                                </InfoSlide>
                                <InfoSlide icon={Heart} title="Regulación Emocional" isExpanded={expandedBenefit === 'emocional'} onToggle={() => handleBenefitToggle('emocional')}>
                                    <p>Nombrar una emoción ("Etiquetado de Afectos") calma la amígdala y activa tu corteza prefrontal.</p>
                                </InfoSlide>
                                <InfoSlide icon={Shield} title="Salud Física" isExpanded={expandedBenefit === 'fisico'} onToggle={() => handleBenefitToggle('fisico')}>
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
                        <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-orange-100 to-amber-100 -z-10 border-t-2 border-dashed border-orange-200"></div>
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-sm w-full relative group hover:-translate-y-2 transition-transform duration-300 border border-zinc-50">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center absolute -top-7 left-1/2 -translate-x-1/2 text-orange-500 font-bold text-2xl border-4 border-orange-100 shadow-sm">1</div>
                            <div className="w-32 h-32 mx-auto mb-6"><Lottie animationData={brainLoopAnimation} loop={true} /></div>
                            <h4 className="text-2xl font-bold mb-3 font-['Patrick_Hand'] text-zinc-800">Verse</h4>
                            <p className="text-zinc-500 leading-relaxed">Registra tu estado con honestidad.<br /> Sin juicios, solo datos.</p>
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
                            <Sparkles size={22} className="text-amber-300" />
                            Probar (Sin Registro)
                        </button>
                    </div>
                </section>

                {/* --- IMPACTO (CONTADOR + GRÁFICO) --- */}
                <section id="impacto" className="mb-20 md:mb-32">
                    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 shadow-inner border border-orange-100/50">
                        <h3 className="text-3xl md:text-4xl font-bold text-center mb-4 font-['Patrick_Hand'] text-zinc-800">Micro-Habitos probados</h3>
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
                            <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl text-center w-full max-w-[250px] md:w-64 md:h-64 flex flex-col justify-center items-center border border-zinc-50 relative shrink-0">
                                <div className="mb-2 opacity-20"><Users size={40} className="text-orange-500" /></div>
                                <span className="block text-6xl md:text-7xl font-black text-orange-500 font-['Patrick_Hand'] tracking-tighter leading-none">
                                    {globalStats.totalRegistros || 0}
                                </span>
                                <span className="text-zinc-400 text-[10px] md:text-xs uppercase tracking-widest font-bold mt-2">Personas se han observado</span>
                                <div className="w-1/2 h-1 bg-zinc-100 mt-4 rounded-full overflow-hidden mx-auto">
                                    <div className="w-full h-full bg-orange-400 rounded-full"></div>
                                </div>
                            </div>
                            <GlobalAverageBars averages={globalStats.promedios} />
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