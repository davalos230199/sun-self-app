// frontend/src/pages/Sunny.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Podrías crear un Sunny.css si quieres darle estilos únicos
// import './Sunny.css'; 

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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // La URL ahora apunta a /api/sunny
      const response = await api.post('/api/sunny', { message: input });
      const sunnyMessage = { sender: 'sunny', text: response.data.reply };
      setMessages(prev => [...prev, userMessage, sunnyMessage]);
    } catch (error) {
      console.error("Error al hablar con Sunny:", error);
      const errorMessage = { sender: 'sunny', text: 'Lo siento, no me siento muy conversador ahora mismo.' };
      setMessages(prev => [...prev, userMessage, errorMessage]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="chat-container"> {/* Puedes reutilizar estilos o crear nuevos */}
      <h2>Conversación con Sunny</h2>
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && <div className="message sunny"><p>...</p></div>}
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
      <button onClick={() => navigate('/home')} className="back-button">Volver</button>
    </div>
  );
}
