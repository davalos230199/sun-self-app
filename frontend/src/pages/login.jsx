// ./frontend/src/pages/login.jsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  // Estado inicial ahora usa 'email' en lugar de 'username'
  const [form, setForm] = useState({ email: '', password: '' }); // <-- CAMBIO
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Enviamos el objeto 'form' que ahora contiene { email, password }
      const res = await axios.post('http://localhost:4000/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/home');
    } catch (err) {
      // Mensaje de error más específico
      alert('Email o contraseña incorrectos.'); // <-- CAMBIO (Opcional, pero mejor)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>
      <input
        name="email" // <-- CAMBIO
        type="email" // <-- CAMBIO (Mejor para la semántica HTML)
        placeholder="Email" // <-- CAMBIO
        value={form.email} // <-- CAMBIO
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={handleChange}
      />
      <button type="submit">Entrar</button>
    </form>
  );
}








/*import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

    

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:4000/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/home');
    } catch (err) {
      alert('Login inválido');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>
      <input
        name="username"
        placeholder="Usuario"
        value={form.username}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={handleChange}
      />
      <button type="submit">Entrar</button>
    </form>
  );
}
*/