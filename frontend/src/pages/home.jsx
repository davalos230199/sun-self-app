import { useEffect, useState, useCallback, useRef } from 'react';
import WelcomeModal from '../components/WelcomeModal';
import api from '../services/api';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './home.css';

const opciones = [ { valor: 'bajo', emoji: '🌧️' }, { valor: 'neutral', emoji: '⛅' }, { valor: 'alto', emoji: '☀️' } ];

// CAMBIO: El componente PostItOrbe ahora es más inteligente y tiene el botón de inspiración
const PostItOrbe = ({ orbe, estados, onSeleccion, onComentario, onInspiracion }) => {
const [pidiendoInspiracion, setPidiendoInspiracion] = useState(false);

const handleInspiracionClick = async () => {
    setPidiendoInspiracion(true);
    await onInspiracion(orbe);
    setPidiendoInspiracion(false);
  };

  return (
    <div className="post-it-orbe">
      <div className="post-it-header">
        <h3>{orbe}</h3>
        <div className="orbe-buttons">
          {opciones.map(({ valor, emoji }) => (
            <button key={valor} className={`icon-button ${estados[orbe].seleccion === valor ? 'selected' : ''}`} onClick={() => onSeleccion(orbe, valor)} type="button" title={valor}>{emoji}</button>
          ))}
        </div>
      </div>
      <textarea
        placeholder={pidiendoInspiracion ? "Buscando inspiración..." : `¿Algún pensamiento sobre tu ${orbe}?`}
        value={estados[orbe].comentario}
        onChange={(e) => onComentario(orbe, e.target.value)}
        rows="2"
      />
      <div className="post-it-actions">
        <button onClick={handleInspiracionClick} className="inspiracion-btn" type="button" disabled={pidiendoInspiracion}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Ver Ejemplo</span>
        </button>
      </div>
    </div>
  );
};


export default function Home() {
    const { user } = useOutletContext();
    const [estados, setEstados] = useState({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } });
    const [metaDelDia, setMetaDelDia] = useState('');
    const [estadoFinalizado, setEstadoFinalizado] = useState(false);
    const [fraseDelDia, setFraseDelDia] = useState('');
    const [climaVisual, setClimaVisual] = useState('');
    const [tieneRegistroPrevio, setTieneRegistroPrevio] = useState(false);
    const [registroId, setRegistroId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);      // 2. Añadimos un nuevo estado para controlar la visibilidad del modal
    const navigate = useNavigate();

    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [registroTimestamp, setRegistroTimestamp] = useState(null);
    const fechaDeHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    // CAMBIO: Nuevos estados para la funcionalidad de inspiración
    const [compartirAnonimo, setCompartirAnonimo] = useState(false);
    const [inspiracionSolicitada, setInspiracionSolicitada] = useState({ mente: false, emocion: false, cuerpo: false });
    const [error, setError] = useState('');


    const obtenerFraseDelRegistro = useCallback((registro) => {
        if (registro && registro.frase_sunny) {
            return registro.frase_sunny;
        }
        return 'Cada registro es un paso en tu camino de autoconocimiento.';
    }, []);

    const determinarClima = useCallback((registro) => { const valores = [registro.mente_estat, registro.emocion_estat, registro.cuerpo_estat]; const puntaje = valores.reduce((acc, val) => { if (val === 'alto') return acc + 1; if (val === 'bajo') return acc - 1; return acc; }, 0); if (puntaje >= 2) return '☀️'; if (puntaje <= -2) return '🌧️'; return '⛅'; }, []);
    
    useEffect(() => {
        const haVistoManifiesto = localStorage.getItem('sunself_manifiesto_visto');
        if (!haVistoManifiesto) {
        setShowWelcomeModal(true);
       }
       
        if (!user) return;
        const cargarRegistroDelDia = async () => {
            try {
                const registroResponse = await api.getRegistroDeHoy();
                const registroDeHoy = registroResponse.data.registro;

                if (registroDeHoy) {
                    const estadosGuardados = { mente: { seleccion: registroDeHoy.mente_estat, comentario: registroDeHoy.mente_coment }, emocion: { seleccion: registroDeHoy.emocion_estat, comentario: registroDeHoy.emocion_coment }, cuerpo: { seleccion: registroDeHoy.cuerpo_estat, comentario: registroDeHoy.cuerpo_coment } };
                    setEstados(estadosGuardados);
                    setMetaDelDia(registroDeHoy.meta_del_dia || '');
                    setFraseDelDia(obtenerFraseDelRegistro(registroDeHoy));
                    setClimaVisual(determinarClima(registroDeHoy));
                    setEstadoFinalizado(true);
                    setTieneRegistroPrevio(true);
                    setRegistroId(registroDeHoy.id);
                    setRegistroTimestamp(new Date(registroDeHoy.created_at).getTime());
                }
            } catch (error) { 
              console.error("No se pudo verificar el registro de hoy:", error); 
            } 
            finally { setIsLoading(false); }
        };
        cargarRegistroDelDia();
    }, [user, determinarClima, obtenerFraseDelRegistro]);

    useEffect(() => {
        if (!estadoFinalizado || !registroTimestamp) {
            setTiempoRestante(0);
            return;
        }
        const LIMITE_EDICION = 4 * 60 * 60 * 1000;
        const intervalo = setInterval(() => {
            const ahora = Date.now();
            const tiempoPasado = ahora - registroTimestamp;
            const restante = LIMITE_EDICION - tiempoPasado;
            if (restante > 0) {
                setTiempoRestante(restante);
            } else {
                setTiempoRestante(0);
                clearInterval(intervalo);
            }
        }, 1000);
        return () => clearInterval(intervalo);
    }, [estadoFinalizado, registroTimestamp]);

    // CAMBIO: Nueva función para manejar la petición de inspiración
    const handleInspiracion = async (orbe) => {
      try {
        const response = await api.getInspiracion(orbe);
        const textoInspiracion = response.data.inspiracion;
        
        setEstados(prev => ({
          ...prev,
          [orbe]: { ...prev[orbe], comentario: textoInspiracion }
        }));
  
        setInspiracionSolicitada(prev => ({ ...prev, [orbe]: true }));
  
      } catch (err) {
        console.error("Error al obtener inspiración:", err);
        setEstados(prev => ({
            ...prev,
            [orbe]: { ...prev[orbe], comentario: "Hubo un problema al buscar ejemplos. Inténtalo de nuevo." }
        }));
      }
    };

    const handleGuardar = async () => {
        setError(''); // Limpiamos errores previos

        // CAMBIO: Lógica de validación antes de guardar
        for (const orbe in inspiracionSolicitada) {
          if (inspiracionSolicitada[orbe] && !estados[orbe].comentario.trim()) {
            setError(`Al pedir un ejemplo para "${orbe}", es necesario que escribas tu propia reflexión.`);
            return; // Detenemos el guardado
          }
        }

        try {
            // CAMBIO: Añadimos el consentimiento al payload
            const payload = { ...estados, meta_del_dia: metaDelDia, compartir_anonimo: compartirAnonimo };
            const response = await api.saveRegistro(payload);
            const registroGuardado = response.data.registro;

            setClimaVisual(determinarClima(registroGuardado));
            setEstadoFinalizado(true);
            setTieneRegistroPrevio(true);
            setRegistroId(registroGuardado.id);
            setRegistroTimestamp(new Date(registroGuardado.created_at).getTime());

            setFraseDelDia('Sunny está reflexionando...');

            const frasePayload = {
                mente_estat: registroGuardado.mente_estat,
                emocion_estat: registroGuardado.emocion_estat,
                cuerpo_estat: registroGuardado.cuerpo_estat,
                meta_del_dia: registroGuardado.meta_del_dia,
                registroId: registroGuardado.id
            };
            
            const fraseResponse = await api.generarFraseInteligente(frasePayload);
            setFraseDelDia(fraseResponse.data.frase);

        } catch (error) { 
            console.error("Error al guardar o generar frase:", error);
            setFraseDelDia(obtenerFraseDelRegistro(null));
        }
    };

    const formatTiempo = (ms) => {
        if (ms <= 0) return "00:00:00";
        const totalSegundos = Math.floor(ms / 1000);
        const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
        const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
        const segundos = (totalSegundos % 60).toString().padStart(2, '0');
        return `${horas}:${minutos}:${segundos}`;
    };
    const handleCancel = () => {
        if (tieneRegistroPrevio) { setEstadoFinalizado(true); } 
        else {
            setEstados({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } });
            setMetaDelDia('');
        }
    };
    const handleSeleccion = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], seleccion: valor } })); };
    const handleComentario = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: valor } })); };
    const edicionBloqueada = tiempoRestante > 0;

    if (isLoading) { return ( <div className="home-content loading-state"> <p>Cargando tu día...</p> </div> ); }

    return (
        <div className="home-content">
                    {/* Esto renderizará el modal encima de todo lo demás */}
          {showWelcomeModal && <WelcomeModal onAccept={() => setShowWelcomeModal(false)} />}

          <header className="home-header"> <span className="greeting">Hola, {user.nombre}</span> <span className="date-display">{fechaDeHoy}</span> </header>
          {estadoFinalizado ? (
            <div className="daily-dashboard">
              {metaDelDia && ( <div className="meta-post-it"> <div className="meta-header"> <h4>Meta del Día</h4> <span>🎯</span> </div> <p>{metaDelDia}</p> </div> )}
              <div className="post-it-display">
                <div className="post-it-top-bar">
                  <div className="timer-display"> {edicionBloqueada && '⏳ '} {formatTiempo(tiempoRestante)} </div>
                  <button className="edit-button" onClick={() => setEstadoFinalizado(false)} title="Editar estado" disabled={edicionBloqueada}>✏️</button>
                </div>
                <h3>Tu estado de hoy</h3>
                <div className="clima-visual">{climaVisual}</div>
                <p className="frase-del-dia">{fraseDelDia}</p>
                <footer className="post-it-footer"> <a onClick={() => navigate(`/journal/${registroId}`)}>Escribir en la hoja de atrás...</a> </footer>
              </div>
            </div>
          ) : (
            <div className="formulario-estado">
              {/* CAMBIO: Se muestra el mensaje de error si existe */}
              {error && <p className="error-mensaje">{error}</p>}
              <p className="form-subtitle">¿Cómo estás hoy?</p>
              <div className="orbes-container">
                {['mente', 'emocion', 'cuerpo'].map((orbe) => ( 
                  <PostItOrbe key={orbe} orbe={orbe} estados={estados} onSeleccion={handleSeleccion} onComentario={handleComentario} onInspiracion={handleInspiracion} /> 
                ))}
                <div className="post-it-orbe">
                  <div className="post-it-header"> <h3>Meta del Día (opcional)</h3> <span className="meta-icon">🎯</span> </div>
                  <textarea placeholder="¿Cuál es tu pequeño gran objetivo para hoy?" value={metaDelDia} onChange={(e) => setMetaDelDia(e.target.value)} rows="2" />
                </div>
              </div>
              {/* CAMBIO: Se añade el contenedor para el consentimiento */}
              <div className="consentimiento-container">
                <input 
                  type="checkbox" 
                  id="compartir" 
                  checked={compartirAnonimo} 
                  onChange={(e) => setCompartirAnonimo(e.target.checked)}
                />
                <label htmlFor="compartir">
                  <span className="emoji-label">💌</span> Compartir mis comentarios (anónimamente) para inspirar a otros.
                </label>
              </div>
              <footer className="form-actions"> <button onClick={handleCancel} className="secondary">Cancelar</button> <button onClick={handleGuardar} className="primary">Guardar</button> </footer>
            </div>
          )}
        </div>
      );
}
