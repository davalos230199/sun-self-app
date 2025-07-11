// frontend/src/pages/Tracking.jsx
import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal'; // <-- 1. Importamos nuestro nuevo componente
import './Tracking.css';

const MenteIcon = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.64-.1 2.42-.29.8-.19 1.58-.49 2.3-.87.73-.38 1.41-.86 2.02-1.43.61-.57 1.13-1.23 1.56-1.95.43-.72.76-1.5.98-2.32.22-.82.34-1.67.34-2.54s-.12-1.72-.34-2.54c-.22-.82-.55-1.6-.98-2.32s-.95-1.38-1.56-1.95c-.61-.57-1.29-1.05-2.02-1.43-.72-.38-1.5-.68-2.3-.87C13.64 2.1 12.83 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 6c-1.93 0-3.5 1.57-3.5 3.5S10.07 13 12 13s3.5-1.57 3.5-3.5S13.93 6 12 6z"/></svg>;
const EmocionIcon = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a.999.999 0 0 1-.71-.29L3.58 14a6.5 6.5 0 0 1 9.19-9.19l.23.23.23-.23a6.5 6.5 0 0 1 9.19 9.19l-7.71 7.71A.999.999 0 0 1 12 22z"/></svg>;
const CuerpoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-5v12c0 1.1-.9 2-2 2s-2-.9-2-2v-7h-2v7c0 1.1-.9 2-2 2s-2-.9-2-2V9H3c-1.1 0-2-.9-2-2s.9-2 2-2h18c1.1 0 2 .9 2 2s-.9 2-2 2z"/></svg>;
const JournalIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;

export default function Tracking() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  // --- 2. Nuevos estados para manejar el modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const determinarClima = useCallback((registro) => { /* ... (sin cambios) ... */
    const valores = [registro.mente_estat, registro.emocion_estat, registro.cuerpo_estat];
    const puntaje = valores.reduce((acc, val) => { if (val === 'alto') return acc + 1; if (val === 'bajo') return acc - 1; return acc; }, 0);
    if (puntaje >= 2) return '☀️'; if (puntaje <= -2) return '🌧️'; return '⛅';
  }, []);

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

  // --- 3. Funciones para abrir y cerrar el modal ---
  const handleOpenModal = (registro) => {
    setSelectedRecord(registro);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="tracking-container">
      <PageHeader title="Tu Diario" />
      <div className="registros-list-scrollable">
        {loading ? (
          <p>Cargando tu historial...</p>
        ) : registros.length > 0 ? (
          registros.map((registro) => (
            // 4. Añadimos el onClick a la tarjeta para abrir el modal
            <div key={registro.id} className="registro-card" onClick={() => handleOpenModal(registro)}>
              <div className="card-header">
                <h4>{new Date(registro.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                <div className="card-header-icons">
                  {registro.hoja_atras && (
                    <div className="journal-indicator" title="Tiene una entrada de diario">
                      <JournalIcon />
                    </div>
                  )}
                  <div className="clima-visual">{determinarClima(registro)}</div>
                </div>
              </div>
              <div className="card-body">
                {/* ... (el resto del JSX de la card-body no cambia) ... */}
                <div className="orbe-detalle"> <div className="orbe-icono"><MenteIcon /></div> <div> <span className="estado">{registro.mente_estat}</span> <p className="comentario">{registro.mente_coment || 'Sin comentario'}</p> </div> </div>
                <div className="orbe-detalle"> <div className="orbe-icono"><EmocionIcon /></div> <div> <span className="estado">{registro.emocion_estat}</span> <p className="comentario">{registro.emocion_coment || 'Sin comentario'}</p> </div> </div>
                <div className="orbe-detalle"> <div className="orbe-icono"><CuerpoIcon /></div> <div> <span className="estado">{registro.cuerpo_estat}</span> <p className="comentario">{registro.cuerpo_coment || 'Sin comentario'}</p> </div> </div>
              </div>
            </div>
          ))
        ) : (
          <p>Aún no tienes registros guardados.</p>
        )}
      </div>

      {/* --- 5. Renderizamos el Modal con el contenido de la "Hoja de Atrás" --- */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedRecord && (
          <div className="journal-modal-content">
            <h3>Diario del {new Date(selectedRecord.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
            <p className="journal-text">
              {selectedRecord.hoja_atras || 'No se escribió nada en la hoja de atrás para este día.'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
