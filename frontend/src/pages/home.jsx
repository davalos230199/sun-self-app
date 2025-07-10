// frontend/src/pages/home.jsx
// ... (toda la lógica de imports y funciones permanece igual)
import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './home.css';

export default function Home() {
    const { user } = useOutletContext();
    const [estados, setEstados] = useState({ mente: { seleccion: '', comentario: '' }, emocion: { seleccion: '', comentario: '' }, cuerpo: { seleccion: '', comentario: '' } });
    const [estadoFinalizado, setEstadoFinalizado] = useState(false);
    const [fraseDelDia, setFraseDelDia] = useState('');
    const [climaVisual, setClimaVisual] = useState('');
    const navigate = useNavigate();
    const generarFrase = useCallback((e) => { const m = e.mente.seleccion; const emo = e.emocion.seleccion; const c = e.cuerpo.seleccion; if (m === 'bajo' || emo === 'bajo') return 'Hoy tu energía parece pedirte calma. Permítete frenar un poco.'; if (emo === 'alto' && c === 'alto') return 'Estás vibrando con intensidad, canalízalo con intención.'; if (m === 'alto') return 'Mente clara, horizonte abierto. Aprovéchalo para avanzar.'; return 'Hoy estás navegando tus estados con honestidad. Eso también es fuerza.'; }, []);
    const determinarClima = useCallback((e) => { const valores = [e.mente.seleccion, e.emocion.seleccion, e.cuerpo.seleccion]; const puntaje = valores.reduce((acc, val) => { if (val === 'alto') return acc + 1; if (val === 'bajo') return acc - 1; return acc; }, 0); if (puntaje >= 2) return '☀️'; if (puntaje <= -2) return '🌧️'; return '⛅'; }, []);
    useEffect(() => { if (!user) return; const cargarRegistroDelDia = async () => { try { const registroResponse = await api.getRegistroDeHoy(); const registroDeHoy = registroResponse.data.registro; if (registroDeHoy) { const estadosGuardados = { mente: { seleccion: registroDeHoy.mente_estat, comentario: registroDeHoy.mente_coment }, emocion: { seleccion: registroDeHoy.emocion_estat, comentario: registroDeHoy.emocion_coment }, cuerpo: { seleccion: registroDeHoy.cuerpo_estat, comentario: registroDeHoy.cuerpo_coment } }; setEstados(estadosGuardados); setFraseDelDia(generarFrase(estadosGuardados)); setClimaVisual(determinarClima(estadosGuardados)); setEstadoFinalizado(true); } } catch (error) { console.error("No se pudo verificar el registro de hoy, se asume que es un día nuevo:", error); } }; cargarRegistroDelDia(); }, [user, generarFrase, determinarClima]);
    const handleGuardar = async () => { try { await api.saveRegistro(estados); setFraseDelDia(generarFrase(estados)); setClimaVisual(determinarClima(estados)); setEstadoFinalizado(true); } catch (error) { console.error("Error al guardar el estado:", error); } };
    const handleSeleccion = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], seleccion: valor } })); };
    const handleComentario = (orbe, valor) => { setEstados(prev => ({ ...prev, [orbe]: { ...prev[orbe], comentario: valor } })); };

  return (
    <div className="home-content">
      {estadoFinalizado ? (
        <div className="post-it">
          <button className="edit-button" onClick={() => setEstadoFinalizado(false)} title="Editar estado">✏️</button>
          <h3>Tu estado de hoy</h3>
          <div className="clima-visual">{climaVisual}</div>
          <p className="frase-del-dia">{fraseDelDia}</p>
        </div>
      ) : (
        <div className="formulario-estado">
          <h2>Hola, {user.email}</h2>
          <p>¿Cómo estás hoy?</p>
          {['mente', 'emocion', 'cuerpo'].map((orbe) => (
            <div className="orbe" key={orbe}>
              <h3>{orbe}</h3>
              <div className="orbe-buttons">
                {['bajo', 'neutral', 'alto'].map(opcion => (
                  <button key={opcion} className={estados[orbe].seleccion === opcion ? 'selected' : ''} onClick={() => handleSeleccion(orbe, opcion)} type="button">{opcion}</button>
                ))}
              </div>
              <textarea placeholder={`Comentario sobre tu ${orbe}...`} value={estados[orbe].comentario} onChange={(e) => handleComentario(orbe, e.target.value)} rows="2" />
            </div>
          ))}
          <div className="form-actions">
            {/* El botón de cancelar simplemente navega a otra página, o podría resetear el estado */}
            <button onClick={() => navigate('/tracking')} className="secondary">Cancelar</button>
            <button onClick={handleGuardar} className="primary">Guardar estado</button>
          </div>
        </div>
      )}
    </div>
  );
}
