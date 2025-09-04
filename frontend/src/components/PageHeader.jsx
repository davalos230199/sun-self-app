import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Función para determinar el emoji basado en el registro diario
const determinarClima = (reg) => {
    if (!reg) return null; // Si no hay registro, no mostramos nada
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

// La función de la fecha no necesita cambios
const getFormattedDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
    const year = date.getFullYear();
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${day}/${capitalizedMonth}/${year}`;
};

export default function PageHeader({ title }) {
    const { user } = useAuth();
    const [registroDeHoy, setRegistroDeHoy] = useState(null);

    // Este efecto se encarga de buscar el registro del día al cargar el header
    useEffect(() => {
        const fetchRegistro = async () => {
            // 1. INTENTAMOS LEER DE LA CACHÉ DE LA SESIÓN PRIMERO
            const cachedRegistro = sessionStorage.getItem('registroDeHoy');
            if (cachedRegistro) {
                try {
                    setRegistroDeHoy(JSON.parse(cachedRegistro));
                    return; // Si lo encontramos, no hacemos la llamada a la API
                } catch (e) {
                    console.error("Error al parsear registro cacheado:", e);
                    sessionStorage.removeItem('registroDeHoy'); // Limpiamos la caché si está corrupta
                }
            }

            // 2. SI NO ESTÁ EN CACHÉ, HACEMOS LA LLAMADA A LA API
            try {
                const { data } = await api.getRegistroDeHoy();
                if (data.registro) {
                    setRegistroDeHoy(data.registro);
                    // 3. GUARDAMOS EL RESULTADO EN LA CACHÉ DE LA SESIÓN PARA FUTURAS CARGAS
                    sessionStorage.setItem('registroDeHoy', JSON.stringify(data.registro));
                }
            } catch (error) {
                console.error("No se encontró registro para el header (esto puede ser normal).", error);
            }
        };
        fetchRegistro();
    }, []); // El array vacío asegura que se ejecute solo una vez

    const climaEmoji = determinarClima(registroDeHoy);

    return (
        <header className="bg-white border border-amber-400 rounded-lg shadow-md p-4 w-full flex-shrink-0">
            {/* Contenedor superior con el emoji en el centro */}
            <div className="flex justify-between items-center">
                
                {/* Lado izquierdo: Saludo */}
                <div className="flex items-center gap-4 flex-1">
                    <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800">
                        Hola, {user?.nombre || 'viajero'}
                    </h2>
                </div>
                
                {/* Centro: El emoji del estado del día */}
                {climaEmoji && (
                    <div className="text-3xl animate-pulse">
                        {climaEmoji}
                    </div>
                )}
                
                {/* Lado derecho: La fecha */}
                <div className="font-['Patrick_Hand'] text-xl text-zinc-600 flex-1 text-right">
                    {getFormattedDate()}
                </div>
            </div>

            {/* Divisor y título de la página */}
            <div className="mt-3 pt-3 border-t border-dashed border-amber-400">
                <p className="text-center font-['Patrick_Hand'] text-xl text-zinc-700">
                    {title}
                </p>
            </div>
        </header>
    );
}

