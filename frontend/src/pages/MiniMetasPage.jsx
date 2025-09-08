import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner'; // 1. Importamos el spinner

export default function MinimetasPage() {
    const [registro, setRegistro] = useState(null);
    const [miniMetas, setMiniMetas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para el nuevo formulario
    const [newMetaText, setNewMetaText] = useState('');
    const [newMetaTime, setNewMetaTime] = useState('12:00');

    // --- Lógica de Datos (Sin cambios) ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const registroRes = await api.getRegistroDeHoy();
            const todayReg = registroRes?.data?.registro;

            if (todayReg) {
                setRegistro(todayReg);
                const metasRes = await api.getMiniMetas(todayReg.id);
                
                const sortedMetas = (metasRes?.data || []).sort((a, b) => {
                    if (!a.hora_objetivo) return 1;
                    if (!b.hora_objetivo) return -1;
                    return a.hora_objetivo.localeCompare(b.hora_objetivo);
                });

                setMiniMetas(sortedMetas);
            } else {
                setError('Antes de planear tu proximo paso, necesitas un registro diario.');
            }
        } catch (err) {
            console.error("Error al cargar la página de metas:", err);
            setError('Ocurrió un error al cargar tus metas.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateMeta = async (e) => {
        e.preventDefault();
        if (!newMetaText.trim() || !registro) return;
        try {
            const payload = { 
                descripcion: newMetaText, 
                registro_id: registro.id,
                hora_objetivo: newMetaTime
            };
            await api.createMiniMeta(payload);
            fetchData(); 
            setNewMetaText('');
        } catch (err) {
            console.error("Error al crear mini-meta:", err);
        }
    };

    const handleToggleComplete = async (metaId, currentStatus) => {
        try {
            const response = await api.updateMiniMetaStatus(metaId, !currentStatus);
            setMiniMetas(prevMetas => 
                prevMetas.map(meta => meta.id === metaId ? response.data : meta)
            );
        } catch (err) {
            console.error("Error al actualizar mini-meta:", err);
        }
    };

    const handleDeleteMeta = async (metaId) => {
        try {
            await api.deleteMiniMeta(metaId);
            setMiniMetas(prevMetas => prevMetas.filter(meta => meta.id !== metaId));
        } catch (err) {
            console.error("Error al borrar mini-meta:", err);
        }
    };

    // --- Renderizado de la UI (Reconstruido con Tailwind) ---
    // SE ELIMINAN LOS RETURNS ANTICIPADOS DE AQUÍ

    return (
        <div className="p-2 sm:p-4 h-full w-full flex flex-col bg-zinc-50">
            <PageHeader title="Mini Metas Diarias" />
            
            <main className="flex-grow overflow-y-auto border border-amber-300 mt-4 shadow-lg rounded-2xl overflow-hidden bg-white p-4 sm:p-6">
                {isLoading ? (
                    // 1. Estado de Carga (dentro del main)
                    <LoadingSpinner message="Mi proximo paso es..." />
                ) : error ? (
                    // 2. Estado de Error (dentro del main)
                    <div className="text-center py-10">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Link to="/" className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors">
                            Volver al Inicio
                        </Link>
                    </div>
                ) : (
                    // 3. Contenido Exitoso (dentro del main)
                    <>
                        {/* Post-it de la Meta Principal */}
                        <div className="bg-yellow-100 border border-amber-300 p-4 sm:p-6 rounded-lg shadow-md text-center mb-6">
                            <h1 className="font-['Patrick_Hand'] text-2xl sm:text-3xl text-yellow-800 break-words">
                                🎯 {registro?.meta_del_dia || "Define tu meta principal"}
                            </h1>
                        </div>

                        {/* Contenedor de la lista y formulario */}
                        <div className="bg-blue-50 border border-amber-300 rounded-lg shadow-md">
                            {/* Formulario para añadir metas */}
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

                            {/* Lista de Mini-Metas */}
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
        </div>
    );
}