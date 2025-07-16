import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

export default function UpdatePassword() {
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const navigate = useNavigate();

    // CAMBIO CLAVE: Se reestructura la lógica para evitar condiciones de carrera.
    useEffect(() => {
        // Parseamos el "hash" de la URL (la parte que viene después del #)
        const hash = window.location.hash;
        let foundToken = null;

        // Primero, verificamos si la URL contiene un token de recuperación.
        if (hash.includes('type=recovery') && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1)); // Quitamos el '#'
            foundToken = params.get('access_token');
        }

        // Después de verificar, tomamos una decisión.
        if (foundToken) {
            // Si encontramos el token, lo guardamos en el estado.
            // Esto habilitará el formulario.
            setToken(foundToken);
            setError(''); // Limpiamos cualquier error previo.
        } else {
            // Si no se encontró ningún token, mostramos el error.
            setError('Token de recuperación no encontrado o inválido. Por favor, solicita un nuevo enlace.');
        }
    }, []); // El array vacío asegura que esto se ejecute solo una vez al cargar la página.


    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (form.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.updatePassword({ token, password: form.password });
            setSuccess(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo actualizar la contraseña.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-scene form-active">
            <div className="auth-form-container">
                <div className="auth-card">
                    <form onSubmit={handleSubmit} noValidate>
                        <h2>Crea tu Nueva Contraseña</h2>
                        {success && <p className="success-message">{success}</p>}
                        {error && <p className="error-message">{error}</p>}
                        
                        <div className="input-group">
                            <input type="password" name="password" id="update-password" placeholder=" " onChange={handleChange} required disabled={!token || loading || !!success} />
                            <label htmlFor="update-password">Nueva Contraseña</label>
                        </div>
                        <div className="input-group">
                            <input type="password" name="confirmPassword" id="update-confirm-password" placeholder=" " onChange={handleChange} required disabled={!token || loading || !!success} />
                            <label htmlFor="update-confirm-password">Confirmar Contraseña</label>
                        </div>
                        
                        <button type="submit" className="auth-button" disabled={!token || loading || !!success}>
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
