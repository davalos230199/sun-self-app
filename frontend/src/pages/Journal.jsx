// frontend/src/pages/Journal.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PenSquare, X, TrendingUp, Pin } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

const NotaDiario = ({ entrada, onSelect, onDelete }) => {
    const rotacion = useState(() => Math.random() * (4 - -4) + -4)[0];
        const handleDeleteClick = (e) => {
        e.stopPropagation(); // ¡Muy importante! Evita que se abra la nota al querer borrarla.
        onDelete(entrada.id);
    }

    const prioridadColores = {
        alta: 'bg-red-200/70 border-red-400',
        media: 'bg-yellow-200/70 border-yellow-400',
        baja: 'bg-amber-100/70 border-amber-300',
    };
    
    // Si la prioridad es null o no existe, usará el color de 'baja'
    const colorClase = prioridadColores[entrada.prioridad] || prioridadColores.baja;

    return (
         <motion.div
            layout // Esta prop anima los cambios de posición (cuando otra nota se borra, por ej.)
            initial={{ opacity: 0, scale: 0.8, y: 50 }} // Estado inicial: invisible, un poco más pequeña y 50px más abajo
            animate={{ opacity: 1, scale: 1, y: 0 }} // Estado final: visible, tamaño normal y en su posición
            exit={{ opacity: 0, scale: 0.5 }} // Al salir (borrarse): se desvanece y encoge
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} // Física de la animación para que se sienta natural
            layoutId={`nota-${entrada.id}`}
            onClick={() => onSelect(entrada)}
            className={`h-40 rounded-md p-3 shadow-md cursor-pointer hover:shadow-xl hover:scale-105 transition-all flex flex-col ${colorClase}`}
            style={{ rotate: `${rotacion}deg` }}
        >
            <div className="flex justify-between items-start">
                <p className="text-[10px] font-semibold text-zinc-500 italic">
                {new Date(entrada.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <button 
                        onClick={handleDeleteClick} 
                        className="p-1 -mr-1 -mt-1 italic text-zinc-400 hover:text-red-500 border-none transition-colors"
                        title="Eliminar nota"
                >
                    <Pin style={{ transform: 'rotate(45deg)' }} size={16} />
                </button>
            </div>
            <p className="text-zinc-800 text-sm italic lowercase line-clamp-5 pt-1">
                {entrada.texto}
            </p>
        </motion.div>
    );
};

const SelectorPrioridad = ({ prioridad, setPrioridad }) => {
    const prioridades = [
        { id: 'alta', color: 'bg-red-500', label: 'Alta' },
        { id: 'media', color: 'bg-yellow-500', label: 'Media' },
        { id: 'baja', color: 'bg-green-500', label: 'Baja' },
    ];

    return (
        <div className="flex items-center gap-2">
            {prioridades.map(p => (
                <button
                    key={p.id}
                    onClick={() => setPrioridad(p.id)}
                    title={p.label}
                    className={`w-5 h-5 rounded-full transition-transform duration-200 ${p.color} ${prioridad === p.id ? 'ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-110'}`}
                />
            ))}
        </div>
    );
};

const NotaExpandida = ({ entrada, onDeselect }) => {
    // 1. Añadimos la misma lógica de mapeo de colores que tiene NotaDiario.
    const prioridadColores = {
        alta: 'bg-red-200/70 border-red-400',
        media: 'bg-yellow-200/70 border-yellow-400',
        baja: 'bg-amber-100/70 border-amber-300',
    };
    
    // Si la prioridad es null, usará el color de 'baja' por defecto.
    const colorClase = prioridadColores[entrada.prioridad] || prioridadColores.baja;

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onDeselect}
        >
            <motion.div
                layout
                layoutId={`nota-${entrada.id}`}
                initial={{ opacity: 0, scale: 0.8, y: 50 }} // Estado inicial: invisible, un poco más pequeña y 50px más abajo
                animate={{ opacity: 1, scale: 1, y: 0 }} // Estado final: visible, tamaño normal y en su posición
                exit={{ opacity: 0, scale: 0.5 }} // Al salir (borrarse): se desvanece y encoge
                transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
                onClick={(e) => e.stopPropagation()}
                // 2. Reemplazamos el color fijo 'bg-[#FFF8E1]' por nuestra variable dinámica 'colorClase'.
                className={`w-full max-w-lg rounded-xl p-6 shadow-2xl ${colorClase}`}
            >
                <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold text-zinc-500 italic">
                        {new Date(entrada.created_at).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </p>
                    <button onClick={onDeselect} className="p-1 rounded-full bg-transparent border-none hover:bg-zinc-200/50">
                        <X size={20} className="text-zinc-600"/>
                    </button>
                </div>
                <p className="text-zinc-800 whitespace-pre-wrap max-h-[60vh] overflow-y-auto italic font-['Patrick_Hand'] text-lg">
                    {entrada.texto}
                </p>
            </motion.div>
        </motion.div>
    );
};

export default function Journal() {
    const { id: registroId } = useParams();
    const [entradas, setEntradas] = useState([]);
    const [metaDelDia, setMetaDelDia] = useState('');
    const [nuevoTexto, setNuevoTexto] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notaSeleccionada, setNotaSeleccionada] = useState(null);
    const [prioridad, setPrioridad] = useState('baja');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Hacemos dos llamadas para obtener toda la info necesaria
                const [diarioRes, registroRes] = await Promise.all([
                    api.getDiarioByRegistroId(registroId),
                    api.getRegistroById(registroId) // Necesitamos un endpoint que devuelva un registro y su meta
                ]);
                
                setEntradas(diarioRes.data || []);
                // Asumimos que la respuesta tiene el objeto 'metas' anidado
                setMetaDelDia(registroRes.data?.metas?.descripcion || 'Define un norte para tu día...');

            } catch (error) {
                console.error("Error al cargar datos del diario:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [registroId]);

    const handleSave = async () => {
        if (!nuevoTexto.trim()) return;
        setIsSaving(true);
        try {
            // Pasamos la prioridad al guardar
            const { data: nuevaEntrada } = await api.saveEntradaDiario({ 
                registro_id: registroId, 
                texto: nuevoTexto,
                prioridad: prioridad, // ¡Aquí se envía la prioridad!
            });
            // Hacemos un 'fetch' de nuevo para obtener la lista ordenada
            const { data } = await api.getDiarioByRegistroId(registroId);
            setEntradas(prevEntradas => [...prevEntradas, nuevaEntrada]);
            setNuevoTexto('');
            setPrioridad('baja'); // Reseteamos la prioridad

        } catch (error) {
        console.error("Error al guardar la nota:", error);
        // Si algo saliera mal, aquí podríamos quitar la nota que agregamos "optimistamente".    
        } finally {
            setIsSaving(false);
        }
    };

        const handleDelete = async (entradaId) => {
        try {
            await api.deleteEntradaDiario(entradaId);
            // Actualizamos el estado para remover la nota de la vista instantáneamente
            setEntradas(prev => prev.filter(e => e.id !== entradaId));
        } catch (error) {
            console.error("Error al eliminar la nota:", error);
            // Aquí podrías mostrar una notificación de error al usuario
        }
    };
    
    if (isLoading) return <LoadingSpinner message="Organizado tu espacio..." />;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto mb-4 p-4 bg-slate-100 rounded-lg shadow-inner">

                {/* Meta del día como un título más evocador */}
                  <div className="flex justify-center items-center gap-2 text-center text-zinc-600 mb-6 pb-2 border-b-2 border-dashed border-zinc-300">
                    <h2 className="font-['Patrick_Hand'] text-xl">
                    <span className="italic uppercase">{metaDelDia}</span>
                    </h2>
                    <TrendingUp size={24} />
                </div>
                
                {/* Grilla de notas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <AnimatePresence>
                    {entradas.map(entrada => (
                        <NotaDiario key={entrada.id} entrada={entrada} onSelect={setNotaSeleccionada} onDelete={handleDelete} />
                    ))}
                </AnimatePresence>    
                </div>

                 {entradas.length === 0 && !isLoading && (
                    <p className="text-zinc-400 text-center italic mt-8">aun no has añadido notas...</p>
                )}
            </div>
            <AnimatePresence>
                {notaSeleccionada && <NotaExpandida entrada={notaSeleccionada} onDeselect={() => setNotaSeleccionada(null)} />}
            </AnimatePresence>
            <div className="flex-shrink-0 mt-auto pt-4 space-y-2">
                <div className="flex justify-between items-center px-2">
                    <p className="text-sm font-semibold italic text-zinc-500">Prioridad:</p>
                    <SelectorPrioridad prioridad={prioridad} setPrioridad={setPrioridad} />
                </div>
                <div className="relative w-full">
                    <textarea
                        className="w-full p-3 pr-14 bg-white italic border border-zinc-300 rounded-xl outline-none resize-none transition-shadow focus:ring-2 focus:ring-zinc-100"
                        value={nuevoTexto}
                        onChange={(e) => setNuevoTexto(e.target.value)}
                        placeholder="añade una nueva nota..."
                        rows={3} // Un poco más de espacio para escribir
                    />
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || !nuevoTexto.trim()} 
                        title="Añadir nota"
                        className="absolute top-3 right-3 p-2 rounded-full bg-[#FFF8E1] hover:bg-amber-600 transition-all disabled:bg-zinc-400 disabled:scale-95"
                    >
                        <PenSquare size={24}  />
                    </button>
                </div>
            </div>
        </div>
    );
}