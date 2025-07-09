import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './home.css';

export default function Home() {
  const [user, setUser] = useState(null);
  const [estados, setEstados] = useState({
    mente: { seleccion: '', comentario: '' },
    emocion: { seleccion: '', comentario: '' },
    cuerpo: { seleccion: '', comentario: '' }
  });

  const [estadoFinalizado, setEstadoFinalizado] = useState(false);
  const [fraseDelDia, setFraseDelDia] = useState('');
  const [climaVisual, setClimaVisual] = useState('');
  const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return;
  }

  // Creamos una instancia de axios con la configuración base
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const cargarDatos = async () => {
    try {
      // 1. Verificamos que el token sea válido y obtenemos el usuario
      const userResponse = await api.get('/me');
      setUser(userResponse.data.user);

      // 2. INTENTAMOS obtener el registro de hoy, pero sin que rompa todo si falla
      try {
        const registroResponse = await api.get('/api/registros/today');
        const registroDeHoy = registroResponse.data.registro;

        if (registroDeHoy) {
          // Si encontramos un registro, configuramos la vista "finalizada"
          const estadosGuardados = {
            mente: { seleccion: registroDeHoy.mente_estado, comentario: registroDeHoy.mente_comentario },
            emocion: { seleccion: registroDeHoy.emocion_estado, comentario: registroDeHoy.emocion_comentario },
            cuerpo: { seleccion: registroDeHoy.cuerpo_estado, comentario: registroDeHoy.cuerpo_comentario }
          };
          setEstados(estadosGuardados);
          setFraseDelDia(generarFrase(estadosGuardados));
          setClimaVisual(determinarClima(estadosGuardados));
          setEstadoFinalizado(true);
        }
      } catch (error) {
        // Si esta segunda llamada falla, solo lo mostramos en la consola y seguimos.
        // NO expulsamos al usuario.
        console.error("No se pudo verificar el registro de hoy, mostrando página nueva:", error);
      }

    } catch (error) {
      // Si la llamada a /me falla, el token es inválido y SÍ debemos expulsar.
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  cargarDatos();
}, [navigate]); // Añadimos navigate a las dependencias del useEffect

  const handleSeleccion = (orbe, valor) => {
    setEstados(prev => ({
      ...prev,
      [orbe]: { ...prev[orbe], seleccion: valor }
    }));
  };

  const handleComentario = (orbe, valor) => {
    setEstados(prev => ({
      ...prev,
      [orbe]: { ...prev[orbe], comentario: valor }
    }));
  };

  const generarFrase = (e) => {
    const m = e.mente.seleccion;
    const emo = e.emocion.seleccion;
    const c = e.cuerpo.seleccion;

    if (m === 'bajo' || emo === 'bajo') return 'Hoy tu energía parece pedirte calma. Permítete frenar un poco.';
    if (emo === 'alto' && c === 'alto') return 'Estás vibrando con intensidad, canalízalo con intención.';
    if (m === 'alto') return 'Mente clara, horizonte abierto. Aprovéchalo para avanzar.';
    return 'Hoy estás navegando tus estados con honestidad. Eso también es fuerza.';
  };

  const determinarClima = (e) => {
    const valores = [e.mente.seleccion, e.emocion.seleccion, e.cuerpo.seleccion];
    const puntaje = valores.reduce((acc, val) => {
      if (val === 'alto') return acc + 1;
      if (val === 'bajo') return acc - 1;
      return acc;
    }, 0);

    if (puntaje >= 2) return '☀️ Soleado y brillante';
    if (puntaje <= -2) return '🌧️ Lluvia suave y necesaria';
    return '⛅ Nublado con momentos de claridad';
  };

 const handleGuardar = async () => {
  const token = localStorage.getItem('token');
  if (!token) return; // Si no hay token, no hacer nada

  try {
    const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Enviamos el estado actual al nuevo endpoint
    await api.post('/api/registros', estados);

    // Si la llamada es exitosa, actualizamos la UI como antes
    setFraseDelDia(generarFrase(estados));
    setClimaVisual(determinarClima(estados));
    setEstadoFinalizado(true);

  } catch (error) {
    console.error("Error al guardar el estado:", error);
    alert("Hubo un problema al guardar tu estado. Inténtalo de nuevo.");
  }
};

  // --- FUNCIÓN DE LOGOUT CORREGIDA ---
  // La movemos aquí, al nivel principal del componente
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- ESTADO DE CARGA ---
  // Si el usuario aún no ha cargado, mostramos un mensaje
  if (!user) {
    return <div>Cargando...</div>;
  }

  // Si el usuario ya cargó, mostramos la página normal
  return (
    <div className="home-container">
      <h2>Hola, {user.email}</h2> {/* Cambiado a user.email que sí existe en el token */}

      {estadoFinalizado ? (
        <>
          <h3>Tu estado de hoy:</h3>
          <div style={{ fontSize: '2rem', margin: '12px 0' }}>{climaVisual}</div>
          <p style={{ fontStyle: 'italic' }}>{fraseDelDia}</p>
              <button onClick={() => setEstadoFinalizado(false)} style={{marginTop: '10px'}}>
                 Registrar otro día
              </button>
          <button onClick={() => navigate('/couch')}>Hablar con el Couch</button>
        </>
      ) : (
        <>
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
          <button onClick={handleGuardar}>Guardar estado</button>
        </>
      )}
      
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Cerrar Sesión
      </button>
    </div>
  );
}