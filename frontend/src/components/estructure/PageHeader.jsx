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
        <div className="w-12 h-12 flex-shrink-0"> 
            <Lottie animationData={animationData} loop={true} />
        </div>
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
    const fraseSunny = registroDeHoy?.frase_sunny || "Que tengas un gran día.";

    return (
        // Usamos el tema dinámico
        <header className={`${theme.headerBg} ${theme.headerBorder} border rounded-lg shadow-md p-3 w-full flex-shrink-0`}>
            
            {/* Este es el nuevo layout de 3 columnas (Mobile-First):
                [ICONO (fijo)] [TEXTO (flexible)] [FECHA (fijo)]
            */}
            <div className="flex justify-between items-center gap-2">

                {/* IZQUIERDA: Icono del Clima */}
                <ClimaIconoAnimado estadoGeneral={registroDeHoy?.estado_general} />

                {/* CENTRO: Saludo y Frase (ocupa el espacio) */}
                {/* min-w-0 es clave para que el flexbox respete el salto de línea */}
                <div className="flex-1 text-left min-w-0 mx-2">
                    <h2 className="font-['Patrick_Hand'] text-xl text-zinc-800 truncate">
                        Hola, {user?.username || 'Viajero'}
                    </h2>
                    {/* FRASESUNNY:
                        - text-xs (más chiquita)
                        - No tiene 'truncate', por lo que saltará de línea si no entra.
                    */}
                    <p className="text-xs text-zinc-600 italic" title={fraseSunny}>
                        "{fraseSunny}"
                    </p>
                </div>

                {/* DERECHA: Fecha */}
                <div className="flex-shrink-0 font-['Patrick_Hand'] text-base text-zinc-600">
                    {getFormattedDate()}
                </div>
            </div>

            {/* Se eliminó por completo la segunda fila que contenía
                el {title} y el {BotonAtras}.
                El PageHeader ahora es SOLO el panel de estado.
            */}
        </header>
    );
}