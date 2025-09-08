import { useState, useEffect } from 'react'; // 1. Importamos useEffect
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Settings() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    // --- NUEVOS CAMBIOS PARA LA TRANSICIÓN DE ENTRADA ---
    const [isPageLoading, setIsPageLoading] = useState(true); // 2. Nuevo estado de carga para la página

    useEffect(() => {
        // 3. Creamos un temporizador que se ejecuta solo una vez al cargar la página
        const entryTimer = setTimeout(() => {
            setIsPageLoading(false); // Después de 400ms, decimos que la página ya no está cargando
        }, 750); // 400ms es un buen valor, se siente rápido pero perceptible

        // Función de limpieza: si el usuario navega a otra página antes de los 400ms, cancelamos el temporizador
        return () => clearTimeout(entryTimer);
    }, []); // El array vacío asegura que esto se ejecute solo una vez
    // --- FIN DE LOS NUEVOS CAMBIOS ---

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

    return (
        <div className="p-2 sm:p-4 h-full w-full flex flex-col bg-zinc-50">
            <PageHeader title="Ajustes" />

            {/* 4. APLICAMOS LA LÓGICA DE CARGA A TODA LA PÁGINA */}
            {isPageLoading ? (
                <main className="flex-grow mt-6 flex justify-center items-center">
                    <LoadingSpinner message="Revisando tu espacio..." />
                </main>
            ) : isLoggingOut ? (
                <main className="flex-grow mt-6 flex justify-center items-center">
                    <LoadingSpinner message="Vuelve siempre que quieras..." />
                </main>
            ) : (
                <main className="flex-grow mt-6 flex flex-col">
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
            )}
        </div>
    );
}