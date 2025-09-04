import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

// --- Icono de Enviar (Componente interno) ---
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2 11 13" />
        <path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
);

export default function Sunny() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const fetchInitialContext = async () => {
            try {
                const registroResponse = await api.getRegistroDeHoy();
                const registroDeHoy = registroResponse.data.registro;
                if (registroDeHoy && registroDeHoy.frase_sunny) {
                    setMessages([{ sender: 'sunny', text: registroDeHoy.frase_sunny }]);
                } else {
                    setMessages([{ sender: 'sunny', text: 'Soy un espejo. Reflejá algo en mí.' }]);
                }
            } catch (error) {
                console.error("Error al obtener el contexto inicial:", error);
                setMessages([{ sender: 'sunny', text: 'Hola. Parece que hay un pequeño eco en la línea. ¿En qué piensas?' }]);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialContext();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        
        setMessages(newMessages);
        setLoading(true);
        setInput('');

        try {
            const historyForApi = newMessages.map(msg => ({
                role: msg.sender === 'sunny' ? 'assistant' : 'user',
                content: msg.text
            }));
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
        // CAMBIO: Contenedor principal de la página con padding y flex-col
        <div className="p-2 sm:p-4 h-full w-full flex flex-col">
            <PageHeader title="Sunny" />
            
            {/* Contenedor del chat que ocupa el espacio restante */}
            <div className="flex flex-col flex-grow mt-4 w-full max-w-3xl mx-auto border border-zinc-200/50 shadow-lg rounded-2xl overflow-hidden bg-zinc-50">
                <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                            <div className={`py-2 px-4 rounded-2xl ${msg.sender === 'user' ? 'bg-amber-500 text-white rounded-br-lg' : 'bg-white text-zinc-700 rounded-bl-lg border border-zinc-200'}`}>
                                <p className="m-0">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex max-w-[85%] sm:max-w-[75%] self-start">
                            <div className="py-2 px-4 rounded-2xl bg-white text-zinc-700 rounded-bl-lg border border-zinc-200">
                                <p className="m-0 animate-pulse">...</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSend} className="flex-shrink-0 flex items-center p-2.5 border-t border-zinc-200 bg-white/80 backdrop-blur-sm">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu reflejo aquí..."
                        disabled={loading}
                        className="flex-grow bg-zinc-100 border border-zinc-300 rounded-full py-2 px-4 mr-3 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                    />
                    <button type="submit" disabled={loading} className="bg-amber-400 text-white rounded-full p-2.5 hover:bg-amber-500 disabled:bg-zinc-300 transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
}
