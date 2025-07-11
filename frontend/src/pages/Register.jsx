// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

export default function Register() {
  // 1. Añadimos los nuevos campos al estado del formulario.
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '', 
    apodo: '', 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Nuestro servicio api.register ya envía el objeto 'form' completo. ¡No hay que cambiarlo!
      await api.register(form);
      setSuccess('¡Cuenta creada! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form onSubmit={handleSubmit}>
          <h2>Crear una cuenta</h2>
          {success && <p style={{ color: 'green' }}>{success}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          {/* 2. Añadimos los nuevos inputs al formulario */}
          <div className="form-row">
            <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
            <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required />
          </div>
          <input type="text" name="apodo" placeholder="Apodo (opcional)" onChange={handleChange} />
          <input type="email" name="email" placeholder="Tu email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Crea una contraseña" onChange={handleChange} required />
          
          <button type="submit">Registrarme</button>
          <p style={{ marginTop: '20px' }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
