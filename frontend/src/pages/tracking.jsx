// frontend/src/pages/Tracking.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader'; // Usamos nuestro header universal
import './Tracking.css';

export default function Tracking() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistros = async () => {
      try {
        const response = await api.getRegistros();
        setRegistros(response.data);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistros();
  }, []);

  return (
    // CLAVE: El contenedor principal ahora usa flexbox para organizar su contenido.
    <div className="tracking-container">
      <PageHeader title="Tu Diario" />
      
      {/* CLAVE: Envolvemos la lista en un contenedor que será el área de scroll. */}
      <div className="registros-list-scrollable">
        {loading ? (
          <p>Cargando tu historial...</p>
        ) : registros.length > 0 ? (
          registros.map((registro) => (
            <div key={registro.id} className="registro-card">
              <h4>{new Date(registro.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</h4>
              <p><strong>Mente:</strong> {registro.mente_estat} - <em>{registro.mente_coment || 'Sin comentario'}</em></p>
              <p><strong>Emoción:</strong> {registro.emocion_estat} - <em>{registro.emocion_coment || 'Sin comentario'}</em></p>
              <p><strong>Cuerpo:</strong> {registro.cuerpo_estat} - <em>{registro.cuerpo_coment || 'Sin comentario'}</em></p>
            </div>
          ))
        ) : (
          <p>Aún no tienes registros guardados.</p>
        )}
      </div>
    </div>
  );
}
