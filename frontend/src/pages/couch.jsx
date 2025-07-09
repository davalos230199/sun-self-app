import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './couch.css';

export default function Couch() {
  const [mensajes, setMensajes] = useState([
    { autor: 'ia', texto: 'Hola. He visto tu registro de hoy. ¿Te gustaría que profundicemos en algo de lo que escribiste?' }
  ]);
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleEnviar = () => {
    if (!input.trim()) return;
    const nuevosMensajes = [...mensajes, { autor: 'user', texto: input }];
    setMensajes(nuevosMensajes);
    setInput('');
    // Aquí, más adelante, irá la llamada a la IA real
  };

  return (
    <div className="couch-container">
      <div className="chat-window">
        {mensajes.map((msg, index) => (
          <div key={index} className={`mensaje ${msg.autor}`}>
            <p>{msg.texto}</p>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu respuesta..."
          onKeyPress={(e) => e.key === 'Enter' && handleEnviar()}
        />
        <button onClick={handleEnviar}>Enviar</button>
      </div>
       <button onClick={() => navigate('/home')} className="back-button">Volver</button>
    </div>
  );
}