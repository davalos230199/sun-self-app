// frontend/src/pages/Journal.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PenSquare, X, TrendingUp, Pin, Copy, Check } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useDia } from '../contexts/DiaContext';

// 🆕 COMPONENTE NUEVO: Post-it de Solo Lectura con Botón de Copiar
const NotaDiarioReadOnly = ({ entrada }) => {
    // 1. Estado para mostrar feedback visual cuando se copia
    const [copiado, setCopiado] = useState(false);
    
    // 2. Rotación aleatoria (igual que en Journal)
    const [rotacion] = useState(() => Math.random() * (4 - -4) + -4);
    
    // 3. Colores según prioridad (igual que en Journal)
    const prioridadColores = {
        alta: 'bg-red-200/70 border-red-400',
        media: 'bg-yellow-200/70 border-yellow-400',
        baja: 'bg-green-100/70 border-green-300',
    };
    const colorClase = prioridadColores[entrada.prioridad] || prioridadColores.baja;
    
    // 4. Formateo de fecha y hora (igual que en Journal)
    const fecha = new Date(entrada.created_at);
    const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const fechaFormateada = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
    
    // 5. Función para copiar el texto al portapapeles
    const copiarTexto = async (e) => {
        e.stopPropagation(); // Evita que se propague el click
        
        try {
            await navigator.clipboard.writeText(entrada.texto);
            setCopiado(true); // Mostramos el check verde
            
            // Después de 2 segundos, volvemos al icono de copiar
            setTimeout(() => setCopiado(false), 2000);
        } catch (error) {
            console.error('Error al copiar:', error);
        }
    };
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 2, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 900, damping: 50 }}
            className={`h-40 rounded-md p-3 shadow-md flex flex-col ${colorClase}`}
            style={{ rotate: `${rotacion}deg` }}
        >
            {/* Header: Fecha/Hora + Botón de Copiar */}
            <div className="flex justify-between items-start">
                <p className="text-[9px] font-semibold text-zinc-500 italic">
                    {fechaFormateada} - {horaFormateada}hs
                </p>
                
                {/* Botón de copiar (reemplaza al pin de borrar) */}
                <button 
                    onClick={copiarTexto}
                    className="p-1 -mr-1 -mt-1 text-zinc-400 hover:text-blue-500 border-none transition-colors"
                    title="Copiar texto"
                >
                    {copiado ? (
                        <Check size={16} className="text-green-500" />
                    ) : (
                        <Copy size={16} />
                    )}
                </button>
            </div>
            
            {/* Contenido del post-it */}
            <p className="text-zinc-800 text-xs italic lowercase line-clamp-5 pt-1">
                {entrada.texto}
            </p>
        </motion.div>
    );
};

const NotaDiario = ({ entrada, onSelect, onDelete }) => {
    const rotacion = useState(() => Math.random() * (4 - -4) + -4)[0];
        const handleDeleteClick = (e) => {
        e.stopPropagation(); // ¡Muy importante! Evita que se abra la nota al querer borrarla.
        onDelete(entrada.id);
    }

    const prioridadColores = {
        alta: 'bg-red-200/70 border-red-400',
        media: 'bg-yellow-200/70 border-yellow-400',
        baja: 'bg-green-100/70 border-green-300',
    };
    
    // Si la prioridad es null o no existe, usará el color de 'baja'
    const colorClase = prioridadColores[entrada.prioridad] || prioridadColores.baja;
    const fecha = new Date(entrada.created_at);
    const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const fechaFormateada = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

    return (
         <motion.div
            layout // Esta prop anima los cambios de posición (cuando otra nota se borra, por ej.)
            initial={{ opacity: 0, scale: 2, y: 50 }} // Estado inicial: invisible, un poco más pequeña y 50px más abajo
            animate={{ opacity: 1, scale: 1, y: 0 }} // Estado final: visible, tamaño normal y en su posición
            exit={{ opacity: 0, scale: 0.5 }} // Al salir (borrarse): se desvanece y encoge
            transition={{ type: 'spring', stiffness: 900, damping: 50 }} // Física de la animación para que se sienta natural
            layoutId={`nota-${entrada.id}`}
            onClick={() => onSelect(entrada)}
            className={`h-40 rounded-md p-3 shadow-md cursor-pointer hover:shadow-xl hover:scale-105 transition-all flex flex-col ${colorClase}`}
            style={{ rotate: `${rotacion}deg` }}
        >
            <div className="flex justify-between items-start">
                <p className="text-[9px] font-semibold text-zinc-500 italic">
                {fechaFormateada} - {horaFormateada}hs
                </p>
                <button 
                        onClick={handleDeleteClick} 
                        className="p-1 -mr-1 -mt-1 italic text-zinc-400 hover:text-red-500 border-none transition-colors"
                        title="Eliminar nota"
                >
                    <Pin style={{ transform: 'rotate(45deg)' }} color='red' size={16} />
                </button>
            </div>
            <p className="text-zinc-800 text-xs italic lowercase line-clamp-5 pt-1">
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
        baja: 'bg-green-100/70 border-green-300',
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
                layoutId={`nota-${entrada.id}`}
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
    const [todasLasEntradas, setTodasLasEntradas] = useState([]); // Almacenará el mes completo
    const { registroDeHoy, metas } = useDia(); 
    const [nuevoTexto, setNuevoTexto] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notaSeleccionada, setNotaSeleccionada] = useState(null);
    const [prioridad, setPrioridad] = useState('baja');
    const [filtroTiempo, setFiltroTiempo] = useState('hoy');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const diarioRes = await api.getDiario(filtroTiempo); // Llama al nuevo endpoint simple
                setTodasLasEntradas(diarioRes.data || []);
            } catch (error) { console.error("Error al cargar datos del diario:", error); } 
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [filtroTiempo]);

    const entradasFiltradas = useMemo(() => {

        // Aplicamos el filtro de tiempo primero para obtener la lista base
        const filtradasPorTiempo = (() => {
            const hoy = new Date();
            const inicioHoy = new Date(new Date().setHours(0, 0, 0, 0));
            
            // Creamos una nueva fecha para no mutar 'hoy'
            const fechaSemana = new Date();
            const inicioSemana = new Date(fechaSemana.setDate(fechaSemana.getDate() - 7));

            switch (filtroTiempo) {
                case 'semana':
                    return todasLasEntradas.filter(e => new Date(e.created_at) >= inicioSemana);
                case 'mes':
                    return todasLasEntradas;
                case 'hoy':
                default:
                    return todasLasEntradas.filter(e => new Date(e.created_at) >= inicioHoy);
            }
        })();

        // --- AQUÍ ESTÁ LA NUEVA LÓGICA DE ORDENAMIENTO JERÁRQUICO ---
        const prioridadValor = { 'alta': 3, 'media': 2, 'baja': 1 };

        return filtradasPorTiempo.sort((a, b) => {
            // 1. Comparamos las fechas (sin la hora)
            const fechaA = new Date(a.created_at).toDateString();
            const fechaB = new Date(b.created_at).toDateString();

            if (fechaA !== fechaB) {
                // Si son de días diferentes, ordena por fecha (el más nuevo primero)
                return new Date(b.created_at) - new Date(a.created_at);
            }
            
            // 2. Si son del MISMO día, ordena por prioridad
            const prioridadA = prioridadValor[a.prioridad] || 0;
            const prioridadB = prioridadValor[b.prioridad] || 0;
            return prioridadB - prioridadA;
        });

    }, [todasLasEntradas, filtroTiempo]);

    const handleSave = async () => {
        if (!registroDeHoy) {
        alert("Debes tener un registro del día para añadir una nota.");
        return;
        }
        if (!nuevoTexto.trim()) return;
        setIsSaving(true);
        try {
            // Pasamos la prioridad al guardar
            const { data: nuevaEntrada } = await api.saveEntradaDiario({ 
                registro_id: registroDeHoy.id, 
                texto: nuevoTexto,
                prioridad: prioridad, // ¡Aquí se envía la prioridad!
            });

            setTodasLasEntradas(prevEntradas => {
                // Add new note and re-sort
                const newArray = [...prevEntradas, nuevaEntrada];
                const prioridadValor = { 'alta': 3, 'media': 2, 'baja': 1 };
                return newArray.sort((a, b) => {
                    const prioridadA = prioridadValor[a.prioridad] || 0;
                    const prioridadB = prioridadValor[b.prioridad] || 0;
                    if (prioridadB !== prioridadA) return prioridadB - prioridadA;
                    return new Date(b.created_at) - new Date(a.created_at);
                });
            });

            setNuevoTexto('');
            setPrioridad('baja');

        } catch (error) {
            console.error("Error al guardar la nota:", error);
        } finally {
            setIsSaving(false);
        }
    };

const handleDelete = async (entradaId) => {
    try {
        await api.deleteEntradaDiario(entradaId);
        
        // --- LA CORRECCIÓN ---
        // Actualizamos 'todasLasEntradas', no el antiguo 'entradas'.
        setTodasLasEntradas(prev => prev.filter(e => e.id !== entradaId));

    } catch (error) {
        console.error("Error al eliminar la nota:", error);
    }
};
    
    const metaPrincipal = registroDeHoy?.meta_principal_id 
    ? metas.find(m => m.id === registroDeHoy.meta_principal_id) 
    : null;
    if (isLoading) return <LoadingSpinner message="Organizado tu espacio..." />;
    
    const filtros = [
        { key: 'hoy', label: 'Hoy' },
        { key: 'semana', label: 'Semana' },
        { key: 'mes', label: 'Mes' },
    ];
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto p-2 bg-slate-100 rounded-lg shadow-inner">

                {/* --- NUEVO SELECTOR DE FILTRO DE TIEMPO --- */}
                <div className="flex flex-col items-center mb-4">
                    <div className="flex items-center gap-2 text-center text-zinc-600">
                        <h2 className="font-['Patrick_Hand'] text-xl italic font-bold">{metaPrincipal ? metaPrincipal.descripcion : 'Sin meta principal hoy'}</h2>
                        <TrendingUp size={24} />
                    </div>
                    <div className="flex items-center gap-1 rounded-full p-1 shadow-sm">
                        {filtros.map(f => (
                            <button key={f.key} onClick={() => setFiltroTiempo(f.key)}
                                className={`px-4 font-['Patrick_Hand'] py-1 text-sm font-semibold rounded-full border-none transition-colors ${filtroTiempo === f.key ? 'bg-slate-800 text-white' : 'text-zinc-500'}`}
                            >{f.label}</button>
                        ))}
                    </div>
                </div>
                
                {/* --- GRILLA ACTUALIZADA PARA 4 COLUMNAS --- */}
                <div className="grid grid-cols-3 md:grid-cols-3 gap-4 p-3 -mt-5">
                    <AnimatePresence>
                        {/* Usamos las 'entradasFiltradas' para el renderizado */}
                        {entradasFiltradas.map(entrada => (
                            <NotaDiario key={entrada.id} entrada={entrada} onSelect={setNotaSeleccionada} onDelete={handleDelete} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Mensaje de "vacío" ahora usa la data filtrada */}
                {entradasFiltradas.length === 0 && !isLoading && (
                    <p className="italic text-zinc-400 ...">No hay notas para este período...</p>
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