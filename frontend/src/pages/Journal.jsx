// frontend/src/pages/Journal.jsx (Versión Final)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Pequeño componente para mostrar cada entrada del diario
const EntradaDiario = ({ entrada }) => (
    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
        <p className="text-zinc-700 whitespace-pre-wrap">{entrada.texto}</p>
        <p className="text-right text-xs text-zinc-400 mt-2">
            {new Date(entrada.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hs
        </p>
    </div>
);

export default function Journal() {
    const { id: registroId } = useParams();
    const navigate = useNavigate();

    const [entradas, setEntradas] = useState([]);
    const [nuevoTexto, setNuevoTexto] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchDiario = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.getDiarioByRegistroId(registroId);
                setEntradas(data);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDiario();
    }, [registroId]);

    const handleSave = async () => {
        if (!nuevoTexto.trim()) return;
        setIsSaving(true);
        try {
            const { data: nuevaEntrada } = await api.saveEntradaDiario({ registro_id: registroId, texto: nuevoTexto });
            setEntradas(prev => [...prev, nuevaEntrada]);
            setNuevoTexto(''); // Limpiamos el textarea
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <LoadingSpinner message="Abriendo tu diario..." />;

    return (
        <div className="flex flex-col h-full p-4">
            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4">Diario de Hoy</h2>
            
            <div className="flex-grow overflow-y-auto space-y-3 mb-4 pr-2">
                {entradas.length === 0 ? (
                    <p className="text-zinc-400 text-center mt-8">Aún no has escrito nada hoy.</p>
                ) : (
                    entradas.map(entrada => <EntradaDiario key={entrada.id} entrada={entrada} />)
                )}
            </div>
            
            <textarea
                className="w-full p-3 h-24 border border-zinc-200 rounded-lg resize-none focus:ring-2 focus:ring-amber-400"
                value={nuevoTexto}
                onChange={(e) => setNuevoTexto(e.target.value)}
                placeholder="Añade una nueva reflexión..."
            />
            <button onClick={handleSave} disabled={isSaving} className="mt-2 w-full p-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold">
                {isSaving ? 'Guardando...' : 'Añadir al Diario'}
            </button>
        </div>
    );
}