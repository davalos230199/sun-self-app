// frontend/src/pages/Sunny.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader'; // <-- Importamos el header
import './Sunny.css';

export default function Sunny() {
  // ... (toda la lógica de useState, useEffect, handleSend no cambia)
  const [messages, setMessages] = useState([ { sender: 'sunny', text: 'Soy un espejo. Reflejá algo en mí.' } ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const handleSend = async (e) => { e.preventDefault(); if (!input.trim()) return; const userMessage = { sender: 'user', text: input }; setMessages(prev => [...prev, userMessage]); setLoading(true); setInput(''); try { const response = await api.postToSunny(input); const sunnyMessage = { sender: 'sunny', text: response.data.reply }; setMessages(prev => [...prev, sunnyMessage]); } catch (error) { console.error("Error al hablar con Sunny:", error); const errorMessage = { sender: 'sunny', text: 'Lo siento, no me siento muy conversador ahora mismo.' }; setMessages(prev => [...prev, errorMessage]); } finally { setLoading(false); } };

  return (
    // Reemplazamos el header anterior por nuestro componente reutilizable
    <div className="chat-container">
      <PageHeader title="Sunny" />
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <div className="message"><p>{msg.text}</p></div>
          </div>
        ))}
        {loading && ( <div className="message-wrapper sunny"><div className="message"><p className="loading-dots">...</p></div></div> )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="chat-form">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu reflejo aquí..." disabled={loading} />
        <button type="submit" disabled={loading}>Enviar</button>
      </form>
    </div>
  );
}
