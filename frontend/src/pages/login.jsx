// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// 1. Importamos la función específica que necesitamos de nuestro nuevo módulo.
import api from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 2. Usamos la nueva función del servicio. ¡Más limpio y declarativo!
      const res = await api.login(form);
      localStorage.setItem('token', res.data.token);
      navigate('/home');
    } catch (err) {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
      console.error("Error en el login:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        onChange={handleChange}
        required
      />
      <button type="submit">Entrar</button>
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </form>
  );
}
