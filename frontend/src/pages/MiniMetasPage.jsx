// frontend/src/pages/MiniMetasPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDia } from '../contexts/DiaContext';

export default function MiniMetasPage() {

     // 2. CAMBIAMOS LA FUENTE DE DATOS: de useOutletContext a useDia
    const { registroDeHoy, cargarDatosDelDia, miniMetas: metasDelContexto } = useDia();
    // Estados locales
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [miniMetas, setMiniMetas] = useState(metasDelContexto || []);
    const [newMetaText, setNewMetaText] = useState('');
    const [newMetaTime, setNewMetaTime] = useState('12:00');

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoading(false); // Después de 300ms, ocultamos el spinner
        }, 600); // 300ms es un buen valor: rápido pero perceptible

        return () => clearTimeout(timer); // Limpiamos el temporizador si el componente se desmonta
    }, []); // El array vacío asegura que se ejecute solo una vez cuando la página carga


    useEffect(() => {
        const sortedMetas = (metasDelContexto || []).sort((a, b) => {
            if (!a.hora_objetivo) return 1;
            if (!b.hora_objetivo) return -1;
            return a.hora_objetivo.localeCompare(b.hora_objetivo);
        });
        setMiniMetas(sortedMetas);
    }, [metasDelContexto]);

    useEffect(() => {
        // Mantenemos la lógica de error, pero limpiamos el error si hay un registro
        if (!registroDeHoy) {
            setError('Antes de planear tu proximo paso, necesitas un registro diario.');
        } else {
            setError('');
        }
    }, [registroDeHoy]);

    const handleCreateMeta = async (e) => {
        e.preventDefault();
        // CORRECCIÓN: Usamos registroDeHoy
        if (!newMetaText.trim() || !registroDeHoy) return;
        try {
            const payload = { 
                descripcion: newMetaText, 
                // CORRECCIÓN: Usamos registroDeHoy.id
                registro_id: registroDeHoy.id,
                hora_objetivo: newMetaTime
            };
            await api.createMiniMeta(payload);
            // CORRECCIÓN: Llamamos a la función correcta del contexto
            cargarDatosDelDia(); 
            setNewMetaText('');
        } catch (err) {
            console.error("Error al crear mini-meta:", err);
        }
    };

    const handleToggleComplete = async (metaId, currentStatus) => {
        try {
            await api.updateMiniMetaStatus(metaId, !currentStatus);
            cargarDatosDelDia();
        } catch (err) {
            console.error("Error al actualizar mini-meta:", err);
        }
    };

    const handleDeleteMeta = async (metaId) => {
        try {
            await api.deleteMiniMeta(metaId);
            cargarDatosDelDia();
        } catch (err) {
            console.error("Error al borrar mini-meta:", err);
        }
    };

    return (
        <main className="flex flex-col border border-amber-300 shadow-lg rounded-2xl overflow-y-auto bg-white p-4 sm:p-6 h-full">
            {isPageLoading ? (
                <div className="flex-grow flex justify-center items-center">
                    <LoadingSpinner 
                        message="Mi próximo paso es..." 
                        estadoGeneral={registroDeHoy?.estado_general} 
                    />
                </div>
            ) : error ? (
                <div className="text-center py-10 h-full flex flex-col justify-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link to="/home" className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors self-center">
                        Volver al Inicio
                    </Link>
                </div>
            ) : (
                <>
                    <div className="bg-yellow-100 border border-amber-300 p-4 sm:p-6 rounded-lg shadow-md text-center mb-6">
                        <h1 className="font-['Patrick_Hand'] text-2xl sm:text-3xl text-yellow-800 break-words">
                            {/* CORRECCIÓN: Usamos registroDeHoy */}
                            🎯 {registroDeHoy?.meta_del_dia || "Define tu meta principal"}
                        </h1>
                    </div>
                    <div className="bg-blue-50 border border-amber-300 rounded-lg shadow-md">
                        <form onSubmit={handleCreateMeta} className="p-4 flex items-center gap-2 sm:gap-4 border-b-2 border-dashed border-blue-200">
                             <input 
                                type="time" 
                                value={newMetaTime}
                                onChange={e => setNewMetaTime(e.target.value)}
                                className="bg-white border border-blue-200 rounded-md p-2 text-sm sm:text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <input
                                type="text"
                                value={newMetaText}
                                onChange={(e) => setNewMetaText(e.target.value)}
                                placeholder="Añade un pequeño paso..."
                                className="flex-grow bg-transparent border-b-2 border-dotted border-blue-300 focus:border-solid focus:border-blue-500 focus:outline-none py-2 text-zinc-700 placeholder:text-zinc-400"
                            />
                            <button type="submit" className="text-3xl text-zinc-500 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Añadir meta" disabled={!newMetaText.trim()}>
                                ➕
                            </button>
                        </form>
                        <div className="divide-y divide-dashed divide-blue-200">
                            {miniMetas.map(meta => (
                                <div key={meta.id} className="p-4 flex items-center gap-4">
                                    <div className="font-bold text-sm text-blue-600 bg-white border border-blue-200 rounded-md px-2 py-1">
                                        {meta.hora_objetivo ? meta.hora_objetivo.substring(0, 5) : '--:--'}
                                    </div>
                                    <div className="flex-grow flex items-center gap-3 cursor-pointer" onClick={() => handleToggleComplete(meta.id, meta.completada)}>
                                        <div className={`w-6 h-6 border-2 ${meta.completada ? 'bg-blue-500 border-blue-500' : 'border-blue-300'} rounded-md flex items-center justify-center text-white transition-all`}>
                                            {meta.completada && '✔'}
                                        </div>
                                        <p className={`flex-1 ${meta.completada ? 'line-through text-zinc-400' : 'text-zinc-800'} transition-colors`}>
                                            {meta.descripcion}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDeleteMeta(meta.id)} className="text-xl text-zinc-400 hover:text-red-500 transition-colors" aria-label="Borrar meta">
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}