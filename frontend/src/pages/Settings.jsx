// frontend/src/pages/Settings.jsx
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader'; // <-- Importamos
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="settings-container">
      {/* CLAVE: Añadimos el PageHeader para consistencia */}
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
