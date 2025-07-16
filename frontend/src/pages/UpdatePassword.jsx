import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
// 1. Importamos el cliente de Supabase para poder escuchar los cambios de autenticación
import { supabase } from '../services/supabaseClient'; // Asumimos que tienes un archivo que exporta el cliente
import './Auth.css';

export default function UpdatePassword() {
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const navigate = useNavigate();

    // CAMBIO CLAVE: Usamos onAuthStateChange para obtener el token de forma segura
    useEffect(() => {
        // Esta función se ejecuta cuando Supabase detecta un cambio en la sesión
        // (como cuando el usuario llega desde un enlace de recuperación).
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                if (session?.access_token) {
                    setToken(session.access_token);
                    setError(''); // Limpiamos cualquier error previo
                } else {
                    setError('No se pudo obtener el token de la sesión. El enlace puede haber expirado.');
                }
            }
        });

        // Limpiamos el listener cuando el componente se desmonta para evitar fugas de memoria
        return () => {
            subscription.unsubscribe();
        };
    }, []);


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
            // Ahora usamos la función de la API que actualiza la contraseña en el backend
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
