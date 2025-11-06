import React, { useRef, useState, useEffect }  from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDia } from '../../contexts/DiaContext';
import Lottie from 'lottie-react';
import api from '../../services/api';

// --- Importamos las animaciones que usaremos ---
import sunLoopAnimation from '../../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../../assets/animations/rain-loop.json';

// --- Sub-componente para la animación (de tu código original) ---
const ClimaIconoAnimado = ({ estadoGeneral }) => {
    const animationMap = {
        soleado: sunLoopAnimation,
        nublado: cloudLoopAnimation,
        lluvioso: rainLoopAnimation,
    };
    // Si no hay registro, o es nublado, muestra la nube.
    const animationData = animationMap[estadoGeneral] || sunLoopAnimation;

    return ( 
            <Lottie animationData={animationData} loop={true} />
    );
};

// --- La función de la fecha (de tu código original) ---
const getFormattedDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
    const year = date.getFullYear();
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${day}/${capitalizedMonth}/${year}`;
};


// --- EL COMPONENTE PRINCIPAL (AHORA SIMPLIFICADO) ---
export default function PageHeader() {
    const { user } = useAuth();
    // Traemos los datos y el tema directamente del contexto
    const { registroDeHoy, theme } = useDia();
    const [fraseDelDia, setFraseDelDia] = useState({
        quote: "Que tengas un gran día.",
        author: "Sun Self"
    });
    const [cargandoFrase, setCargandoFrase] = useState(true);
    
    useEffect(() => {
        const fetchFrase = async () => {
            setCargandoFrase(true);
            try {
                // --- ¡AQUÍ LA MAGIA! ---
                // 1. Leemos el estado del día
                const estadoGeneral = registroDeHoy?.estado_general || 'soleado'; // 'soleado', 'lluvioso', 'nublado'

                // 2. Mapeamos tu idea de "días lluviosos"
                let categoria;
                if (estadoGeneral === 'soleado') {
                    categoria = 'positiva';
                } else if (estadoGeneral === 'lluvioso') {
                    categoria = 'reflexiva';
                } else {
                    // 'nublado' o por defecto
                    categoria = 'estoica';
                }

                // 3. Llamamos a NUESTRA PROPIA API
                const response = await api.getFraseHeader(categoria);
                
                setFraseDelDia(response.data);

            } catch (error) {
                console.error("Error al cargar frase:", error);
                setFraseDelDia({
                    quote: "Que tengas un gran día.",
                    author: "Sun Self"
                });
            }
            setCargandoFrase(false);
        };

        // Lo llamamos cuando el componente carga
        fetchFrase();
    }, [registroDeHoy]);


    return (
        // Usamos el tema dinámico
<div className={`${theme.headerBg} ${theme.headerBorder} flex flex-row items-center space-x-4 p-4 bg-white rounded-xl shadow-lg`}>
    
    <div className="w-20 h-20 flex-shrink-0">
        <ClimaIconoAnimado estadoGeneral={registroDeHoy?.estado_general} />
    </div>

    {/* --- Columna Derecha: Contenido (El "resto") --- */}
    <div className="flex flex-col flex-1">
        
        {/* Fila Superior: Saludo y Fecha */}
        {/* flex y justify-between separa los elementos a los extremos */}
        <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-zinc-800">
                Hola, {user?.username.split(' ')[0]  || 'Viajero'}
            </h2>
            <p className="text-sm font-semibold text-zinc-400">
                {getFormattedDate()}
            </p>
        </div>

        {/* Fila Inferior: Línea de puntos y Frase */}
       <div className="w-full mt-2 pt-2 border-t border-dashed border-amber-300">
                    <div className="text-center min-h-[40px] flex flex-col justify-center">
                        {cargandoFrase ? (
                            <p className="italic text-xs text-zinc-400">...</p>
                        ) : (
                            <>
                                <p className="italic text-xs text-zinc-600 font-semibold line-clamp-2">
                                    "{fraseDelDia.quote}"
                                </p>
                                <p className="text-xs text-zinc-400 font-bold text-right mt-1">
                                    - {fraseDelDia.author}
                                </p>
                            </>
                        )}
                    </div>
                </div>
                
            </div>
        </div>     
    );
}