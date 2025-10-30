import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDia } from '../contexts/DiaContext';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import NotaExpandida from './NotaExpandida'; 
import NotaDiario from './NotaDiario';

// --- Animaciones ---
import brainLoopAnimation from '../assets/animations/brain-loop.json';
import emotionLoopAnimation from '../assets/animations/emotion-loop.json';
import bodyLoopAnimation from '../assets/animations/body-loop.json';
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import Lottie from 'lottie-react';

// --- Iconos ---
import { User, Sun, CheckCircle, Zap, LayoutDashboard, BarChart3, Check, X } from 'lucide-react';

// --- Componentes Base de Cajas (Con Estilo Unificado) ---
const CajaBoton = ({ onClick, children }) => (
    <button 
        onClick={onClick}
        className="aspect-square bg-white border border-zinc-200 rounded-2xl shadow-lg 
                   flex flex-col items-center justify-center p-4 
                   text-zinc-700 hover:bg-zinc-50 transition-colors"
    >
        {children}
    </button>
);

const CajaLink = ({ to, children }) => (
    <Link 
        to={to}
        className="aspect-square bg-white border border-zinc-200 rounded-2xl shadow-lg 
                   flex flex-col items-center justify-center p-4 
                   text-zinc-700 hover:bg-zinc-50 transition-colors no-underline"
    >
        {children}
    </Link>
);

// --- Componentes de Modales (Con 'X' Arreglado) ---

const ModalTu = ({ registro, onDeselect }) => {
    const ComentarioItem = ({ anim, text }) => (
        <div className="flex items-center gap-2 text-left">
            <div className="w-10 h-10 flex-shrink-0 -ml-1">
                <Lottie animationData={anim} loop={true} />
            </div>
            <p className="text-lg font-['Patrick_Hand'] lowercase italic text-zinc-700">"{text || '...'}"</p>
        </div>
    );

    return (
        <motion.div
            layout
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg relative"
        >
            <motion.div
                className="rounded-2xl p-6 shadow-2xl bg-white border-2 border-amber-300"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <h2 className="font-['Patrick_Hand'] text-2xl text-amber-800 mb-4">Tus Palabras</h2>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    <ComentarioItem anim={brainLoopAnimation} text={registro.mente_comentario} />
                    <ComentarioItem anim={emotionLoopAnimation} text={registro.emocion_comentario} />
                    <ComentarioItem anim={bodyLoopAnimation} text={registro.cuerpo_comentario} />
                </div>
            </motion.div>
            
            <button 
                onClick={onDeselect} 
                className="absolute -top-2 -right-2 p-2 rounded-full bg-white shadow-lg border border-zinc-200 hover:bg-zinc-100 transition-colors"
            >
                <X size={20} className="text-zinc-600" />
            </button>
        </motion.div>
    );
};

const ModalSunny = ({ registro, onDeselect }) => {
    const anim = registro.estado_general === 'soleado' ? sunLoopAnimation : registro.estado_general === 'lluvioso' ? rainLoopAnimation : cloudLoopAnimation;
    
    return (
        <motion.div
            layout
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg relative"
        >
            <motion.div
                className="rounded-2xl p-6 shadow-2xl bg-white border-2 border-amber-300"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24">
                        <Lottie animationData={anim} loop={true} />
                    </div>
                    <h2 className="font-['Patrick_Hand'] text-2xl text-amber-800">El Mensaje de Sunny</h2>
                    <p className="font-['Patrick_Hand'] text-lg text-zinc-700 italic mt-2">
                        "{registro.frase_sunny}"
                    </p>
                </div>
            </motion.div>
            
            <button 
                onClick={onDeselect} 
                className="absolute -top-2 -right-2 p-2 rounded-full bg-white shadow-lg border border-zinc-200 hover:bg-zinc-100 transition-colors"
            >
                <X size={20} className="text-zinc-600" />
            </button>
        </motion.div>
    );
};

const CarruselPostits = ({ onNotaSelect }) => {
    const [entradas, setEntradas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const response = await api.getDiarioHistoricalDay(); 
                setEntradas(response.data || []);
            } catch (err) {
                console.error("Error cargando post-its históricos:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistorial();
    }, []);

    if (isLoading || entradas.length === 0) {
        return null;
    }

    return (
        // [ESTILO] Fondo 'bg-slate-100', 'gap-3' y 'p-3'
        <div className="w-full overflow-x-auto scrollbar-hide flex gap-3 p-3 snap-x snap-mandatory bg-slate-100 rounded-xl shadow-inner">
            <AnimatePresence>
                {entradas.map(entrada => (
                    // --- [LA MAGIA] ---
                    // 1. Usamos el componente 'NotaDiario' real.
                    // 2. Le damos un 'flex-shrink-0' y un 'w-32' (128px) para que
                    //    sea "fino" y mantenga su altura de 'h-40' (160px).
                    <div key={entrada.id} className="flex-shrink-0 w-24 snap-start"> 
                        <NotaDiario 
                            entrada={entrada} 
                            onSelect={onNotaSelect} 
                            // No le pasamos 'onDelete', así que no mostrará el botón Pin
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

// --- [COMPONENTE 2] Próxima Meta (Estilo Corregido) ---
const ProximaMetaWidget = () => {
    const { metas, setMetas } = useDia();
    const proximaMeta = metas.find(m => !m.completada);

    const handleCompletarMeta = async (metaId) => {
        const metasOriginales = [...metas];
        setMetas(prev => prev.map(m => m.id === metaId ? { ...m, completada: true } : m));
        try {
            await api.updateMeta(metaId, { completada: true });
        } catch (error) {
            console.error("Error al completar meta", error);
            setMetas(metasOriginales);
        }
    };

    if (!proximaMeta) {
        return (
            <Link to="/app/metas" className="no-underline text-inherit block">
                <div className="relative flex items-center justify-center p-4 rounded-xl shadow-md bg-green-50 border border-green-200 text-green-700 font-semibold">
                    ¡No hay más metas! Añade una nueva.
                </div>
            </Link>
        );
    }

    return (
        // --- [ESTILO] Coherente con MetasPage ('bg-amber-50') ---
        <div className="relative flex items-center p-4 rounded-xl shadow-md bg-amber-50 border border-amber-200">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-amber-500"></div>
            
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleCompletarMeta(proximaMeta.id);
                }}
                className="flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 bg-white border-zinc-300 hover:border-amber-500 cursor-pointer"
            >
                {/* Vacío */}
            </button>
            
            <Link to="/app/metas" className="flex-grow ml-4 no-underline text-inherit">
                <p className="font-['Patrick_Hand'] text-lg text-amber-800">{proximaMeta.descripcion}</p>
                {proximaMeta.hora_objetivo && (
                    <span className="text-xs text-zinc-500 italic">{proximaMeta.hora_objetivo.substring(0, 5)}hs</span>
                )}
            </Link>
        </div>
    );
};


// --- El Componente Principal (La Grilla) ---
export default function DashboardCajas({ onEdit }) {
    const { registroDeHoy, theme } = useDia(); 
    const [modalActivo, setModalActivo] = useState(null);
    const [notaExpandida, setNotaExpandida] = useState(null);

    if (!registroDeHoy) return <LoadingSpinner message="Cargando..." />;

    const renderModal = () => {
        switch (modalActivo) {
            case 'tu':
                return <ModalTu registro={registroDeHoy} onDeselect={() => setModalActivo(null)} />;
            case 'sunny':
                return <ModalSunny registro={registroDeHoy} onDeselect={() => setModalActivo(null)} />;
            default:
                return null;
        }
    };

    return (
        // Aplicamos el theme.bg
        <div className="h-full flex flex-col p-4 space-y-4">
            <div className="flex-shrink-0">
                <ProximaMetaWidget />
            </div>

            {/* 3. "El Panel del Arquitecto" (Grilla) */}
            <div className="flex-grow grid grid-cols-2 gap-4">
                
                <CajaBoton onClick={() => setModalActivo('tu')}>
                    <User size={32} />
                    <span className="mt-2 font-['Patrick_Hand'] text-lg">TU</span>
                </CajaBoton>
                
                <CajaBoton onClick={() => setModalActivo('sunny')}>
                    <Sun size={32} />
                    <span className="mt-2 font-['Patrick_Hand'] text-lg">Sunny</span>
                </CajaBoton>
                
                <CajaLink to="/app/metas">
                    <CheckCircle size={32} />
                    <span className="mt-2 font-['Patrick_Hand'] text-lg">Metas</span>
                </CajaLink>
                
                <CajaBoton onClick={onEdit}>
                    <Zap size={32} />
                    <span className="mt-2 font-['Patrick_Hand'] text-lg">Micro-Hábito</span>
                </CajaBoton>
                
                <CajaLink to={`/app/journal/${registroDeHoy.id}`}>
                    <LayoutDashboard size={32} />
                    <span className="mt-2 font-['Patrick_Hand'] text-lg">Tablero</span>
                </CajaLink>
                
                <CajaLink to="/app/tracking">
                    <BarChart3 size={32} />
                    <span className="mt-2 font-['Patrick_Hand'] text-lg">Tracking</span>
                </CajaLink>
                
            </div>

            {/* Contenedor de Modales (para TU, Sunny y NotaExpandida) */}
            <AnimatePresence>
                {modalActivo && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setModalActivo(null)}
                    >
                        {renderModal()}
                    </motion.div>
                )}

                {/* Modal para el carrusel de Post-its */}
                {notaExpandida && (
                    <NotaExpandida 
                        entrada={notaExpandida} 
                        onDeselect={() => setNotaExpandida(null)} 
                    />
                )}
            </AnimatePresence>
                       {/* 1. "El Hilo del Tiempo" (Carrusel) */}
            <div className="flex-shrink-0">
                <CarruselPostits onNotaSelect={setNotaExpandida} />
            </div>
        </div>
    );
}