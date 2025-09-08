// frontend/src/pages/Settings.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
// import PageHeader from '../components/PageHeader'; // <-- ELIMINADO

export default function Settings() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);

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

    // CAMBIO: Se elimina el PageHeader y el div contenedor.
    // La página ahora retorna directamente el contenido principal.
    if (isPageLoading) {
        return (
            <main className="flex-grow flex justify-center items-center h-full">
                <LoadingSpinner message="Revisando tu espacio..." />
            </main>
        );
    }

    if (isLoggingOut) {
        return (
            <main className="flex-grow flex justify-center items-center h-full">
                <LoadingSpinner message="Vuelve siempre que quieras..." />
            </main>
        );
    }
    
    return (
        <main className="flex-grow flex flex-col pt-2">
            <div className="flex-grow">
                <div className="bg-white border border-amber-300 p-5 rounded-xl max-w-md mx-auto shadow-sm">
                    <h3 className="text-2xl font-['Patrick_Hand'] mt-0 border-b border-amber-200 pb-2 mb-4 text-zinc-700">
                        Cuenta
                    </h3>
                    <p className="['Patrick_Hand'] text-zinc-600 mb-6">
                        Aquí podrás gestionar tu cuenta en el futuro.
                    </p>
                </div>
            </div>
             <Link to="/filosofia" className="block text-center w-full bg-white hover:bg-zinc-100 text-zinc-700 border border-amber-300 font-['Patrick_Hand'] text-lg py-2.5 px-4 mb-4 rounded-lg transition-colors duration-200">
                Leer nuestra filosofía
            </Link>
            <div className="flex-shrink-0 max-w-md mx-auto w-full py-4">
                <button 
                    onClick={handleLogout} 
                    className="w-full bg-zinc-700 hover:bg-zinc-800 text-white font-['Patrick_Hand'] text-lg py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                    Cerrar Sesión
                </button>
            </div>
        </main>
    );
}