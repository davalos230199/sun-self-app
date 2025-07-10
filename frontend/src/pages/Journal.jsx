// frontend/src/pages/Journal.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import './Journal.css';

export default function Journal() {
  const { id } = useParams(); // Obtenemos el ID del registro de la URL
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Podríamos cargar el texto existente si el usuario vuelve a entrar
    // Por ahora, lo dejamos simple.
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.saveHojaAtras(id, texto);
      setMessage('¡Guardado con éxito!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Error al guardar.');
      console.error("Error al guardar la hoja de atrás:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="journal-container">
      <PageHeader title="La Hoja de Atrás" />
      <div className="journal-editor">
        <textarea
          placeholder="Escribe libremente aquí..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>
      <div className="journal-actions">
        {message && <span className="save-message">{message}</span>}
        <button onClick={handleSave} disabled={saving} className="primary">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
