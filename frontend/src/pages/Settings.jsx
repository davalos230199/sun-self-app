import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
// 1. Importamos el cliente de Supabase para usar su método de logout
import { supabase } from '../services/supabaseClient';
import './Settings.css';

export default function Settings() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    // CAMBIO CLAVE: La función de logout ahora es asíncrona y usa supabase.auth.signOut()
    const handleLogout = async () => {
        try {
            // 2. Le pedimos a Supabase que cierre la sesión.
            // Esto se encargará de limpiar el token de Supabase del localStorage.
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('Error al cerrar sesión:', error);
                // Opcional: mostrar un error al usuario
            }

            // 3. Borramos nuestro token manual por si acaso aún existe
            localStorage.removeItem('token');
            
            // 4. Actualizamos el estado global para que la app sepa que no hay usuario
            setUser(null);
            
            // 5. Redirigimos al login
            navigate('/login');

        } catch (err) {
            console.error('Error inesperado al cerrar sesión:', err);
        }
    };

    return (
        <div className="settings-container">
            <PageHeader title="Ajustes" />
            <div className="settings-card">
                <h3>Cuenta</h3>
                <p>Aquí podrás gestionar tu cuenta en el futuro.</p>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
