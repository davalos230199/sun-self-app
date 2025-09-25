import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Lottie from 'lottie-react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Importamos todas las animaciones necesarias
import sunRevealAnimation from '../assets/animations/sun-reveal.json';
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudRevealAnimation from '../assets/animations/cloud-reveal.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainRevealAnimation from '../assets/animations/rain-reveal.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';

// Definimos el ciclo de animaciones
const animationCycle = [
    { reveal: sunRevealAnimation, loop: sunLoopAnimation },
    { reveal: cloudRevealAnimation, loop: cloudLoopAnimation },
    { reveal: rainRevealAnimation, loop: rainLoopAnimation },
];

export default function Auth() {
    const { signInWithGoogle } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Estado para gestionar el ciclo de animación
    const [cycleIndex, setCycleIndex] = useState(0);
    const [currentAnimation, setCurrentAnimation] = useState(animationCycle[0].reveal);
    const [isLooping, setIsLooping] = useState(false);

    useEffect(() => {
        // Este efecto gestiona la transición entre los loops de animación
        let timer;
        if (isLooping) {
            // Duración de cada estado climático en loop (en milisegundos)
            timer = setTimeout(() => {
                setIsLooping(false);
                const nextIndex = (cycleIndex + 1) % animationCycle.length;
                setCycleIndex(nextIndex);
                setCurrentAnimation(animationCycle[nextIndex].reveal);
            }, 7000); // 4 segundos de loop
        }
        // Limpiamos el temporizador al desmontar el componente o si cambia el estado
        return () => clearTimeout(timer);
    }, [isLooping, cycleIndex]);

    const handleAnimationComplete = () => {
        if (!isLooping) {
            setIsLooping(true);
            setCurrentAnimation(animationCycle[cycleIndex].loop);
        }
    };

    const panelStyles = "h-screen w-full snap-start flex flex-col justify-center items-center p-8 text-center relative bg-transparent";
    const headerStyles = "text-4xl sm:text-5xl uppercase font-semibold text-orange-600 mb-4 font-['Patrick_Hand']";
    const paragraphStyles = "max-w-xl text-lg sm:text-xl text-zinc-700 leading-relaxed font-['Patrick_Hand']";

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 font-sans h-screen w-full relative">
            {/* --- CAPA DE FONDO FIJA --- */}
            <div className="absolute inset-0 z-0 flex justify-center items-center opacity-25 pointer-events-none">
                <Lottie 
                    animationData={currentAnimation} 
                    loop={isLooping}
                    onComplete={handleAnimationComplete}
                    style={{ width: '100%', maxWidth: '800px' }} 
                />
            </div>
            
            {/* --- CAPA DE CONTENIDO DESLIZABLE --- */}
            <div className="relative z-10 h-screen snap-y snap-mandatory overflow-y-scroll">
                <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-white/30 backdrop-blur-md">
                    <div className="w-10"></div>
                    <h1 className="font-['Patrick_Hand'] text-4xl font-bold text-orange-600">
                        Sun Self
                    </h1>
                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="bg-transparent border-none text-orange-600 hover:text-orange-800 transition-colors focus:outline-none z-20 relative"
                        >
                            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                        </button>
                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-12 right-0 w-48 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl overflow-hidden"
                                >
                                    <ul className="p-2">
                                        <li>
                                            <a href="#" className="block px-4 py-2 text-zinc-700 rounded-md hover:bg-orange-100 transition-colors">
                                                Filosofía
                                            </a>
                                        </li>
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                <section className={panelStyles}>
                    <div className="flex flex-col items-center">
                        <h1 className={headerStyles}>Observa tu presente.</h1>
                        <h2 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-6">Construí tu futuro.</h2>
                        <p className={paragraphStyles}>
                            Sun Self es una herramienta de auto-observación diaria. Un micro-hábito simple para registrar tu estado mental, emocional y físico. Esta claridad es la base para construir <strong>hábitos que perduran</strong>.
                        </p>
                        <div className="absolute bottom-8 animate-bounce">
                            <ChevronDown className="w-8 h-8 text-orange-400" />
                        </div>
                    </div>
                </section>

                <section className={panelStyles}>
                     <div className="flex flex-col items-center">
                        <h2 className={headerStyles}>De datos a decisiones.</h2>
                        <p className={paragraphStyles}>
                             Cada registro se convierte en data procesable. Identifica patrones, entiende tus fluctuaciones y usa esa información para tomar mejores decisiones. Convierte la introspección en <strong>estrategia personal</strong>.
                        </p>
                        <div className="absolute bottom-8 animate-bounce">
                            <ChevronDown className="w-8 h-8 text-orange-400" />
                        </div>
                    </div>
                </section>

                <section className={panelStyles}>
                     <div className="flex flex-col items-center">
                        <h2 className={headerStyles}>Define tu día. Domina tu progreso.</h2>
                        <p className={`${paragraphStyles} mb-12`}>
                            Usa la claridad obtenida para establecer metas diarias alcanzables. Sun Self te ayuda a conectar tu estado actual con tus objetivos futuros, convirtiendo cada acción en un <strong>resultado medible</strong>.
                        </p>
                        <button
                            onClick={signInWithGoogle}
                            className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold py-4 font-['Patrick_Hand'] px-8 rounded-full text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out flex items-center justify-center mx-auto"
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" className="w-6 h-6 mr-3"/>
                            Dar el primer paso con Google
                        </button>
                     </div>
                     <footer className="absolute bottom-4 text-center text-zinc-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} Sun Self. Micro-Hábito.</p>
                    </footer>
                </section>
            </div>
        </div>
    );
}

