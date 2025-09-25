import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDia } from '../contexts/DiaContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Bell, Shield, BookOpen, LogOut } from 'lucide-react'; // Importamos iconos temáticos

// Sub-componente para cada fila de ajuste, para mantener el código limpio
const SettingRow = ({ icon, title, description, to }) => (
    <Link to={to} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:bg-zinc-50 transition-colors">
        <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-zinc-800">{title}</h3>
            <p className="text-sm text-zinc-500">{description}</p>
        </div>
    </Link>
);

export default function Settings() {
    const { signOut } = useAuth(); // Asumiendo que se llama signOut
    const { registroDeHoy } = useDia();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Simplificamos la lógica de carga, ya no necesitamos 'isPageLoading'
    // El spinner se mostrará solo al cerrar sesión.

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
        } catch (error) {
            console.error("Error al cerrar sesión desde Settings:", error);
            setIsLoggingOut(false);
        }
    };

    if (isLoggingOut) {
        return (
            <main className="flex-grow flex justify-center items-center h-full">
                <LoadingSpinner 
                    message="Vuelve cuando quieras..." 
                    estadoGeneral={registroDeHoy?.estado_general}
                />
            </main>
        );
    }
    
    return (
        // Usamos flexbox para empujar el botón de logout al final
        <main className="flex flex-col h-full p-4 space-y-9">
            
            {/* --- Grupo de Ajustes Principales --- */}
            <div className="space-y-3">
                <SettingRow 
                    icon={<User size={24} />}
                    title="Perfil"
                    description="Gestiona tu nombre y datos personales."
                    to="#" // En el futuro, a '/settings/profile'
                />
                <SettingRow 
                    icon={<Bell size={24} />}
                    title="Notificaciones"
                    description="Configura tus recordatorios y avisos."
                    to="#" // En el futuro, a '/settings/notifications'
                />
                <SettingRow 
                    icon={<Shield size={24} />}
                    title="Privacidad"
                    description="Controla cómo se usan tus datos."
                    to="#" // En el futuro, a '/settings/privacy'
                />
            </div>

            {/* --- Grupo de Información --- */}
            <div className="space-y-3">
                 <SettingRow 
                    icon={<BookOpen size={24} />}
                    title="Nuestra Filosofía"
                    description="Lee sobre los principios de Sun Self."
                    to="/filosofia"
                />
            </div>
            
            {/* El botón de logout ahora está al final de la página */}
            <div className="mt-auto">
                <button 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-3 text-center bg-zinc-700 hover:bg-zinc-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm disabled:bg-zinc-500"
                >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </main>
    );
}