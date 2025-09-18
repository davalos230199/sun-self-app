// frontend/src/pages/Journal.jsx (Versión Reconstruida)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Journal() {
    const { id } = useParams(); // Obtiene el ID del registro desde la URL
    const navigate = useNavigate();

    const [texto, setTexto] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // useEffect para cargar los datos del registro cuando el componente se monta
    useEffect(() => {
        const fetchRegistro = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.getRegistroById(id);
                setTexto(data?.hoja_atras || ''); // Carga el texto existente o un string vacío
            } catch (err) {
                setError('No se pudo cargar tu registro.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRegistro();
    }, [id]);

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        try {
            await api.saveHojaAtras(id, texto);
            navigate('/home'); // Vuelve al home después de guardar
        } catch (err) {
            setError('No se pudo guardar tu reflexión.');
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Abriendo tu diario..." />;
    }

    return (
        <div className="flex flex-col h-full p-4 animate-fade-in">
            <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-4">La Hoja de Atrás</h2>
            <p className="text-sm text-zinc-500 mb-4">
                Este es tu espacio privado para la reflexión. Escribe sin filtros. ¿Qué raíz encontraste en tu estado de hoy?
            </p>
            <textarea
                className="flex-grow w-full p-3 border border-zinc-200 rounded-lg resize-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Tus pensamientos aquí..."
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-4 w-full p-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold disabled:bg-zinc-300 transition-all hover:enabled:scale-[1.02]"
            >
                {isSaving ? 'Guardando...' : 'Guardar Reflexión'}
            </button>
        </div>
    );
}