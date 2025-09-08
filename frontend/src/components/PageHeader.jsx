// frontend/src/components/PageHeader.jsx

import { useAuth } from '../contexts/AuthContext';

// La función para determinar el clima no cambia
const determinarClima = (reg) => {
    if (!reg) return null;
    const valores = [reg.mente_estat, reg.emocion_estat, reg.cuerpo_estat];
    const puntaje = valores.reduce((acc, val) => {
        if (val === 'alto') return acc + 1;
        if (val === 'bajo') return acc - 1;
        return acc;
    }, 0);
    if (puntaje >= 2) return '☀️';
    if (puntaje <= -2) return '🌧️';
    return '⛅';
};

// La función de la fecha no cambia
const getFormattedDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
    const year = date.getFullYear();
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${day}/${capitalizedMonth}/${year}`;
};

// CAMBIO: El componente ahora recibe 'registroDeHoy' como una prop
export default function PageHeader({ title, registroDeHoy }) {
    const { user } = useAuth();
    
    // CAMBIO RADICAL: Eliminamos completamente el useState, useEffect y la lógica de sessionStorage.
    // El componente ya no busca sus propios datos.
    
    // Usamos directamente la prop que nos pasa el componente padre (Home.jsx)
    const climaEmoji = determinarClima(registroDeHoy);

    return (
        <header className="bg-white border border-amber-400 rounded-lg shadow-md p-4 w-full flex-shrink-0">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 flex-1">
                    <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">
                        Hola, {user?.nombre || 'viajero'}
                    </h2>
                </div>
                {climaEmoji && (
                    <div className="text-3xl animate-pulse">
                        {climaEmoji}
                    </div>
                )}
                <div className="font-['Patrick_Hand'] text-xl text-zinc-600 flex-1 text-right">
                    {getFormattedDate()}
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-dashed border-amber-400">
                <p className="text-center font-['Patrick_Hand'] text-xl text-zinc-700">
                    {title}
                </p>
            </div>
        </header>
    );
}