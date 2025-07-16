import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; // Importamos el cliente
import './Auth.css';

export default function UpdatePassword() {
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Este componente ahora es responsable de escuchar su propio evento.
    useEffect(() => {
        // Verificamos si el usuario llegó aquí sin el enlace correcto.
        if (!window.location.hash.includes('type=recovery')) {
            setError('Enlace inválido. Por favor, solicita un nuevo enlace desde la página de login.');
            return; // Detenemos la ejecución si el enlace no es de recuperación
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // Escuchamos específicamente el evento de recuperación.
            if (event === 'PASSWORD_RECOVERY') {
                // Cuando el evento ocurre, la sesión temporal ya está activa.
                // No necesitamos el token, solo necesitamos saber que el evento ocurrió.
                setError('');
            }
        });

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
            // La librería de Supabase usa la sesión temporal que se estableció
            // gracias al token en la URL para actualizar la contraseña del usuario correcto.
            const { error: updateError } = await supabase.auth.updateUser({ 
                password: form.password 
            });

            if (updateError) throw updateError;
            
            setSuccess('Contraseña actualizada con éxito. Serás redirigido para iniciar sesión.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'No se pudo actualizar la contraseña. El enlace puede haber expirado.');
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
                            <input type="password" name="password" id="update-password" placeholder=" " onChange={handleChange} required disabled={loading || !!success} />
                            <label htmlFor="update-password">Nueva Contraseña</label>
                        </div>
                        <div className="input-group">
                            <input type="password" name="confirmPassword" id="update-confirm-password" placeholder=" " onChange={handleChange} required disabled={loading || !!success} />
                            <label htmlFor="update-confirm-password">Confirmar Contraseña</label>
                        </div>
                        
                        <button type="submit" className="auth-button" disabled={loading || !!success}>
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
