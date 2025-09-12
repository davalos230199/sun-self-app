import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import RitualFlow from '../components/RitualFlow'; // <-- Importar RitualFlow

export default function Settings() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [showRitualModal, setShowRitualModal] = useState(false); // <-- Estado para el modal

    useEffect(() => {
        const entryTimer = setTimeout(() => {
            setIsPageLoading(false);
        }, 750);
        return () => clearTimeout(entryTimer);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error al cerrar sesión:', error);
            }
            localStorage.removeItem('token');
            setUser(null);
            navigate('/login');
        } catch (err) {
            console.error('Error inesperado al cerrar sesión:', err);
            setIsLoggingOut(false);
        }
    };
    
    // --- NUEVA FUNCIÓN ---
    // Esta función se ejecutará cuando el ritual termine.
    // Recibe los datos y cierra el modal.
    const handleRitualFinish = (ritualData) => {
        console.log("El Ritual ha finalizado. Datos recogidos:", ritualData);
        setShowRitualModal(false);
    };

    if (isPageLoading || isLoggingOut) {
        const message = isLoggingOut ? "Vuelve siempre que quieras..." : "Revisando tu espacio...";
        return (
            <main className="flex-grow flex justify-center items-center h-full">
                <LoadingSpinner message={message} />
            </main>
        );
    }
    
    return (
        <>
            <main className="flex flex-col flex-grow w-full max-w-4xl mx-auto overflow-hidden bg-white h-full p-4">
                <div className="flex-grow">
                    <div className="bg-white border border-amber-300 p-5 rounded-xl max-w-md mx-auto shadow-sm">
                        <h3 className="text-2xl font-['Patrick_Hand'] mt-0 border-b border-amber-200 pb-2 mb-4 text-zinc-700">
                            Cuenta
                        </h3>
                        <p className="['Patrick_Hand'] text-zinc-600 mb-6">
                            Aquí podrás gestionar tu cuenta en el futuro.
                        </p>
                        
                        {/* Botón para iniciar el ritual de prueba */}
                        <button 
                            onClick={() => setShowRitualModal(true)}
                            className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 font-['Patrick_Hand'] text-lg py-2.5 px-4 mb-4 rounded-lg transition-colors duration-200"
                        >
                            Probar Ritual
                        </button>

                    </div>
                </div>

                <div className="max-w-md mx-auto w-full space-y-4 py-4">
                    <Link to="/filosofia" className="block text-center w-full bg-white hover:bg-zinc-100 text-zinc-700 border border-amber-300 font-['Patrick_Hand'] text-lg py-2.5 px-4 rounded-lg transition-colors duration-200">
                        Leer nuestra filosofía
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="w-full bg-zinc-700 hover:bg-zinc-800 text-white font-['Patrick_Hand'] text-lg py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </main>

            {/* --- LÓGICA DEL MODAL ACTUALIZADA --- */}
            {/* Ahora le pasamos la función onFinish a RitualFlow */}
            {showRitualModal && <RitualFlow onFinish={handleRitualFinish} />}
        </>
    );
}

