// frontend/src/pages/Tracking.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader'; // <-- Importamos el header
import './Tracking.css';

export default function Tracking() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistros = async () => {
      try {
        const response = await api.getRegistros();
        setRegistros(response.data);
      } catch (error) { console.error("Error al cargar el historial:", error); }
      finally { setLoading(false); }
    };
    fetchRegistros();
  }, []);

  return (
    <div className="tracking-container">
      <PageHeader title="Tu Diario" />
      {loading ? (
        <p>Cargando tu historial...</p>
      ) : registros.length > 0 ? (
        <div className="registros-list">
          {registros.map((registro) => (
            <div key={registro.id} className="registro-card">
              <h4>{new Date(registro.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</h4>
              <p><strong>Mente:</strong> {registro.mente_estat} - <em>{registro.mente_coment || 'Sin comentario'}</em></p>
              <p><strong>Emoción:</strong> {registro.emocion_estat} - <em>{registro.emocion_coment || 'Sin comentario'}</em></p>
              <p><strong>Cuerpo:</strong> {registro.cuerpo_estat} - <em>{registro.cuerpo_coment || 'Sin comentario'}</em></p>
            </div>
          ))}
        </div>
      ) : (
        <p>Aún no tienes registros guardados.</p>
      )}
    </div>
  );
}
