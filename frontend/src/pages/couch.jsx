import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './couch.css';

export default function Couch() {
  const [mensajes, setMensajes] = useState([
    { autor: 'ia', texto: 'Hola. He visto tu registro de hoy. ¿Te gustaría que profundicemos en algo de lo que escribiste?' }
  ]);
  const [input, setInput] = useState('');
  const navigate = useNavigate();

 // EN: Couch.jsx
const handleEnviar = async () => {
  if (!input.trim()) return;
  const token = localStorage.getItem('token');

  const nuevosMensajes = [...mensajes, { autor: 'user', texto: input }];
  setMensajes(nuevosMensajes);
  const mensajeActual = input;
  setInput(''); // Limpiamos el input inmediatamente

  try {
    const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const response = await api.post('/api/coach', { message: mensajeActual });

    setMensajes(prev => [...prev, { autor: 'ia', texto: response.data.reply }]);

  } catch (error) {
    console.error("Error al contactar al coach:", error);
    setMensajes(prev => [...prev, { autor: 'ia', texto: 'Lo siento, no estoy disponible en este momento. Inténtalo más tarde.' }]);
  }
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