// frontend/src/pages/ResumenDia.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import api from '../services/api';

import { useHeader } from '../contexts/HeaderContext';
import LoadingSpinner from '../components/LoadingSpinner';

import SingleRegistroView from '../components/SingleRegistroView'; // La "carta" que crearemos


// Animaciones para la lista
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';

// Componente para la vista de múltiples registros
const MultiRegistroSelector = ({ registros, onSelect }) => {
    const getEmoji = (estado) => {
        if (estado === 'soleado') return sunLoopAnimation;
        if (estado === 'nublado') return cloudLoopAnimation;
        if (estado === 'lluvioso') return rainLoopAnimation;
        return cloudLoopAnimation;
    };

    return (
        <div className="space-y-4 animate-fade-in">
             <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 text-center mb-4">
                Registros del Día
            </h2>
            {registros.map(registro => (
                <div 
                    key={registro.id} 
                    onClick={() => onSelect(registro)}
                    className="flex items-center bg-white/80 p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="w-16 h-16 mr-4">
                        <Lottie animationData={getEmoji(registro.estado_general)} loop={true} />
                    </div>
                    <p className="flex-grow font-['Patrick_Hand'] text-zinc-700 text-lg">
                        "{registro.frase_sunny || 'Tu reflexión te espera...'}"
                    </p>
                </div>
            ))}
        </div>
    );
};


export default function ResumenDia() {
    const { date } = useParams();
     const { setTitle, setOnBackAction } = useHeader();
     
    const [registros, setRegistros] = useState([]);
    const [selectedRegistro, setSelectedRegistro] = useState(null); // Para manejar la selección en la vista múltiple
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRegistros = async () => {
            try {
                setIsLoading(true);
                const response = await api.getRegistrosByDate(date);
                setRegistros(response.data || []);
                const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });
                setTitle(`Resumen del ${formattedDate}`); // ¡Aquí sucede la magia!
            } catch (err) {
                console.error("Error cargando registros del día:", err);
                setError("No se pudo cargar este recuerdo.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistros();
    }, [date,setTitle]); // Se ejecuta cada vez que la fecha en la URL cambia
    
        // Este efecto se encarga de gestionar la acción del botón "Atrás"
        useEffect(() => {
        if (registros.length > 1 && selectedRegistro) {
            // Si estamos viendo un detalle de una lista, definimos la acción personalizada.
            setOnBackAction(() => () => setSelectedRegistro(null));
        }

        // Función de limpieza: se ejecuta cuando el componente se desmonta o el estado cambia.
        return () => {
            // Reseteamos la acción para que el botón vuelva a su estado normal en otras páginas.
            setOnBackAction(null);
        };
    }, [selectedRegistro, registros, setOnBackAction]);

    // Si se selecciona un registro de la lista, lo mostramos en la vista detallada
    if (selectedRegistro) {
        return <SingleRegistroView registro={selectedRegistro}/>;
    }

    if (isLoading) return <LoadingSpinner message="Buscando en tus recuerdos..." />;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
    if (registros.length === 0) return <div className="text-center text-zinc-500 p-4">No hay registros para este día.</div>;
    
    // Decidimos qué vista mostrar basado en la cantidad de registros
    if (registros.length > 1) {
        return <MultiRegistroSelector registros={registros} onSelect={setSelectedRegistro} />;
    }

    // Si solo hay un registro, mostramos la "carta" directamente
    return <SingleRegistroView registro={registros[0]} />;
}