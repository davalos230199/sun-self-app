import { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import './MuroDeSoles.css'; // <-- Importamos los nuevos estilos

export default function MuroDeSoles() {
  const [estados, setEstados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setLoading(true);
        const response = await api.getMuroEstados();
        setEstados(response.data); // Guardamos { soleado: X, nublado: Y, lluvioso: Z }
        setError(null);
      } catch (err) {
        console.error("Error al cargar los estados del muro:", err);
        setError("No se pudo cargar el clima de la comunidad. Inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchEstados();
  }, []); // El array vacío asegura que se ejecute solo una vez

  const renderContent = () => {
    if (loading) {
      return <p className="muro-mensaje">Cargando el clima de la comunidad...</p>;
    }

    if (error) {
      return <p className="muro-mensaje error">{error}</p>;
    }

    if (estados) {
      const total = estados.soleado + estados.nublado + estados.lluvioso;
      if (total === 0) {
        return <p className="muro-mensaje">Nadie ha registrado su estado hoy aún. ¡Sé el primero!</p>;
      }

      return (
        <div className="estados-display">
          <div className="estado-card soleado">
            <span className="estado-emoji">☀️</span>
            <span className="estado-conteo">{estados.soleado}</span>
            <span className="estado-label">Soleado</span>
          </div>
          <div className="estado-card nublado">
            <span className="estado-emoji">⛅</span>
            <span className="estado-conteo">{estados.nublado}</span>
            <span className="estado-label">Nublado</span>
          </div>
          <div className="estado-card lluvioso">
            <span className="estado-emoji">🌧️</span>
            <span className="estado-conteo">{estados.lluvioso}</span>
            <span className="estado-label">Lluvioso</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="muro-container">
      <PageHeader title="Muro de Soles" />
      <p className="muro-subtitle">Así se siente la comunidad de Sun-Self hoy.</p>
      {renderContent()}
    </div>
  );
}
