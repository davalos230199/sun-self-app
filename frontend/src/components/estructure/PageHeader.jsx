import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDia } from '../../contexts/DiaContext';
import Lottie from 'lottie-react';

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
    const animationData = animationMap[estadoGeneral] || cloudLoopAnimation;

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

    // Determinamos la frase (con un fallback)
    const fraseSunny = "Que tengas un gran día.";

    return (
        // Usamos el tema dinámico
<div className={`${theme.headerBg} ${theme.headerBorder} flex flex-row items-center space-x-4 p-4 bg-white rounded-xl shadow-lg`}>
    
    {/* --- Columna Izquierda: Icono (El "cuadrado") --- */}
    {/* flex-shrink-0 evita que el icono se encoja */}
    <div className="w-20 h-20 flex-shrink-0">
        <ClimaIconoAnimado estadoGeneral={registroDeHoy?.estado_general} />
    </div>

    {/* --- Columna Derecha: Contenido (El "resto") --- */}
    {/* flex-1 toma todo el ancho restante */}
    {/* flex-col apila la parte superior y la inferior verticalmente */}
    <div className="flex flex-col flex-1">
        
        {/* Fila Superior: Saludo y Fecha */}
        {/* flex y justify-between separa los elementos a los extremos */}
        <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-zinc-800">
                Hola, {user?.username || 'Viajero'}
            </h2>
            <p className="text-sm font-semibold text-zinc-400">
                {getFormattedDate()}
            </p>
        </div>

        {/* Fila Inferior: Línea de puntos y Frase */}
        {/* mt-2 crea espacio, border-t es la línea, pt-2 es el padding post-línea */}
        <div className="w-full mt-2 pt-2 border-t border-dashed border-amber-300">
            <p className="italic text-xs text-zinc-500 font-semibold text-center">
                {fraseSunny || '...'}
            </p>
        </div>
        
    </div>
</div>      
    );
}