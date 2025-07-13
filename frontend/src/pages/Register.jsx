import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '', 
    apodo: '', 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.register(form);
      setSuccess('¡Refugio creado! Te llevamos al amanecer...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la cuenta.');
      setLoading(false);
    }
  };

  return (
    // Usamos la misma escena, pero directamente en el modo formulario
    <div className="auth-scene form-active">
      <div className="auth-form-container">
        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            <h2>Crea tu Refugio</h2>
            <p className="form-description">Tu apodo será tu identidad aquí. El resto es para asegurar tu cuenta.</p>
            
            {success && <p className="success-message">{success}</p>}
            {error && <p className="error-message">{error}</p>}
            
            <div className="form-row">
              <div className="input-group">
                <input type="text" name="nombre" id="nombre" placeholder=" " onChange={handleChange} required />
                <label htmlFor="nombre">Nombre</label>
              </div>
              <div className="input-group">
                <input type="text" name="apellido" id="apellido" placeholder=" " onChange={handleChange} required />
                <label htmlFor="apellido">Apellido</label>
              </div>
            </div>
            <div className="input-group">
              <input type="text" name="apodo" id="apodo" placeholder=" " onChange={handleChange} required />
              <label htmlFor="apodo">Apodo (único y visible)</label>
            </div>
            <div className="input-group">
              <input type="email" name="email" id="email" placeholder=" " onChange={handleChange} required />
              <label htmlFor="email">Email</label>
            </div>
            <div className="input-group">
              <input type="password" name="password" id="password" placeholder=" " onChange={handleChange} required />
              <label htmlFor="password">Contraseña</label>
            </div>
            
            <button type="submit" className="auth-button" disabled={loading || success}>
              {loading ? 'Creando...' : 'Crear cuenta'}
            </button>
            <p className="auth-switch">
              ¿Ya tienes un refugio?{' '}
              <a onClick={() => navigate('/login')}>Inicia sesión</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
