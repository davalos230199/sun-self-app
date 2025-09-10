// src/pages/ResumenDia.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner'; // Asumo que tenés un spinner

const AspectoWidget = ({ orbe, estado, comentario }) => (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-zinc-700">{orbe}</span>
            <span className={`px-3 py-1 text-sm rounded-full font-semibold ${estado === 'alto' ? 'bg-green-100 text-green-800' : estado === 'medio' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{estado}</span>
        </div>
        {comentario && <p className="mt-2 text-zinc-600 italic">"{comentario}"</p>}
    </div>
);


export default function ResumenDia() {
    const { fecha } = useParams(); // Obtenemos la fecha de la URL, ej: "2025-09-10"
    const navigate = useNavigate();

    const [registro, setRegistro] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRegistro = async () => {
            try {
                setIsLoading(true);
                // 1. Creamos una promesa que se resuelve después de 400ms para manetener el UX acorde
                const minDisplayTime = new Promise(resolve => setTimeout(resolve, 400));
                const [response] = await Promise.all([
                    api.getRegistroPorFecha(fecha),
                    minDisplayTime
                ]);
                setRegistro(response.data.registro);
            } catch (err) {
                setError('No se encontró un registro para este día.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistro();
    }, [fecha]); // Se ejecuta cada vez que la fecha en la URL cambie

    if (isLoading) {
        return (
            <div className="h-full flex justify-center items-center">
                <LoadingSpinner message="Revisitando ese día..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center h-full flex flex-col justify-center items-center">
                <p className="text-red-600 mb-4">{error}</p>
            </div>
        );
    }

    return (
        // Contenedor principal con animación y espaciado
        <div className="animate-fade-in flex flex-col h-full">

            {/* Contenido que se puede scrollear */}
            <div className="flex-1 overflow-y-auto p-2 space-y-6">

                {/* Frase del día, más prominente */}
                <blockquote className="text-center px-4">
                    <p className="font-['Patrick_Hand'] text-2xl sm:text-3xl text-amber-600">
                        "{registro.frase_sunny || "Un día para recordar."}"
                    </p>
                </blockquote>

                {/* Contenedor de los Widgets */}
                <div className="space-y-3">
                    <AspectoWidget orbe="Mente" estado={registro.mente_estat} comentario={registro.mente_coment} />
                    <AspectoWidget orbe="Emoción" estado={registro.emocion_estat} comentario={registro.emocion_coment} />
                    <AspectoWidget orbe="Cuerpo" estado={registro.cuerpo_estat} comentario={registro.cuerpo_coment} />
                </div>
            </div>

            {/* El botón ahora se queda "pegado" abajo si hay entrada de diario */}
            {registro.hoja_atras && (
                <div className="p-2 pt-4 border-t border-zinc-200">
                    <button 
                        onClick={() => navigate(`/journal/${registro.id}`)}
                        className="w-full bg-zinc-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                        Ver Anotación en el Diario
                    </button>
                </div>
            )}
        </div>
    );
}