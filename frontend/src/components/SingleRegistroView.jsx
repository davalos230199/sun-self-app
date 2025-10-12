import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Copy, Check, TrendingUp } from 'lucide-react'; // Agregamos Copy y Check
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

// Animaciones existentes
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';
import brainLoopAnimation from '../assets/animations/brain-loop.json';
import emotionLoopAnimation from '../assets/animations/emotion-loop.json';
import bodyLoopAnimation from '../assets/animations/body-loop.json';

// ============================================================
// 🆕 COMPONENTE NUEVO: Post-it de Solo Lectura
// ============================================================
const NotaDiarioReadOnly = ({ entrada }) => {
    const [copiado, setCopiado] = useState(false);
    const [rotacion] = useState(() => Math.random() * (4 - -4) + -4);
    
    const prioridadColores = {
        alta: 'bg-red-200/70 border-red-400',
        media: 'bg-yellow-200/70 border-yellow-400',
        baja: 'bg-green-100/70 border-green-300',
    };
    const colorClase = prioridadColores[entrada.prioridad] || prioridadColores.baja;
    
    const fecha = new Date(entrada.created_at);
    const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const fechaFormateada = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
    
    const copiarTexto = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(entrada.texto);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch (error) {
            console.error('Error al copiar:', error);
        }
    };
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 2, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 900, damping: 50 }}
            className={`h-40 rounded-md p-3 shadow-md flex flex-col ${colorClase}`}
            style={{ rotate: `${rotacion}deg` }}
        >
            <div className="flex justify-between items-start">
                <p className="text-[9px] font-semibold text-zinc-500 italic">
                    {fechaFormateada} - {horaFormateada}hs
                </p>
                <button 
                    onClick={copiarTexto}
                    className="p-1 -mr-1 -mt-1 text-zinc-400 hover:text-blue-500 border-none transition-colors"
                    title="Copiar texto"
                >
                    {copiado ? (
                        <Check size={16} className="text-green-500" />
                    ) : (
                        <Copy size={16} />
                    )}
                </button>
            </div>
            <p className="text-zinc-800 text-xs italic lowercase line-clamp-5 pt-1">
                {entrada.texto}
            </p>
        </motion.div>
    );
};

// ============================================================
// 🎨 COMPONENTE PRINCIPAL: SingleRegistroView
// ============================================================
export default function SingleRegistroView({ registro }) {
    // 🆕 Estados para los post-its
    const [postIts, setPostIts] = useState([]);
    const [isLoadingPostIts, setIsLoadingPostIts] = useState(true);

    // 🆕 Efecto para cargar los post-its de este registro
    useEffect(() => {
        const fetchPostIts = async () => {
            if (!registro?.id) return;
            
            setIsLoadingPostIts(true);
            try {
                const response = await api.getDiarioPorRegistro(registro.id);
                setPostIts(response.data || []);
            } catch (error) {
                console.error('Error al cargar los post-its del día:', error);
                setPostIts([]); // Si falla, mostramos vacío
            } finally {
                setIsLoadingPostIts(false);
            }
        };

        fetchPostIts();
    }, [registro?.id]); // Se ejecuta cada vez que cambia el registro

    // 🆕 Función para obtener el gradiente según el clima
    const getGradientePorClima = (estadoGeneral) => {
        switch (estadoGeneral) {
            case 'soleado':
                // Amarillo cálido → Naranja → Ámbar
                return 'bg-gradient-to-b from-yellow-200 via-orange-200 to-amber-300';
            case 'lluvioso':
                // Gris → Azul clarito (frío)
                return 'bg-gradient-to-b from-gray-300 via-blue-200 to-blue-300';
            case 'nublado':
            default:
                // Gris claro → Gris medio → Azul marino suave
                return 'bg-gradient-to-b from-gray-200 via-gray-300 to-slate-400';
        }
    };

    // Obtener la animación correcta según el clima
    const getAnimacionClima = (estadoGeneral) => {
        if (estadoGeneral === 'soleado') return sunLoopAnimation;
        if (estadoGeneral === 'lluvioso') return rainLoopAnimation;
        return cloudLoopAnimation;
    };

    if (!registro) {
        return <div className="text-center text-zinc-500 p-4">No hay registro disponible</div>;
    }

    // 🆕 Obtenemos el gradiente según el clima del día
    const gradienteClima = getGradientePorClima(registro.estado_general);
    const animacionClima = getAnimacionClima(registro.estado_general);

    return (
        // 🆕 Aplicamos el gradiente al contenedor principal
        <div className={`h-full overflow-y-auto space-y-6 p-4 ${gradienteClima} animate-fade-in`}>
            
            {/* ========== SECCIÓN 1: META DEL DÍA ========== */}
            {registro.meta_principal_id && (
                <div className="bg-green-100 border border-green-400 rounded-2xl p-4 text-center shadow-lg">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <h2 className="font-['Patrick_Hand'] text-lg text-amber-800">Meta del Día</h2>
                        <TrendingUp className="text-amber-800" size={24} />
                    </div>
                    <p className="text-xl uppercase text-green-900 font-semibold">
                        {registro.meta_descripcion || 'Meta sin descripción'}
                    </p>
                </div>
            )}

            {/* ========== SECCIÓN 2: ESTADO GENERAL + FRASE ========== */}
            <div className="bg-white/80 backdrop-blur-sm border border-amber-400 rounded-2xl p-6 text-center shadow-lg">
                <div className="w-32 h-32 mx-auto">
                    <Lottie animationData={animacionClima} loop={true} />
                </div>
                <p className="text-2xl font-['Patrick_Hand'] text-zinc-700 italic mt-4">
                    "{registro.frase_sunny || 'Sin frase para este día'}"
                </p>
            </div>

            {/* ========== SECCIÓN 3: COMENTARIOS DE ASPECTOS ========== */}
            <div className="bg-white/80 backdrop-blur-sm border border-amber-300 rounded-2xl p-4 shadow-lg space-y-3">
                {/* Mente */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0">
                        <Lottie animationData={brainLoopAnimation} loop={true} />
                    </div>
                    <p className="text-sm font-['Patrick_Hand'] italic text-zinc-700">
                        "{registro.mente_comentario || '...'}"
                    </p>
                </div>

                {/* Emoción */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0">
                        <Lottie animationData={emotionLoopAnimation} loop={true} />
                    </div>
                    <p className="text-sm font-['Patrick_Hand'] italic text-zinc-700">
                        "{registro.emocion_comentario || '...'}"
                    </p>
                </div>

                {/* Cuerpo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0">
                        <Lottie animationData={bodyLoopAnimation} loop={true} />
                    </div>
                    <p className="text-sm font-['Patrick_Hand'] italic text-zinc-700">
                        "{registro.cuerpo_comentario || '...'}"
                    </p>
                </div>
            </div>

            {/* ========== 🆕 SECCIÓN 4: TABLERO DE POST-ITS ========== */}
            {isLoadingPostIts ? (
                <LoadingSpinner message="Cargando tus notas..." />
            ) : postIts.length > 0 ? (
                <div className="bg-slate-100 rounded-2xl p-4 shadow-inner">
                    <h3 className="font-['Patrick_Hand'] text-xl text-zinc-800 text-center mb-4">
                        Tablero del Día
                    </h3>
                    
                    {/* Grid de post-its (igual que en Journal) */}
                    <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {postIts.map(entrada => (
                                <NotaDiarioReadOnly key={entrada.id} entrada={entrada} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            ) : (
                <div className="bg-white/60 backdrop-blur-sm border border-dashed border-zinc-300 rounded-2xl p-6 text-center">
                    <p className="font-['Patrick_Hand'] text-zinc-500 italic">
                        No hay notas en el tablero para este día
                    </p>
                </div>
            )}
        </div>
    );
}