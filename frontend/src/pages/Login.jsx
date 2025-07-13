import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css'; // Usaremos los nuevos estilos

export default function Login() {
  // Estado para controlar si mostramos la intro o el formulario
  const [view, setView] = useState('intro'); // 'intro' o 'form'
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Usamos el nuevo payload que el backend espera
      const res = await api.login({ identifier: form.identifier, password: form.password });
      localStorage.setItem('token', res.data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas.');
      setLoading(false);
    }
  };

  return (
    // El contenedor principal ahora tiene una clase dinámica para la animación
    <div className={`auth-scene ${view === 'form' ? 'form-active' : ''}`}>
      
      {/* Vista de Introducción */}
      <div className="auth-intro">
        <h1 className="intro-title">Sun-Self</h1>
        <p className="intro-subtitle">Tu micro-hábito de auto-observación.</p>
        <button className="intro-button" onClick={() => setView('form')}>
          Iniciar el viaje
        </button>
      </div>

      {/* Contenedor del Formulario (inicialmente oculto) */}
      <div className="auth-form-container">
        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            <h2>Bienvenido de vuelta</h2>
            <p className="form-description">Ingresa con tu apodo o email.</p>
            {error && <p className="error-message">{error}</p>}
            <div className="input-group">
              <input 
                type="text" 
                name="identifier" 
                id="identifier"
                placeholder=" "
                onChange={handleChange} 
                required 
              />
              <label htmlFor="identifier">Apodo o Email</label>
            </div>
            <div className="input-group">
              <input 
                type="password" 
                name="password" 
                id="password"
                placeholder=" "
                onChange={handleChange} 
                required 
              />
              <label htmlFor="password">Contraseña</label>
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <p className="auth-switch">
              ¿Es tu primera vez aquí?{' '}
              <a onClick={() => navigate('/register')}>Regístrate</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
