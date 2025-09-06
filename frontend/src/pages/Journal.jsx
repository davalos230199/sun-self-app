// frontend/src/pages/Journal.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner'; // 1. Importamos el spinner

// --- Iconos para los botones y carga (Componentes internos) ---
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
);

const CancelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

export default function Journal() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [texto, setTexto] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchJournalEntry = async () => {
            try {
                const response = await api.getRegistroById(id);
                setTexto(response.data.hoja_atras || '');
            } catch (error) {
                console.error("Error al cargar la entrada del diario:", error);
                navigate('/home');
            } finally {
                setLoading(false);
            }
        };
        fetchJournalEntry();
    }, [id, navigate]);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            // El campo en la DB sigue siendo 'hoja_atras', solo cambia la UI
            await api.saveHojaAtras(id, texto);
            navigate('/home');
        } catch (error) {
            setMessage('Error al guardar.');
            console.error("Error al guardar:", error);
            setSaving(false);
        }
    };

    return (
        <div className="p-2 sm:p-4 h-full w-full flex flex-col">
            {/* CAMBIO DE NOMBRE 1: Título de la página */}
            <PageHeader title="Más de tu día" />
            
            <main className="flex flex-col flex-grow mt-4 w-full max-w-4xl mx-auto border border-amber-300 shadow-lg rounded-2xl overflow-hidden bg-white">
                
                {loading ? (
                    <LoadingSpinner message="Hoy recordé cuando..." />
                ) : (
                    <>
                        <div className="flex-grow flex">
                            <textarea
                                placeholder="Escribe libremente aquí... pensamientos, ideas, listas. Este es tu espacio."
                                value={texto}
                                onChange={(e) => setTexto(e.target.value)}
                                className="font-['Patrick_Hand'] break-words w-full h-full p-5 sm:p-6 text-base sm:text-lg leading-relaxed text-zinc-800 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 placeholder:text-zinc-400"
                                disabled={saving}
                            />
                        </div>
                        
                        <div className="flex-shrink-0 flex items-center justify-between gap-4 p-3 sm:p-4 border-t border-amber-300 bg-zinc-50/70 backdrop-blur-sm">
                            <div className="flex-grow">
                                {message && <span className="text-sm text-red-600 italic">{message}</span>}
                                {saving && <span className="text-sm text-zinc-600 italic animate-pulse">Guardando cambios...</span>}
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => navigate('/home')} 
                                    className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold bg-white text-zinc-700 border border-amber-300 hover:bg-zinc-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
                                >
                                    <CancelIcon />
                                    <span className="hidden sm:inline">Cancelar</span>
                                </button>
                                
                                <button 
                                    onClick={handleSave} 
                                    disabled={saving} 
                                    className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-200 disabled:bg-zinc-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                >
                                    <SaveIcon />
                                    <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar'}</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}