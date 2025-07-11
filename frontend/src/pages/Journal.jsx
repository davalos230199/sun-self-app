// frontend/src/pages/Journal.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import './Journal.css';

export default function Journal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // CLAVE: useEffect ahora carga el texto existente al montar el componente.
  useEffect(() => {
    const fetchJournalEntry = async () => {
      try {
        const response = await api.getRegistroById(id);
        // Si hay texto guardado, lo ponemos en el textarea. Si no, queda vacío.
        setTexto(response.data.hoja_atras || '');
      } catch (error) {
        console.error("Error al cargar la entrada del diario:", error);
        // Si no se encuentra el registro, podríamos redirigir.
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    fetchJournalEntry();
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.saveHojaAtras(id, texto);
      // CLAVE: Después de guardar, navegamos de vuelta al Home.
      navigate('/home');
    } catch (error) {
      setMessage('Error al guardar.');
      console.error("Error al guardar la hoja de atrás:", error);
      setSaving(false);
    }
  };

  if (loading) return <div className="journal-container"><p>Cargando diario...</p></div>;

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
        {/* CLAVE: Añadimos el botón de Cancelar, que simplemente vuelve atrás. */}
        <button onClick={() => navigate('/home')} className="secondary">Cancelar</button>
        <button onClick={handleSave} disabled={saving} className="primary">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
