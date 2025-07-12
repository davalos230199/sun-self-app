// frontend/src/pages/Sunny.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import './Sunny.css';

export default function Sunny() {
  // CAMBIO 1: El estado de mensajes empieza vacío y el de carga en 'true'.
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true); // Empezamos cargando el contexto inicial
  const messagesEndRef = useRef(null);

  // Efecto para hacer scroll hacia abajo (sin cambios)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // CAMBIO 2: Nuevo useEffect para cargar el contexto inicial de la conversación.
  // Se ejecuta solo una vez cuando el componente se monta.
  useEffect(() => {
    const fetchInitialContext = async () => {
      try {
        const registroResponse = await api.getRegistroDeHoy();
        const registroDeHoy = registroResponse.data.registro;

        // Si existe un registro de hoy y tiene una frase de Sunny, la usamos.
        if (registroDeHoy && registroDeHoy.frase_sunny) {
          setMessages([{ sender: 'sunny', text: registroDeHoy.frase_sunny }]);
        } else {
          // Si no, usamos el mensaje por defecto.
          setMessages([{ sender: 'sunny', text: 'Soy un espejo. Reflejá algo en mí.' }]);
        }
      } catch (error) {
        console.error("Error al obtener el contexto inicial:", error);
        // Mensaje de fallback en caso de error de red.
        setMessages([{ sender: 'sunny', text: 'Hola. Parece que hay un pequeño eco en la línea. ¿En qué piensas?' }]);
      } finally {
        // Dejamos de cargar una vez que tenemos el mensaje inicial.
        setLoading(false);
      }
    };

    fetchInitialContext();
  }, []); // El array de dependencias vacío asegura que se ejecute solo al montar.

  // CAMBIO 3: La función handleSend ahora envía el historial completo.
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { sender: 'user', text: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setLoading(true);
    setInput('');

    try {
      // 3a: Mapeamos el estado de mensajes del frontend al formato que la API espera.
      // { sender: 'user', text: '...' } -> { role: 'user', content: '...' }
      const historyForApi = newMessages.map(msg => ({
        role: msg.sender === 'sunny' ? 'assistant' : 'user',
        content: msg.text
      }));

      // 3b: Llamamos a la API con el payload correcto: { history: [...] }
      const response = await api.postToSunny({ history: historyForApi });
      const sunnyMessage = { sender: 'sunny', text: response.data.reply };
      setMessages(prev => [...prev, sunnyMessage]);

    } catch (error) {
      console.error("Error al hablar con Sunny:", error);
      const errorMessage = { sender: 'sunny', text: 'Lo siento, no me siento muy conversador ahora mismo.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <PageHeader title="Sunny" />
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <div className="message"><p>{msg.text}</p></div>
          </div>
        ))}
        {/* El indicador de carga solo se muestra si no hay mensajes iniciales o si se está esperando respuesta */}
        {loading && (
          <div className="message-wrapper sunny">
            <div className="message"><p className="loading-dots">...</p></div>
          </div>
        )}
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
