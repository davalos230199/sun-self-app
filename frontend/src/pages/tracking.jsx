// frontend/src/pages/Tracking.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
// 1. ADIÓS a axios. Ahora importamos nuestro agente central.
import api from '../services/api';
import './tracking.css'; // Asumo que tienes este archivo de estilos

export default function Tracking() {
  // Recibimos el usuario del guardián, por si lo necesitamos en el futuro.
  const { user } = useOutletContext(); 
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // La comprobación de 'user' es una buena práctica.
    if (!user) return;

    const fetchRegistros = async () => {
      try {
        // 2. LA MAGIA: En lugar de usar axios, llamamos a la función de nuestro agente.
        // Es más corto, más claro y no necesitamos saber la URL.
        const response = await api.getRegistros();
        setRegistros(response.data);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
        // Podríamos mostrar un mensaje de error al usuario aquí.
      } finally {
        setLoading(false);
      }
    };

    fetchRegistros();
  }, [user]); // El efecto se ejecuta cuando el guardián nos da el usuario.

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
              <p><strong>Mente:</strong> {registro.mente_estat} - <em>{registro.mente_coment || 'Sin comentario'}</em></p>
              <p><strong>Emoción:</strong> {registro.emocion_estat} - <em>{registro.emocion_coment || 'Sin comentario'}</em></p>
              <p><strong>Cuerpo:</strong> {registro.cuerpo_estat} - <em>{registro.cuerpo_coment || 'Sin comentario'}</em></p>
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
