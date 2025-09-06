import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// --- Sub-componente: Modal de Respiración ---
const BreathingModal = ({ onStart }) => {
    const [text, setText] = useState('Inhala...');

    useEffect(() => {
        const inhaleTimer = setTimeout(() => setText('Exhala...'), 4000);
        const exhaleTimer = setTimeout(() => setText('Inhala...'), 8000);
        return () => {
            clearTimeout(inhaleTimer);
            clearTimeout(exhaleTimer);
        };
    }, [text]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center gap-6 w-full max-w-sm border-2 border-amber-300"
            >
                <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.25, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute w-full h-full bg-amber-400 rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1.25, 1, 1.25], rotate: [360, 180, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute w-full h-full bg-amber-300 rounded-full opacity-75"
                    />
                    <span className="relative font-['Patrick_Hand'] text-2xl text-white drop-shadow-md">
                        {text}
                    </span>
                </div>
                <h2 className="font-['Patrick_Hand'] text-2xl text-zinc-700">Respira profundo antes de registrar tu día.</h2>
                <button
                    onClick={onStart}
                    className="mt-4 bg-amber-400 text-white font-['Patrick_Hand'] text-xl px-8 py-3 w-full rounded-xl shadow-lg hover:bg-amber-500 transition-colors transform hover:scale-105"
                >
                    Comenzar
                </button>
            </motion.div>
        </motion.div>
    );
};

// --- Sub-componente: Modal de Consentimiento para Inspiración ---
const InspirationConsentModal = ({ onConfirm, onDisable, onCancel }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6 text-center w-full max-w-sm border-2 border-amber-300 relative">
            <button onClick={onCancel} className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 text-2xl">&times;</button>
            <h3 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-2">Buscar Inspiración</h3>
            <p className="text-zinc-600 mb-4 text-sm">Estás por ver un ejemplo anónimo de otro usuario.</p>
            <div className="flex flex-col gap-2">
                <button onClick={onConfirm} className="bg-amber-400 text-white font-['Patrick_Hand'] text-lg px-6 py-2 rounded-xl shadow-md hover:bg-amber-500 transition-colors">Ver Ejemplo</button>
                <button onClick={onDisable} className="text-xs text-zinc-500 hover:underline">No volver a mostrar este aviso</button>
            </div>
        </motion.div>
    </motion.div>
);

// --- Sub-componente: Modal para añadir Meta del Día ---
const GoalModal = ({ onSaveGoal, onSkip }) => {
    const [meta, setMeta] = useState('');
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm border-2 border-amber-300 relative">
                <button onClick={onSkip} className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 text-2xl">&times;</button>
                <h3 className="font-['Patrick_Hand'] text-2xl text-zinc-800 mb-2 text-center">Tu Meta del Día</h3>
                <p className="text-zinc-600 mb-4 text-sm text-center">Define un pequeño gran objetivo para hoy.</p>
                <textarea placeholder="ej: sonreír a un extraño..." value={meta} onChange={(e) => setMeta(e.target.value)} rows="2" className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2 text-zinc-700 placeholder:font-['Patrick_Hand'] placeholder:text-zinc-400 placeholder:italic focus:outline-none focus:ring-2 focus:ring-amber-400"/>
                <div className="flex flex-col gap-2 mt-4">
                    <button onClick={() => onSaveGoal(meta)} className="bg-amber-400 text-white font-['Patrick_Hand'] text-lg px-6 py-2 rounded-xl shadow-md hover:bg-amber-500 transition-colors">Guardar Meta</button>
                    <button onClick={onSkip} className="text-xs text-zinc-500 hover:underline">Omitir por ahora</button>
                </div>
            </motion.div>
        </motion.div>
    )
};

// --- Sub-componente: Orbe de Estado Individual (Compacto) ---
const PostItOrbe = ({ orbe, estados, onSeleccion, onComentario, onInspiracionClick }) => {
    const opciones = [{ valor: 'bajo', emoji: '🌧️' }, { valor: 'neutral', emoji: '⛅' }, { valor: 'alto', emoji: '☀️' }];
    const placeholders = { mente: "ej: un poco disperso...", emocion: "ej: tranquilo...", cuerpo: "ej: con energía..." };

    return (
        <div onClick={() => onInspiracionClick(orbe)} className="bg-white border border-amber-400 rounded-lg shadow-sm p-2 w-full cursor-pointer transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center">
                <h3 className="font-['Patrick_Hand'] text-xl text-zinc-800 capitalize">{orbe}</h3>
                <div className="flex gap-2">
                    {opciones.map(({ valor, emoji }) => (
                        <button key={valor} onClick={(e) => { e.stopPropagation(); onSeleccion(orbe, valor); }} type="button" title={valor} className={`w-9 h-9 text-xl rounded-full flex items-center justify-center transition-all duration-200 border-2 ${estados[orbe].seleccion === valor ? 'border-amber-500 ring-2 ring-amber-500 ring-offset-1 bg-amber-100' : 'border-amber-300 bg-white hover:bg-amber-50'}`}>
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t-2 border-dashed border-amber-200">
                <textarea placeholder={placeholders[orbe]} value={estados[orbe].comentario} onChange={(e) => onComentario(orbe, e.target.value)} onClick={(e) => e.stopPropagation()} rows="1" className="w-full bg-transparent text-zinc-700 font-sans placeholder:font-['Patrick_Hand'] placeholder:text-zinc-400 placeholder:italic focus:outline-none resize-none mt-1 text-sm"/>
            </div>
        </div>
    );
};


export default function RegistroForm({ onSaveSuccess }) {
    const [estados, setEstados] = useState({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showBreathingModal, setShowBreathingModal] = useState(true);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [inspirationModal, setInspirationModal] = useState({ isOpen: false, orbe: null });
    
    const handleSeleccion = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], seleccion: valor } })); };
    const handleComentario = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: valor } })); };
    
    const fetchInspiration = async (orbe) => {
        try {
            const response = await api.getInspiracion(orbe);
            setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: response.data.inspiracion } }));
        } catch (err) { console.error("Error al obtener inspiración:", err); setError("No se pudo obtener la inspiración."); }
    };
    
    const handleInspiracionClick = (orbe) => {
        const hideModal = localStorage.getItem('sunself_hide_inspiration_modal');
        if (hideModal) { fetchInspiration(orbe); } else { setInspirationModal({ isOpen: true, orbe }); }
    };
    
    const handleConfirmInspiration = () => {
        if (inspirationModal.orbe) { fetchInspiration(inspirationModal.orbe); }
        setInspirationModal({ isOpen: false, orbe: null });
    };

    const handleDisableInspirationForever = () => {
        localStorage.setItem('sunself_hide_inspiration_modal', 'true');
        setInspirationModal({ isOpen: false, orbe: null });
    };
    
    const handleOpenGoalModal = () => {
        setError('');
        if (!estados.mente.seleccion || !estados.emocion.seleccion || !estados.cuerpo.seleccion) {
            setError("Por favor, selecciona un estado para cada orbe.");
            return;
        }
        setShowGoalModal(true);
    };

    const handleSaveAll = async (meta) => {
        setIsSaving(true);
        setShowGoalModal(false);
        try {
            const payload = {
                mente: { seleccion: estados.mente.seleccion, comentario: estados.mente.comentario },
                emocion: { seleccion: estados.emocion.seleccion, comentario: estados.emocion.comentario },
                cuerpo: { seleccion: estados.cuerpo.seleccion, comentario: estados.cuerpo.comentario },
                meta_del_dia: meta,
                compartir_anonimo: false,
            };
            await api.saveRegistro(payload);
            onSaveSuccess();
        } catch (error) {
            console.error("Detalle del error del backend:", error.response?.data || error.message);
            setError("No se pudo guardar el registro.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <AnimatePresence>
                {showBreathingModal && <BreathingModal onStart={() => setShowBreathingModal(false)} />}
                {inspirationModal.isOpen && ( <InspirationConsentModal onConfirm={handleConfirmInspiration} onDisable={handleDisableInspirationForever} onCancel={() => setInspirationModal({ isOpen: false, orbe: null })} /> )}
                {showGoalModal && ( <GoalModal onSaveGoal={handleSaveAll} onSkip={() => handleSaveAll('')} /> )}
            </AnimatePresence>

            <div className="flex-grow overflow-y-auto space-y-2 p-4">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-2">{error}</p>}
                
                {['mente', 'emocion', 'cuerpo'].map((orbe) => (
                    <PostItOrbe key={orbe} orbe={orbe} estados={estados} onSeleccion={handleSeleccion} onComentario={handleComentario} onInspiracionClick={handleInspiracionClick} />
                ))}
            </div>

            <div className="flex-shrink-0 p-4 border-t border-zinc-200 bg-white">
                <button 
                    onClick={handleOpenGoalModal} 
                    className="w-full bg-amber-400 text-white font-['Patrick_Hand'] text-2xl py-3 rounded-xl shadow-lg hover:bg-amber-500 transition-colors transform hover:scale-105 disabled:bg-zinc-300" 
                    disabled={isSaving}
                >
                    {isSaving ? 'Guardando...' : 'Continuar'}
                </button>
            </div>
        </div>
    );
}