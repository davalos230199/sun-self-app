// frontend/src/pages/home.jsx
import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useOutletContext } from 'react-router-dom';
import './home.css';

export default function Home() {
  const { user } = useOutletContext();
  const [estados, setEstados] = useState({
    mente: { seleccion: '', comentario: '' },
    emocion: { seleccion: '', comentario: '' },
    cuerpo: { seleccion: '', comentario: '' }
  });
  const [estadoFinalizado, setEstadoFinalizado] = useState(false);
  const [fraseDelDia, setFraseDelDia] = useState('');
  const [climaVisual, setClimaVisual] = useState('');
  
  // Las funciones de useCallback no cambian
  const generarFrase = useCallback((e) => {
    const m = e.mente.seleccion;
    const emo = e.emocion.seleccion;
    const c = e.cuerpo.seleccion;
    if (m === 'bajo' || emo === 'bajo') return 'Hoy tu energía parece pedirte calma. Permítete frenar un poco.';
    if (emo === 'alto' && c === 'alto') return 'Estás vibrando con intensidad, canalízalo con intención.';
    if (m === 'alto') return 'Mente clara, horizonte abierto. Aprovéchalo para avanzar.';
    return 'Hoy estás navegando tus estados con honestidad. Eso también es fuerza.';
  }, []);

  const determinarClima = useCallback((e) => {
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

  // El useEffect que carga el registro del día no cambia
  useEffect(() => {
    if (!user) return;
    const cargarRegistroDelDia = async () => {
      try {
        const registroResponse = await api.getRegistroDeHoy();
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
  }, [user, generarFrase, determinarClima]);

  // Los manejadores de eventos no cambian
  const handleGuardar = async () => {
    try {
      await api.saveRegistro(estados);
      setFraseDelDia(generarFrase(estados));
      setClimaVisual(determinarClima(estados));
      setEstadoFinalizado(true);
    } catch (error) {
      console.error("Error al guardar el estado:", error);
    }
  };
  const handleSeleccion = (orbe, valor) => {
    setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], seleccion: valor } }));
  };
  const handleComentario = (orbe, valor) => {
    setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: valor } }));
  };

  return (
    // Ya no usamos card-container aquí, el layout principal lo maneja.
    // Le damos una clase propia para estilos específicos si es necesario.
    <div className="home-content">
      <h2>Hola, {user.email}</h2>

      {estadoFinalizado ? (
        <div className="estado-finalizado">
          <h3>Tu estado de hoy:</h3>
          <div className="clima-visual">{climaVisual}</div>
          <p className="frase-del-dia">{fraseDelDia}</p>
          {/*
            LOS BOTONES DE NAVEGACIÓN HAN SIDO ELIMINADOS.
            La Navbar ahora se encarga de esto.
          */}
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
          <button onClick={handleGuardar} className="primary">Guardar estado</button>
        </div>
      )}
      {/* EL BOTÓN DE LOGOUT TAMBIÉN SE FUE, AHORA VIVE EN LA NAVBAR */}
    </div>
  );
}
