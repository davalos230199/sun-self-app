// EN: frontend/src/pages/Progreso.jsx (Reemplazo total)

import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Tu api.js
import LoadingSpinner from '../components/LoadingSpinner';

// --- ¡NUEVO! Sub-componente para Metas de Pixela ---
const MetaTracker = ({ meta, onLog }) => {
    // ¡OJO! Reemplaza esto con tu username real de Pixela que creaste.
    const PIXELA_USERNAME_FRONTEND = 'danilo-sunself-admin'; 

    const graphUrl = `https://pixe.la/v1/users/${PIXELA_USERNAME_FRONTEND}/graphs/${meta.pixela_graph_id}.svg`;

    return (
        <div className="p-4 bg-white rounded-2xl shadow-lg border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-800">{meta.nombre}</h3>
            
            {/* El "Calendario" (El SVG de Pixela) */}
            <div className="w-full overflow-x-auto my-3">
                <img 
                    src={`https://pixe.la/v1/users/${PIXELA_USERNAME_FRONTEND}/graphs/${meta.pixela_graph_id}.svg?mode=short&${new Date().getTime()}`} 
                    alt={`Gráfico de ${meta.nombre}`}
                />
            </div>
            
            {/* El botón de "¡Lo hice!" */}
            <button 
                onClick={() => onLog(meta.pixela_graph_id)}
                className="w-full p-2 bg-green-500 text-white rounded-md font-bold"
            >
                Marcar como Hecho Hoy
            </button>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL (Construido desde Cero) ---
export default function Progreso() {
    const [habitos, setHabitos] = useState([]); // Usamos 'habitos'
    const [nuevoHabitoNombre, setNuevoHabitoNombre] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // --- Cargar los "Hábitos" (de Supabase) al abrir ---
    const fetchHabitos = async () => {
        setIsLoading(true);
        try {
            // (Debes crear api.getHabitos() en api.js)
            const response = await api.getHabitos(); 
            setHabitos(response.data); // Asumiendo que api.js devuelve response.data
        } catch (error) {
            console.error("Error al cargar hábitos:", error);
        }
        setIsLoading(false);
    };

    // Cargar datos al montar la página
    useEffect(() => {
        fetchHabitos();
    }, []);

    // --- Handlers para Hábitos ---
    const handleCrearHabito = async (e) => {
        e.preventDefault();
        if (nuevoHabitoNombre.trim() === '') return;
        try {
            // (Debes crear api.crearHabito() en api.js)
            await api.crearHabito({ nombre: nuevoHabitoNombre }); 
            setNuevoHabitoNombre('');
            fetchHabitos(); // Recargar la lista
        } catch (error) {
            console.error("Error creando hábito:", error);
        }
    };

    const handleLogPixel = async (graphID) => {
        try {
            // (Debes crear api.logHabito() en api.js)
            await api.logHabito(graphID); 
            alert('¡Hábito registrado!');
            fetchHabitos(); // Recargar todo para actualizar el SVG
        } catch (error) {
            console.error("Error registrando pixel:", error);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando hábitos..." />;
    }

    return (
        <main className="h-full overflow-y-auto p-4 space-y-6">
            
            <section id="habitos-diarios">
                <h2 className="font-['Patrick_Hand'] text-3xl text-zinc-800 text-center mb-4">
                    Mis Hábitos (Progreso)
                </h2>

                {/* Formulario de creación */}
                <form onSubmit={handleCrearHabito} className="flex space-x-2 mb-6">
                    <input
                        type="text"
                        value={nuevoHabitoNombre}
                        onChange={(e) => setNuevoHabitoNombre(e.target.value)}
                        placeholder="Nuevo hábito (ej: Meditar)"
                        className="flex-1 p-3 rounded-lg border border-zinc-300"
                    />
                    <button type="submit" className="p-3 bg-amber-500 text-white rounded-lg font-bold">
                        Crear Hábito
                    </button>
                </form>

                {/* Lista de Hábitos y Gráficos */}
                <div className="space-y-6">
                    {habitos.length === 0 && (
                        <p className="text-center text-zinc-500">
                            Crea tu primer hábito para empezar a registrar tu progreso.
                        </p>
                    )}
                    {habitos.map(habito => (
                        <MetaTracker 
                            key={habito.pixela_graph_id} 
                            meta={habito} 
                            onLog={handleLogPixel} 
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}