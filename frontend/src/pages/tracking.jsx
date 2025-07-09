// EN: frontend/src/pages/Tracking.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './tracking.css'; // Importamos el CSS

export default function Tracking() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchRegistros = async () => {
      try {
        const api = axios.create({
          baseURL: import.meta.env.VITE_API_URL,
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const response = await api.get('/api/registros');
        setRegistros(response.data);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistros();
  }, [navigate]);

  if (loading) {
    return <div className="tracking-container">Cargando tu historial...</div>;
  }

  return (
    <div className="tracking-container">
      <h2>Tu Diario</h2>
      {registros.length > 0 ? (
        <div className="registros-list">
          {registros.map((registro) => (
            <div key={registro.id} className="registro-card">
              <h4>{new Date(registro.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</h4>
              <p><strong>Mente:</strong> {registro.mente_estat} - <em>{registro.mente_coment}</em></p>
              <p><strong>Emoción:</strong> {registro.emocion_estat} - <em>{registro.emocion_coment}</em></p>
              <p><strong>Cuerpo:</strong> {registro.cuerpo_estat} - <em>{registro.cuerpo_coment}</em></p>
            </div>
          ))}
        </div>
      ) : (
        <p>Aún no tienes registros guardados.</p>
      )}
       <button onClick={() => navigate('/home')} className="back-button">Volver</button>
    </div>
  );
}