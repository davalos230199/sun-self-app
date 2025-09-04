import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

export default function Settings() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error al cerrar sesión:', error);
            }
            localStorage.removeItem('token');
            setUser(null);
            navigate('/login');
        } catch (err) {
            console.error('Error inesperado al cerrar sesión:', err);
        }
    };

    return (
        // CAMBIO: Contenedor principal de la página con padding para crear separación
        <div className="p-2 sm:p-4 h-full w-full flex flex-col">
            <PageHeader title="Ajustes" />
            
            <main className="flex-grow mt-6">
                <div className="bg-white border border-zinc-200/80 p-5 rounded-xl max-w-md mx-auto shadow-sm">
                    <h3 className="text-2xl font-['Patrick_Hand'] mt-0 border-b border-zinc-200 pb-2 mb-4 text-zinc-700">
                        Cuenta
                    </h3>
                    <p className="text-zinc-600 mb-6">
                        Aquí podrás gestionar tu cuenta en el futuro.
                    </p>
                    <button 
                        onClick={handleLogout} 
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-['Patrick_Hand'] text-lg py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </main>
        </div>
    );
}
