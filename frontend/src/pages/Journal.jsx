// frontend/src/pages/Journal.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PenSquare, X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotaDiario = ({ entrada, onSelect }) => {
    // Generamos una rotación aleatoria para cada nota, para que se vean más orgánicas
    const rotacion = useState(() => Math.random() * (4 - -4) + -4)[0];

    return (
        <motion.div
            layoutId={`nota-${entrada.id}`}
            onClick={() => onSelect(entrada)}
            className="bg-[#FFF8E1] h-40 rounded-md p-3 shadow-md cursor-pointer hover:shadow-xl hover:scale-105 transition-all flex flex-col"
            style={{ rotate: `${rotacion}deg` }} // Aplicamos la rotación
        >
            <p className="text-[10px] font-semibold text-zinc-500 italic">
                {new Date(entrada.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-zinc-800 text-sm italic lowercase line-clamp-5 pt-1">
                {entrada.texto}
            </p>
        </motion.div>
    );
};

const NotaExpandida = ({ entrada, onDeselect }) => (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onDeselect}
    >
        <motion.div
            layoutId={`nota-${entrada.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#FFF8E1] rounded-xl p-6 shadow-2xl"
        >
            <div className="flex justify-between items-center mb-4">
                <p className="font-semibold text-zinc-500 italic">
                    {new Date(entrada.created_at).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </p>
                <button onClick={onDeselect} className="p-1 rounded-full bg-transparent border-none hover:bg-zinc-200"><X size={20} className="text-zinc-600"/></button>
            </div>
            <p className="text-zinc-800 whitespace-pre-wrap max-h-[60vh] overflow-y-auto italic font-['Patrick_Hand'] text-lg">
                {entrada.texto}
            </p>
        </motion.div>
    </motion.div>
);

export default function Journal() {
    const { id: registroId } = useParams();
    const [entradas, setEntradas] = useState([]);
    const [metaDelDia, setMetaDelDia] = useState('');
    const [nuevoTexto, setNuevoTexto] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notaSeleccionada, setNotaSeleccionada] = useState(null);

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
            // Asumo que la llamada 'saveEntradaDiario' existe en api.js
            const { data: nuevaEntrada } = await api.saveEntradaDiario({ registro_id: registroId, texto: nuevoTexto });
            setEntradas(prev => [...prev, nuevaEntrada]);
            setNuevoTexto('');
        } catch (error) {
            console.error("Error al guardar entrada:", error);
        } finally {
            setIsSaving(false);
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
                    {entradas.map(entrada => (
                        <NotaDiario key={entrada.id} entrada={entrada} onSelect={setNotaSeleccionada} />
                    ))}
                </div>

                 {entradas.length === 0 && !isLoading && (
                    <p className="text-zinc-400 text-center italic mt-8">aun no has añadido notas...</p>
                )}
            </div>

            <AnimatePresence>
                {notaSeleccionada && <NotaExpandida entrada={notaSeleccionada} onDeselect={() => setNotaSeleccionada(null)} />}
            </AnimatePresence>
            
            <div className="flex-shrink-0 mt-auto pt-2">
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