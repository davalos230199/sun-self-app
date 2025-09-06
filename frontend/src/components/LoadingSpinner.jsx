// frontend/src/components/LoadingSpinner.jsx
import React from 'react';

// El SVG del sol que usaremos para la animación.
const SunIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" /><path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" /><path d="M20 12h2" /><path d="m4.93 19.07 1.41-1.41" /><path d="m17.66 6.34 1.41-1.41" />
    </svg>
);

/**
 * Un spinner de carga reutilizable con la animación del sol.
 * @param {{ message?: string }} props - Un mensaje opcional para mostrar debajo del spinner.
 */
export default function LoadingSpinner({ message = "Cargando..." }) {
    return (
        // Este contenedor centra el spinner vertical y horizontalmente en el espacio disponible.
        <div className="flex-grow flex flex-col items-center justify-center h-full text-zinc-500">
            <SunIcon className="w-12 h-12 animate-spin text-amber-500" />
            <p className="font-['Patrick_Hand'] mt-4 text-lg">
                {message}
            </p>
        </div>
    );
}