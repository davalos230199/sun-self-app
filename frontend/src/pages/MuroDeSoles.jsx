import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // Importamos para la animación del modal
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import './MuroDeSoles.css'; // Este archivo ahora estará vacío, pero mantenemos la importación por si acaso

// --- Componente del Modal para la Frase (NUEVO) ---
const FraseModal = ({ frase, onClose }) => {
    return (
        // Backdrop semi-transparente que cierra el modal al hacer clic
        <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Contenedor del modal que evita que el clic se propague al backdrop */}
            <motion.div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center"
                onClick={(e) => e.stopPropagation()} // Evita que el modal se cierre al hacer clic dentro de él
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <p className="text-2xl font-['Patrick_Hand'] text-zinc-700 leading-relaxed">
                    "{frase}"
                </p>
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 bg-white text-zinc-600 rounded-full h-9 w-9 flex items-center justify-center shadow-md hover:bg-zinc-100 transition-colors"
                    aria-label="Cerrar modal"
                >
                    ✕
                </button>
            </motion.div>
        </motion.div>
    );
};


const ClimaEmoji = ({ estado }) => {
    switch (estado) {
        case 'soleado': return '☀️';
        case 'nublado': return '⛅';
        case 'lluvioso': return '🌧️';
        default: return '❔';
    }
};

export default function MuroDeSoles() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // CAMBIO: El estado ahora guarda la frase a mostrar en el modal
    const [selectedFrase, setSelectedFrase] = useState(null);

    useEffect(() => {
        const fetchEstados = async () => {
            try {
                setLoading(true);
                const response = await api.getMuroEstados();
                setRegistros(response.data);
                setError(null);
            } catch (err) {
                console.error("Error al cargar los estados del muro:", err);
                setError("No se pudo cargar el clima de la comunidad. Inténtalo de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchEstados();
    }, []);

    // CAMBIO: El manejador de clic ahora guarda la frase del registro seleccionado
    const handleCardClick = (frase) => {
        setSelectedFrase(frase);
    };

    const renderContent = () => {
        if (loading) {
            return <p className="text-center text-zinc-500 italic py-10">Tejiendo los reflejos de la comunidad...</p>;
        }
        if (error) {
            return <p className="text-center text-red-600 italic py-10">{error}</p>;
        }
        if (registros.length === 0) {
            return <p className="text-center text-zinc-500 italic py-10">El muro está en calma. Nadie ha compartido su reflejo hoy.</p>;
        }
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-8 sm:gap-10">
                {registros.map((registro, index) => (
                    <div 
                        key={index} 
                        // CAMBIO: Se aplican estilos de Tailwind directamente y se llama a handleCardClick con la frase
                        className="relative flex justify-center items-center cursor-pointer transition-transform duration-200 hover:scale-110"
                        onClick={() => handleCardClick(registro.frase_sunny)}
                    >
                        <div className="text-3xl sm:text-4xl bg-white/30 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex justify-center items-center shadow-sm backdrop-blur-sm">
                            <ClimaEmoji estado={registro.estado_general} />
                        </div>
                        {/* Se elimina la burbuja de CSS de aquí */}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-2 sm:p-4 h-full w-full flex flex-col bg-zinc-50"> 
            <PageHeader title="Muro de Soles" />
            
            <main className="flex-grow overflow-y-auto mt-4 p-4 bg-white rounded-2xl shadow-sm">
                <p className="text-lg text-zinc-600 mb-10 text-center font-['Patrick_Hand'] max-w-lg mx-auto">
                    Un mosaico anónimo de los reflejos de hoy. Toca un reflejo para ver su pensamiento.
                </p>
                {renderContent()}
            </main>

            {/* CAMBIO: Se renderiza el modal de forma condicional con una animación */}
            <AnimatePresence>
                {selectedFrase && (
                    <FraseModal frase={selectedFrase} onClose={() => setSelectedFrase(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}

