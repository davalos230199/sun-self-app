// frontend/src/pages/home.jsx
import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useOutletContext } from 'react-router-dom';
import './home.css';

export default function Home() {
    const { user } = useOutletContext();
    const [estados, setEstados] = useState({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } });
    const [estadoFinalizado, setEstadoFinalizado] = useState(false);
    const [fraseDelDia, setFraseDelDia] = useState('');
    const [climaVisual, setClimaVisual] = useState('');
    const [tieneRegistroPrevio, setTieneRegistroPrevio] = useState(false);

    // --- CAMBIO 1: La función ahora espera el registro oficial del backend ---
    const generarFrase = useCallback((registro) => {
        const m = registro.mente_estat;
        const emo = registro.emocion_estat;
        const c = registro.cuerpo_estat;
        if (m === 'bajo' || emo === 'bajo') return 'Hoy tu energía parece pedirte calma. Permítete frenar un poco.';
        if (emo === 'alto' && c === 'alto') return 'Estás vibrando con intensidad, canalízalo con intención.';
        if (m === 'alto') return 'Mente clara, horizonte abierto. Aprovéchalo para avanzar.';
        return 'Hoy estás navegando tus estados con honestidad. Eso también es fuerza.';
    }, []);

    const determinarClima = useCallback((registro) => {
        const valores = [registro.mente_estat, registro.emocion_estat, registro.cuerpo_estat];
        const puntaje = valores.reduce((acc, val) => {
            if (val === 'alto') return acc + 1;
            if (val === 'bajo') return acc - 1;
            return acc;
        }, 0);
        if (puntaje >= 2) return '☀️';
        if (puntaje <= -2) return '🌧️';
        return '⛅';
    }, []);
    
    // --- CAMBIO 2: El useEffect ahora usa la nueva lógica ---
    useEffect(() => {
        if (!user) return;
        const cargarRegistroDelDia = async () => {
            try {
                const registroResponse = await api.getRegistroDeHoy();
                const registroDeHoy = registroResponse.data.registro;
                if (registroDeHoy) {
                    const estadosGuardados = { mente: { seleccion: registroDeHoy.mente_estat, comentario: registroDeHoy.mente_coment }, emocion: { seleccion: registroDeHoy.emocion_estat, comentario: registroDeHoy.emocion_coment }, cuerpo: { seleccion: registroDeHoy.cuerpo_estat, comentario: registroDeHoy.cuerpo_coment } };
                    setEstados(estadosGuardados);
                    // Ambas funciones reciben el mismo objeto: el registro oficial.
                    setFraseDelDia(generarFrase(registroDeHoy));
                    setClimaVisual(determinarClima(registroDeHoy));
                    setEstadoFinalizado(true);
                    setTieneRegistroPrevio(true);
                }
            } catch (error) { console.error("No se pudo verificar el registro de hoy:", error); }
        };
        cargarRegistroDelDia();
    }, [user, generarFrase, determinarClima]);

    // --- CAMBIO 3: La función de guardar ahora es mucho más simple y robusta ---
    const handleGuardar = async () => {
        try {
            const response = await api.saveRegistro(estados);
            const registroGuardado = response.data.registro; // Capturamos la respuesta oficial

            // Ya no construimos objetos a mano. Usamos la respuesta directa.
            setFraseDelDia(generarFrase(registroGuardado));
            setClimaVisual(determinarClima(registroGuardado));
            
            setEstadoFinalizado(true);
            setTieneRegistroPrevio(true);
        } catch (error) {
            console.error("Error al guardar el estado:", error);
        }
    };

    const handleCancel = () => { if (tieneRegistroPrevio) { setEstadoFinalizado(true); } else { setEstados({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } }); } };
    const handleSeleccion = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], seleccion: valor } })); };
    const handleComentario = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: valor } })); };

  return (
    <div className="home-content">
      {estadoFinalizado ? (
        <div className="post-it-wrapper">
          <div className="post-it">
            <button className="edit-button" onClick={() => setEstadoFinalizado(false)} title="Editar estado">✏️</button>
            <h3>Tu estado de hoy</h3>
            <div className="clima-visual">{climaVisual}</div>
            <p className="frase-del-dia">{fraseDelDia}</p>
          </div>
        </div>
      ) : (
        <div className="formulario-estado">
          <header className="form-header">
            <h2>Hola, {user.email}</h2>
            <p>¿Cómo estás hoy?</p>
          </header>
          <div className="orbes-container">
            {['mente', 'emocion', 'cuerpo'].map((orbe) => (
              <div className="orbe" key={orbe}>
                <h3>{orbe}</h3>
                <div className="orbe-buttons">
                  {['bajo', 'neutral', 'alto'].map(opcion => (
                    <button key={opcion} className={estados[orbe].seleccion === opcion ? 'selected' : ''} onClick={() => handleSeleccion(orbe, opcion)} type="button">{opcion}</button>
                  ))}
                </div>
                <textarea placeholder={`Comentario...`} value={estados[orbe].comentario} onChange={(e) => handleComentario(orbe, e.target.value)} rows="2" />
              </div>
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
