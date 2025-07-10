// frontend/src/pages/Sunny.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Sunny.css'; // Usaremos un archivo CSS para los estilos

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default function Sunny() {
  const [messages, setMessages] = useState([
    // Mensaje inicial de Sunny
    { sender: 'sunny', text: 'Soy un espejo. Reflejá algo en mí.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null); // Ref para auto-scroll

  // Efecto para hacer scroll hacia abajo con cada nuevo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    // 1. Agregamos el mensaje del usuario (solo una vez)
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput(''); // Limpiamos el input al instante

    try {
      const response = await api.post('/api/sunny', { message: input });
      const sunnyMessage = { sender: 'sunny', text: response.data.reply };
      // 2. AQUÍ ESTÁ EL ARREGLO: Ahora solo agregamos la respuesta de Sunny
      setMessages(prev => [...prev, sunnyMessage]);
    } catch (error) {
      console.error("Error al hablar con Sunny:", error);
      const errorMessage = { sender: 'sunny', text: 'Lo siento, no me siento muy conversador ahora mismo.' };
      // 3. Y aquí solo agregamos el mensaje de error
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Sunny</h2>
        <button onClick={() => navigate('/home')} className="back-button">Volver</button>
      </div>
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <div className="message">
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-wrapper sunny">
            <div className="message">
              <p className="loading-dots">...</p>
            </div>
          </div>
        )}
        {/* Elemento invisible para guiar el scroll */}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu reflejo aquí..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Enviar</button>
      </form>
    </div>
  );
}
