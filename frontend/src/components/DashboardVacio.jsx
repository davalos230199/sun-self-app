// frontend/src/components/DashboardVacio.jsx

import React from 'react';
import Lottie from 'lottie-react'; // <-- Importamos Lottie directamente
import { useAuth } from '../contexts/AuthContext';
import { BookOpen } from 'lucide-react';

// Importamos la animación JSON específica
import bookOpenAnimation from '../assets/animations/book-open.json'; 

// Recibe la función para iniciar el ritual 
export default function DashboardVacio({ onStartRitual }) {
    const { user } = useAuth(); 
    const nombreUsuario = user?.username.split(' ')[0] || 'Sol';

    return (
        <div className="flex flex-col items-center justify-center h-full px-4 text-center pt-16">
            
            {/* 1. El Saludo Personal */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                ¿Cómo estás hoy, {nombreUsuario}?
            </h1>

            {/* 2. La Invitación Visual (usando Lottie) */}
            <div className="w-48 h-48 my-4">
                <Lottie 
                    animationData={bookOpenAnimation} // <-- Usamos la animación importada
                    loop={false} 
                />
            </div>

            {/* 3. El Refuerzo Filosófico */}
            <p className="text-lg text-gray-600 mb-8 max-w-md">
                El primer paso para ser libre es observarte. 
                Tómate 3 minutos para anclarte en tu presente.
            </p>

            {/* 4. El Llamado a la Acción (El Botón Principal) */}
            <button
                onClick={onStartRitual}
                className="flex items-center justify-center gap-2
                           bg-gradient-to-r from-amber-500 to-orange-500 
                           text-white text-lg font-semibold 
                           py-3 px-8 rounded-full shadow-lg
                           transform transition-all duration-300 hover:scale-105"
            >
                <BookOpen size={20} />
                Iniciar mi Sol
            </button>

        </div>
    );
}