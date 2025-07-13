import { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import './MuroDeSoles.css';

const ClimaEmoji = ({ estado }) => {
    switch (estado) {
        case 'soleado': return '☀️';
        case 'nublado': return '⛅';
        case 'lluvioso': return '🌧️';
        default: return '❔';
    }
};

export default function MuroDeSoles() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setLoading(true);
        const response = await api.getMuroEstados();
        setRegistros(response.data); // Guardamos el array de registros
        setError(null);
      } catch (err) {
        console.error("Error al cargar los estados del muro:", err);
        setError("No se pudo cargar el clima de la comunidad. Inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchEstados();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p className="muro-mensaje">Tejiendo los reflejos de la comunidad...</p>;
    }

    if (error) {
      return <p className="muro-mensaje error">{error}</p>;
    }

    if (registros.length === 0) {
      return <p className="muro-mensaje">El muro está en calma. Nadie ha compartido su reflejo hoy.</p>;
    }

    return (
      <div className="muro-grid">
        {registros.map((registro, index) => (
          <div key={index} className="muro-card">
            <div className="muro-emoji">
                <ClimaEmoji estado={registro.estado_general} />
            </div>
            <div className="muro-frase-burbuja">
              <p>{registro.frase_sunny}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="muro-container">
      <PageHeader title="Muro de Soles" />
      <p className="muro-subtitle">Un mosaico anónimo de los reflejos de hoy.</p>
      {renderContent()}
    </div>
  );
}
