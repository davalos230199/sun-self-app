// frontend/src/pages/home.jsx
import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './home.css';

const opciones = [ { valor: 'bajo', emoji: '🌧️' }, { valor: 'neutral', emoji: '⛅' }, { valor: 'alto', emoji: '☀️' } ];

const PostItOrbe = ({ orbe, estados, onSeleccion, onComentario }) => (
  <div className="post-it-orbe">
    <div className="post-it-header">
      <h3>{orbe}</h3>
      <div className="orbe-buttons">
        {opciones.map(({ valor, emoji }) => (
          <button key={valor} className={`icon-button ${estados[orbe].seleccion === valor ? 'selected' : ''}`} onClick={() => onSeleccion(orbe, valor)} type="button" title={valor}>{emoji}</button>
        ))}
      </div>
    </div>
    <textarea placeholder={`¿Algún pensamiento sobre tu ${orbe}?`} value={estados[orbe].comentario} onChange={(e) => onComentario(orbe, e.target.value)} rows="2" />
  </div>
);

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
    const navigate = useNavigate();

    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [registroTimestamp, setRegistroTimestamp] = useState(null);
    const fechaDeHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    const generarFrase = useCallback((registro) => { const m = registro.mente_estat; const emo = registro.emocion_estat; const c = registro.cuerpo_estat; if (m === 'bajo' || emo === 'bajo') return 'Hoy tu energía parece pedirte calma. Permítete frenar un poco.'; if (emo === 'alto' && c === 'alto') return 'Estás vibrando con intensidad, canalízalo con intención.'; if (m === 'alto') return 'Mente clara, horizonte abierto. Aprovéchalo para avanzar.'; return 'Hoy estás navegando tus estados con honestidad. Eso también es fuerza.'; }, []);
    const determinarClima = useCallback((registro) => { const valores = [registro.mente_estat, registro.emocion_estat, registro.cuerpo_estat]; const puntaje = valores.reduce((acc, val) => { if (val === 'alto') return acc + 1; if (val === 'bajo') return acc - 1; return acc; }, 0); if (puntaje >= 2) return '☀️'; if (puntaje <= -2) return '🌧️'; return '⛅'; }, []);
    
    useEffect(() => {
        if (!user) return;
        const cargarRegistroDelDia = async () => {
            try {
                const registroResponse = await api.getRegistroDeHoy();
                const registroDeHoy = registroResponse.data.registro;
                if (registroDeHoy) {
                    const estadosGuardados = { mente: { seleccion: registroDeHoy.mente_estat, comentario: registroDeHoy.mente_coment }, emocion: { seleccion: registroDeHoy.emocion_estat, comentario: registroDeHoy.emocion_coment }, cuerpo: { seleccion: registroDeHoy.cuerpo_estat, comentario: registroDeHoy.cuerpo_coment } };
                    setEstados(estadosGuardados);
                    setMetaDelDia(registroDeHoy.meta_del_dia || '');
                    setFraseDelDia(generarFrase(registroDeHoy));
                    setClimaVisual(determinarClima(registroDeHoy));
                    setEstadoFinalizado(true);
                    setTieneRegistroPrevio(true);
                    setRegistroId(registroDeHoy.id);
                    setRegistroTimestamp(new Date(registroDeHoy.created_at).getTime());
                }
            } catch (error) { console.error("No se pudo verificar el registro de hoy:", error); } 
            finally { setIsLoading(false); }
        };
        cargarRegistroDelDia();
    }, [user, generarFrase, determinarClima]);

     // useEffect dedicado al contador de edicion de estado ---
    useEffect(() => {
        if (!estadoFinalizado || !registroTimestamp) {
            setTiempoRestante(0);
            return;
        }
        const LIMITE_EDICION = 4 * 60 * 60 * 1000; // 4 horas en milisegundos
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


    const handleGuardar = async () => {
        try {
            const payload = { ...estados, meta_del_dia: metaDelDia };
            const response = await api.saveRegistro(payload);
            const registroGuardado = response.data.registro;
            setFraseDelDia(generarFrase(registroGuardado));
            setClimaVisual(determinarClima(registroGuardado));
            setEstadoFinalizado(true);
            setTieneRegistroPrevio(true);
            setRegistroId(registroGuardado.id);
            // Actualizamos el timestamp para reiniciar el contador
            setRegistroTimestamp(new Date(registroGuardado.created_at).getTime());
        } catch (error) { console.error("Error al guardar el estado:", error); }
    };

    // CAMBIO CLAVE 1: La función ahora devuelve "00:00:00" cuando el tiempo se agota.
    const formatTiempo = (ms) => {
        if (ms <= 0) return "00:00:00"; // No devolvemos null, sino el contador en cero.
        const totalSegundos = Math.floor(ms / 1000);
        const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
        const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
        const segundos = (totalSegundos % 60).toString().padStart(2, '0');
        return `${horas}:${minutos}:${segundos}`;
    };

    const handleCancel = () => {
        if (tieneRegistroPrevio) {
            setEstadoFinalizado(true);
        } else {
            setEstados({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } });
            setMetaDelDia('');
        }
    };
    const handleSeleccion = (orbe, valor) => {
        setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], seleccion: valor } }));
    };
    const handleComentario = (orbe, valor) => {
        setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: valor } }));
    };

    // CAMBIO CLAVE 2: Creamos una variable para que el JSX sea más legible.
    const edicionBloqueada = tiempoRestante > 0;

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
          {metaDelDia && (
            <div className="meta-post-it">
              <div className="meta-header">
                <h4>Meta del Día</h4>
                <span>🎯</span>
              </div>
              <p>{metaDelDia}</p>
            </div>
          )}
          <div className="post-it-display">
            <div className="post-it-top-bar">
              {/* CAMBIO CLAVE 3: La lógica de renderizado del temporizador es más clara. */}
              <div className="timer-display">
                {/* Mostramos el emoji solo si el tiempo está corriendo */}
                {edicionBloqueada && '⏳ '}
                {/* El tiempo formateado siempre se muestra */}
                {formatTiempo(tiempoRestante)}
              </div>
              <button 
                className="edit-button" 
                onClick={() => setEstadoFinalizado(false)} 
                title="Editar estado"
                // La propiedad disabled ahora depende de nuestra variable booleana.
                disabled={edicionBloqueada}
              >
                ✏️
              </button>
            </div>
            <h3>Tu estado de hoy</h3>
            <div className="clima-visual">{climaVisual}</div>
            <p className="frase-del-dia">{fraseDelDia}</p>
            <footer className="post-it-footer">
              <a onClick={() => navigate(`/journal/${registroId}`)}>Escribir en la hoja de atrás...</a>
            </footer>
          </div>
        </div>
      ) : (
        <div className="formulario-estado">
          <p className="form-subtitle">¿Cómo estás hoy?</p>
          <div className="orbes-container">
            {['mente', 'emocion', 'cuerpo'].map((orbe) => (
              <PostItOrbe key={orbe} orbe={orbe} estados={estados} onSeleccion={handleSeleccion} onComentario={handleComentario} />
            ))}
            <div className="post-it-orbe">
              <div className="post-it-header">
                <h3>Meta del Día (opcional)</h3>
                <span className="meta-icon">🎯</span>
              </div>
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
