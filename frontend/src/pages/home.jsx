// frontend/src/pages/home.jsx
import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './home.css';

const opciones = [ { valor: 'bajo', emoji: '🌧️' }, { valor: 'neutral', emoji: '⛅' }, { valor: 'alto', emoji: '☀️' } ];

const PostItOrbe = ({ orbe, estados, onSeleccion, onComentario }) => ( <div className="post-it-orbe"> <div className="post-it-header"> <h3>{orbe}</h3> <div className="orbe-buttons"> {opciones.map(({ valor, emoji }) => ( <button key={valor} className={`icon-button ${estados[orbe].seleccion === valor ? 'selected' : ''}`} onClick={() => onSeleccion(orbe, valor)} type="button" title={valor}> {emoji} </button> ))} </div> </div> <textarea placeholder={`¿Algún pensamiento sobre tu ${orbe}?`} value={estados[orbe].comentario} onChange={(e) => onComentario(orbe, e.target.value)} rows="2" /> </div> );

export default function Home() {
    const { user } = useOutletContext();
    const [estados, setEstados] = useState({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } });
    // 1. Nuevo estado para la meta del día.
    const [metaDelDia, setMetaDelDia] = useState('');
    const [estadoFinalizado, setEstadoFinalizado] = useState(false);
    const [fraseDelDia, setFraseDelDia] = useState('');
    const [climaVisual, setClimaVisual] = useState('');
    const [tieneRegistroPrevio, setTieneRegistroPrevio] = useState(false);
    const [registroId, setRegistroId] = useState(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const fechaDeHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    const generarFrase = useCallback((registro) => { /* ... */ }, []);
    const determinarClima = useCallback((registro) => { /* ... */ }, []);
    
    useEffect(() => {
        if (!user) return;
        const cargarRegistroDelDia = async () => {
            try {
                const registroResponse = await api.getRegistroDeHoy();
                const registroDeHoy = registroResponse.data.registro;
                if (registroDeHoy) {
                    // ... (lógica para setear estados)
                    // 2. Cargamos la meta si ya existe.
                    setMetaDelDia(registroDeHoy.meta_del_dia || '');
                    setEstadoFinalizado(true);
                    setTieneRegistroPrevio(true);
                    setRegistroId(registroDeHoy.id);
                }
            } catch (error) { console.error("No se pudo verificar el registro de hoy:", error); } 
            finally { setIsLoading(false); }
        };
        cargarRegistroDelDia();
    }, [user, generarFrase, determinarClima]);

    const handleGuardar = async () => {
        try {
            // 3. Incluimos la meta en el objeto que se envía a la API.
            const payload = { ...estados, meta_del_dia: metaDelDia };
            const response = await api.saveRegistro(payload);
            const registroGuardado = response.data.registro;
            // ... (lógica para setear frase, clima, etc.)
            setEstadoFinalizado(true);
            setTieneRegistroPrevio(true);
            setRegistroId(registroGuardado.id);
        } catch (error) { console.error("Error al guardar el estado:", error); }
    };

    const handleCancel = () => { /* ... */ };
    const handleSeleccion = (orbe, valor) => { /* ... */ };
    const handleComentario = (orbe, valor) => { /* ... */ };

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
        <div className="daily-dashboard">
          <div className="post-it-display">
            {/* ... (post-it principal) ... */}
          </div>
          {/* 4. Mostramos el post-it de la meta si tiene contenido. */}
          {metaDelDia && (
            <div className="meta-post-it">
              <div className="meta-header">
                <span>🎯</span>
                <h4>Meta del Día</h4>
              </div>
              <p>{metaDelDia}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="formulario-estado">
          <p className="form-subtitle">¿Cómo estás hoy?</p>
          <div className="orbes-container">
            {['mente', 'emocion', 'cuerpo'].map((orbe) => (
              <PostItOrbe key={orbe} orbe={orbe} estados={estados} onSeleccion={handleSeleccion} onComentario={handleComentario} />
            ))}
            {/* 5. Añadimos el campo para la meta en el formulario. */}
            <div className="post-it-orbe">
              <h3>🎯 Meta del Día (opcional)</h3>
              <textarea
                placeholder="¿Cuál es tu pequeño gran objetivo para hoy?"
                value={metaDelDia}
                onChange={(e) => setMetaDelDia(e.target.value)}
                rows="2"
              />
            </div>
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
