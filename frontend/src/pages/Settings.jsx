import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext'; // 1. Importamos el hook para acceder al contexto
import './Settings.css';

export default function Settings() {
    const navigate = useNavigate();
    const { setUser } = useAuth(); // 2. Obtenemos la función para actualizar el usuario global

    const handleLogout = () => {
        // 3. Borramos el token del almacenamiento local
        localStorage.removeItem('token');
        // 4. ¡LA CLAVE! Actualizamos el estado global, informando a toda la app que no hay usuario
        setUser(null);
        // 5. Redirigimos al usuario a la página de login
        navigate('/login');
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
