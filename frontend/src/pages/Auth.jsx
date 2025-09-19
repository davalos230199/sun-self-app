import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, LogIn } from 'lucide-react';

// --- Componente Header Fijo (Aparece al hacer scroll) ---
const FixedHeader = ({ isVisible, onLogin }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.header
                    initial={{ y: '-100%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-white/80 backdrop-blur-md shadow-md"
                >
                    <h1 className="font-['Patrick_Hand'] text-2xl font-bold text-orange-600">
                        Sun Self
                    </h1>
                    <button
                        onClick={onLogin}
                        className="bg-orange-500 text-white font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2 hover:bg-orange-600 transition-colors"
                    >
                        <LogIn size={16} />
                        Iniciar Viaje
                    </button>
                </motion.header>
            )}
        </AnimatePresence>
    );
};

// --- Componente Principal: Auth (Landing Page) ---
export default function Auth() {
    const { signInWithGoogle } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, clientHeight } = container;
            // El header aparece después de scrollear un 20% de la primera pantalla
            setIsScrolled(scrollTop > clientHeight * 0.2);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        {
            title: "¿Qué es Sun Self?",
            content: "Una herramienta para la auto-observación y el autoconocimiento. Un micro-hábito diario diseñado para que te reencuentres con la persona más importante en tu vida: tú mismo."
        },
        {
            title: "¿Cómo funciona?",
            content: "Cada día, la app te invita a responder: '¿Cómo estás hoy?' usando tres estados climáticos: Soleado (bien), Nublado (regular) o Lluvioso (mal). Esta simple práctica te ancla en tu presente."
        },
        {
            title: "Tu espacio, tus reglas",
            content: "Decide si quieres guardar tus registros para un análisis profundo o empezar de cero cada día. La privacidad y el control están en tus manos."
        }
    ];

    return (
        <div ref={scrollContainerRef} className="h-[100dvh] w-full overflow-y-scroll scroll-snap-type-y-mandatory">
            <FixedHeader isVisible={isScrolled} onLogin={signInWithGoogle} />

            {/* --- Sección 1: Bienvenida (Hero) --- */}
            <section className="h-full w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-100 scroll-snap-align-start relative">
                <div className="text-center">
                    <h1 className="font-['Patrick_Hand'] text-6xl sm:text-8xl font-bold text-orange-600 animate-fade-in-down">
                        Sun Self
                    </h1>
                    <p className="text-xl sm:text-2xl mt-2 text-zinc-600 animate-fade-in-up">
                        Tu micro-hábito de auto-observación.
                    </p>
                    <motion.button
                        onClick={signInWithGoogle}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex items-center justify-center mx-auto mt-12"
                    >
                        <img src="https://rotulosmatesanz.com/wp-content/uploads/2017/09/2000px-Google_G_Logo.svg_.png" alt="Logo de Google" className="w-6 h-6 mr-3"/>
                        Iniciar el viaje con Google
                    </motion.button>
                </div>
                <div className="absolute bottom-8 text-zinc-500 animate-bounce">
                    <ArrowDown size={24} />
                </div>
            </section>

            {/* --- Secciones de Información (Generadas dinámicamente) --- */}
            {sections.map((section, index) => (
                <section key={index} className="h-full w-full flex flex-col items-center justify-center p-6 bg-white scroll-snap-align-start text-center">
                    <div className="max-w-2xl">
                        <h2 className="font-['Patrick_Hand'] text-4xl sm:text-5xl font-bold text-zinc-800 mb-6">
                            {section.title}
                        </h2>
                        <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed">
                            {section.content}
                        </p>
                    </div>
                </section>
            ))}

            {/* --- Sección Final: Llamada a la Acción --- */}
            <section className="h-full w-full flex flex-col items-center justify-center p-4 bg-zinc-800 scroll-snap-align-start text-center text-white">
                 <h2 className="font-['Patrick_Hand'] text-4xl sm:text-5xl font-bold mb-8">
                    ¿Listo para empezar a conocerte mejor?
                </h2>
                <motion.button
                    onClick={signInWithGoogle}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex items-center justify-center mx-auto"
                >
                    <img src="https://rotulosmatesanz.com/wp-content/uploads/2017/09/2000px-Google_G_Logo.svg_.png" alt="Logo de Google" className="w-6 h-6 mr-3"/>
                    Iniciar el viaje ahora
                </motion.button>
            </section>

        </div>
    );
}
