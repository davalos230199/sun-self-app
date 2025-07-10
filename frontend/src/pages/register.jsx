// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.register(form);
      setSuccess('¡Usuario creado con éxito! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el usuario.');
    }
  };

  return (
    // Envolvemos todo en nuestro "molde" para mantener la consistencia.
    <div className="card-container">
      <form onSubmit={handleSubmit}>
        <h2>Crear una cuenta</h2>
        <p>Únete a Sun-Self para empezar tu diario.</p>
        <input
          name="email"
          type="email"
          placeholder="Tu email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Crea una contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Registrarme</button>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}

        <p style={{ marginTop: '20px' }}>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
