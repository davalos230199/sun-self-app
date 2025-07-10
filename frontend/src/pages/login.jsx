
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // <-- Añade Link aquí

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
      // DESPUÉS:
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${apiUrl}/api/auth/login`, form);
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
      
      {/* AÑADE ESTE PÁRRAFO CON EL LINK */}
      <p style={{ marginTop: '20px' }}>
        ¿No tienes una cuenta? <Link to="/register">Crea una aquí</Link>
      </p>
    </form>
  );
}
