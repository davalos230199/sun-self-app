// frontend/src/pages/home.jsx
import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './home.css';

// El array de opciones con emojis se mantiene, es perfecto.
const opciones = [
  { valor: 'bajo', emoji: '🌧️' },
  { valor: 'neutral', emoji: '⛅' },
  { valor: 'alto', emoji: '☀️' }
];

// CLAVE: Reconstruimos el componente interno para la nueva estructura.
const PostItOrbe = ({ orbe, estados, onSeleccion, onComentario }) => (
  <div className="post-it-orbe">
    <div className="post-it-header">
      <h3>{orbe}</h3>
      <div className="orbe-buttons">
        {opciones.map(({ valor, emoji }) => (
          <button
            key={valor}
            className={`icon-button ${estados[orbe].seleccion === valor ? 'selected' : ''}`}
            onClick={() => onSeleccion(orbe, valor)}
            type="button"
            title={valor}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
    <textarea
      placeholder={`¿Algún pensamiento sobre tu ${orbe}?`}
      value={estados[orbe].comentario}
      onChange={(e) => onComentario(orbe, e.target.value)}
      rows="2" // Reducimos las filas para ahorrar espacio
    />
  </div>
);

export default function Home() {
    // ... (toda la lógica de Home no necesita cambios)
    const { user } = useOutletContext();
    const [estados, setEstados] = useState({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } });
    const [estadoFinalizado, setEstadoFinalizado] = useState(false);
    const [fraseDelDia, setFraseDelDia] = useState('');
    const [climaVisual, setClimaVisual] = useState('');
    const [tieneRegistroPrevio, setTieneRegistroPrevio] = useState(false);
    const [registroId, setRegistroId] = useState(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const fechaDeHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const generarFrase = useCallback((registro) => { const m = registro.mente_estat; const emo = registro.emocion_estat; const c = registro.cuerpo_estat; if (m === 'bajo' || emo === 'bajo') return 'Hoy tu energía parece pedirte calma. Permítete frenar un poco.'; if (emo === 'alto' && c === 'alto') return 'Estás vibrando con intensidad, canalízalo con intención.'; if (m === 'alto') return 'Mente clara, horizonte abierto. Aprovéchalo para avanzar.'; return 'Hoy estás navegando tus estados con honestidad. Eso también es fuerza.'; }, []);
    const determinarClima = useCallback((registro) => { const valores = [registro.mente_estat, registro.emocion_estat, registro.cuerpo_estat]; const puntaje = valores.reduce((acc, val) => { if (val === 'alto') return acc + 1; if (val === 'bajo') return acc - 1; return acc; }, 0); if (puntaje >= 2) return '☀️'; if (puntaje <= -2) return '🌧️'; return '⛅'; }, []);
    useEffect(() => { if (!user) return; const cargarRegistroDelDia = async () => { try { const registroResponse = await api.getRegistroDeHoy(); const registroDeHoy = registroResponse.data.registro; if (registroDeHoy) { const estadosGuardados = { mente: { seleccion: registroDeHoy.mente_estat, comentario: registroDeHoy.mente_coment }, emocion: { seleccion: registroDeHoy.emocion_estat, comentario: registroDeHoy.emocion_coment }, cuerpo: { seleccion: registroDeHoy.cuerpo_estat, comentario: registroDeHoy.cuerpo_coment } }; setEstados(estadosGuardados); setFraseDelDia(generarFrase(registroDeHoy)); setClimaVisual(determinarClima(registroDeHoy)); setEstadoFinalizado(true); setTieneRegistroPrevio(true); setRegistroId(registroDeHoy.id); } } catch (error) { console.error("No se pudo verificar el registro de hoy:", error); } finally { setIsLoading(false); } }; cargarRegistroDelDia(); }, [user, generarFrase, determinarClima]);
    const handleGuardar = async () => { try { const response = await api.saveRegistro(estados); const registroGuardado = response.data.registro; setFraseDelDia(generarFrase(registroGuardado)); setClimaVisual(determinarClima(registroGuardado)); setEstadoFinalizado(true); setTieneRegistroPrevio(true); setRegistroId(registroGuardado.id); } catch (error) { console.error("Error al guardar el estado:", error); } };
    const handleCancel = () => { if (tieneRegistroPrevio) { setEstadoFinalizado(true); } else { setEstados({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } }); } };
    const handleSeleccion = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], seleccion: valor } })); };
    const handleComentario = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: valor } })); };

  if (isLoading) {
    return ( <div className="home-content loading-state"> <p>Cargando tu día...</p> </div> );
  }

  return (
    <div className="home-content">
      <header className="home-header">
        <span className="greeting">Hola, {user.nombre}</span>
        <span className="date-display">{fechaDeHoy}</span>
      </header>
      {estadoFinalizado ? (
        <div className="post-it-display">
          <button className="edit-button" onClick={() => setEstadoFinalizado(false)} title="Editar estado">✏️</button>
          <h3>Tu estado de hoy</h3>
          <div className="clima-visual">{climaVisual}</div>
          <p className="frase-del-dia">{fraseDelDia}</p>
          <footer className="post-it-footer">
            <a onClick={() => navigate(`/journal/${registroId}`)}>Escribir en la hoja de atrás...</a>
          </footer>
        </div>
      ) : (
        <div className="formulario-estado">
          <p className="form-subtitle">¿Cómo estás hoy?</p>
          <div className="orbes-container">
            {['mente', 'emocion', 'cuerpo'].map((orbe) => (
              <PostItOrbe key={orbe} orbe={orbe} estados={estados} onSeleccion={handleSeleccion} onComentario={handleComentario} />
            ))}
          </div>
          <footer className="form-actions">
            <button onClick={handleCancel} className="secondary">Cancelar</button>
            <button onClick={handleGuardar} className="primary">Guardar</button>
          </footer>
        </div>
      )}
    </div>
  );
}
