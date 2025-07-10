// frontend/src/pages/home.jsx
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
// 1. Importamos el hook que nos permite recibir datos del "guardián"
import { useNavigate, useOutletContext } from 'react-router-dom';
import './home.css';

// La instancia de API sigue siendo una buena práctica
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// El interceptor también, para añadir el token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default function Home() {
  // 2. ¡ADIÓS al estado local del usuario! Ahora lo recibimos directamente.
  const { user } = useOutletContext();

  // El resto de los estados permanecen igual
  const [estados, setEstados] = useState({
    mente: { seleccion: '', comentario: '' },
    emocion: { seleccion: '', comentario: '' },
    cuerpo: { seleccion: '', comentario: '' }
  });
  const [estadoFinalizado, setEstadoFinalizado] = useState(false);
  const [fraseDelDia, setFraseDelDia] = useState('');
  const [climaVisual, setClimaVisual] = useState('');
  const navigate = useNavigate();

  // Las funciones de useCallback permanecen igual
  const generarFrase = useCallback((e) => {
    // ... (sin cambios aquí)
    const m = e.mente.seleccion;
    const emo = e.emocion.seleccion;
    const c = e.cuerpo.seleccion;
    if (m === 'bajo' || emo === 'bajo') return 'Hoy tu energía parece pedirte calma. Permítete frenar un poco.';
    if (emo === 'alto' && c === 'alto') return 'Estás vibrando con intensidad, canalízalo con intención.';
    if (m === 'alto') return 'Mente clara, horizonte abierto. Aprovéchalo para avanzar.';
    return 'Hoy estás navegando tus estados con honestidad. Eso también es fuerza.';
  }, []);

  const determinarClima = useCallback((e) => {
    // ... (sin cambios aquí)
    const valores = [e.mente.seleccion, e.emocion.seleccion, e.cuerpo.seleccion];
    const puntaje = valores.reduce((acc, val) => {
      if (val === 'alto') return acc + 1;
      if (val === 'bajo') return acc - 1;
      return acc;
    }, 0);
    if (puntaje >= 2) return '☀️ Soleado y brillante';
    if (puntaje <= -2) return '🌧️ Lluvia suave y necesaria';
    return '⛅ Nublado con momentos de claridad';
  }, []);

  // 3. ELIMINAMOS por completo el useEffect que verificaba al usuario. ¡Ya no es necesario!

  // 4. Solo conservamos el useEffect que carga el registro del día.
  useEffect(() => {
    // La comprobación de 'user' es una seguridad extra.
    if (!user) return;

    const cargarRegistroDelDia = async () => {
      try {
        const registroResponse = await api.get('/api/registros/today');
        const registroDeHoy = registroResponse.data.registro;

        if (registroDeHoy) {
          const estadosGuardados = {
            mente: { seleccion: registroDeHoy.mente_estat, comentario: registroDeHoy.mente_coment },
            emocion: { seleccion: registroDeHoy.emocion_estat, comentario: registroDeHoy.emocion_coment },
            cuerpo: { seleccion: registroDeHoy.cuerpo_estat, comentario: registroDeHoy.cuerpo_coment }
          };
          setEstados(estadosGuardados);
          setFraseDelDia(generarFrase(estadosGuardados));
          setClimaVisual(determinarClima(estadosGuardados));
          setEstadoFinalizado(true);
        }
      } catch (error) {
        console.error("No se pudo verificar el registro de hoy, se asume que es un día nuevo:", error);
      }
    };

    cargarRegistroDelDia();
  }, [user, navigate, generarFrase, determinarClima]); // Ahora solo depende de 'user' y las otras funciones

  // Los manejadores de eventos no cambian
  const handleSeleccion = (orbe, valor) => {
    setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], seleccion: valor } }));
  };
  const handleComentario = (orbe, valor) => {
    setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: valor } }));
  };
  const handleGuardar = async () => {
    try {
      await api.post('/api/registros', estados);
      setFraseDelDia(generarFrase(estados));
      setClimaVisual(determinarClima(estados));
      setEstadoFinalizado(true);
    } catch (error) {
      console.error("Error al guardar el estado:", error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // 5. ELIMINAMOS el estado de carga. El guardián ya lo maneja.
  // if (!user) { return <div className="home-container">Cargando...</div>; }

  return (
    <div className="home-container">
      {/* 6. El 'user' viene directamente del contexto, ¡qué limpio! */}
      <h2>Hola, {user.email}</h2>

      {estadoFinalizado ? (
        <div className="estado-finalizado">
          <h3>Tu estado de hoy:</h3>
          <div className="clima-visual">{climaVisual}</div>
          <p className="frase-del-dia">{fraseDelDia}</p>
          <div className="botones-accion">
            <button onClick={() => setEstadoFinalizado(false)}>Registrar de nuevo</button>
            <button onClick={() => navigate('/sunny')}>Hablar con Sunny</button>
            <button onClick={() => navigate('/tracking')}>Ver mi historial</button>
          </div>
        </div>
      ) : (
        <div className="formulario-estado">
          <p>¿Cómo estás hoy?</p>
          {['mente', 'emocion', 'cuerpo'].map((orbe) => (
            <div className="orbe" key={orbe}>
              <h3>{orbe.toUpperCase()}</h3>
              <div className="orbe-buttons">
                {['bajo', 'neutral', 'alto'].map(opcion => (
                  <button
                    key={opcion}
                    className={estados[orbe].seleccion === opcion ? 'selected' : ''}
                    onClick={() => handleSeleccion(orbe, opcion)}
                    type="button"
                  >
                    {opcion}
                  </button>
                ))}
              </div>
              <textarea
                placeholder={`Comentario sobre tu ${orbe}`}
                value={estados[orbe].comentario}
                onChange={(e) => handleComentario(orbe, e.target.value)}
              />
            </div>
          ))}
          <button onClick={handleGuardar} className="guardar-btn">Guardar estado</button>
        </div>
      )}
      <button onClick={handleLogout} className="logout-btn">
        Cerrar Sesión
      </button>
    </div>
  );
}
