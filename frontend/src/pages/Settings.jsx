import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importamos el hook completo
import LoadingSpinner from '../components/LoadingSpinner';
import { useDia } from '../contexts/DiaContext';

export default function Settings() {
    // 1. Obtenemos la función 'logout' de nuestro contexto
    const { signOut } = useAuth();
    const { registroDeHoy } = useDia();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        const entryTimer = setTimeout(() => setIsPageLoading(false), 750);
        return () => clearTimeout(entryTimer);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        // La nueva lógica es increíblemente simple
        try {
            await signOut();
            // No necesitamos hacer navigate() ni setUser(null), el AuthContext ya lo hace.
        } catch (error) {
            console.error("Error al cerrar sesión desde Settings:", error);
            // Si falla, al menos nos aseguramos de que el spinner se detenga
            setIsLoggingOut(false);
        }
    };

    if (isPageLoading || isLoggingOut) {
        const message = isLoggingOut ? "Vuelve siempre que quieras..." : "Revisando tu espacio...";
        return (
            <main className="flex-grow flex justify-center items-center h-full">
                {/* 3. UNIFICACIÓN: Conectamos el spinner al estado general */}
                <LoadingSpinner 
                    message={message} 
                    estadoGeneral={registroDeHoy?.estado_general}
                />
            </main>
        );
    }
    
    return (
        <main className="flex flex-col flex-grow w-full max-w-4xl mx-auto overflow-hidden bg-white h-full p-4">
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

            <div className="max-w-md mx-auto w-full space-y-4 py-4">
                <Link to="/filosofia" className="block text-center w-full bg-white hover:bg-zinc-100 text-zinc-700 border border-amber-300 font-['Patrick_Hand'] text-lg py-2.5 px-4 rounded-lg transition-colors duration-200">
                    Leer nuestra filosofía
                </Link>
            <button 
                onClick={handleLogout} 
                disabled={isLoggingOut} // Usamos el estado para deshabilitar el botón
                className="w-full bg-zinc-700 hover:bg-zinc-800 text-white ... disabled:bg-zinc-500"
            >
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
            </button>
            </div>
        </main>
    );
}