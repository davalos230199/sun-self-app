// frontend/src/pages/Register.jsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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

    if (!form.email || !form.password) {
      setError('Email y contraseña son requeridos.');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.post(`${apiUrl}/register`, form);

      setSuccess('¡Usuario creado con éxito! Redirigiendo al login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el usuario.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth: '450px', margin: 'auto'}}>
      <h2>Crear una cuenta</h2>
      <p>Únete a Sun-Self para empezar tu diario.</p>
      <input
        name="email"
        type="email"
        placeholder="Tu email"
        value={form.email}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Crea una contraseña"
        value={form.password}
        onChange={handleChange}
      />
      <button type="submit">Registrarme</button>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}

      <p style={{ marginTop: '20px' }}>
        ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </form>
  );
}