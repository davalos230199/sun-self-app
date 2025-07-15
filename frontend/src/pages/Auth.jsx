import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

// --- Formulario de Login ---
const LoginForm = ({ onSwitchToRegister, onSwitchToForgot, onLogin }) => {
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onLogin(form);
        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h2>Bienvenido de vuelta</h2>
            <p className="form-description">Ingresa con tu apodo o email.</p>
            {error && <p className="error-message">{error}</p>}
            <div className="input-group">
                <input type="text" name="identifier" id="login-identifier" placeholder=" " onChange={handleChange} required />
                <label htmlFor="login-identifier">Apodo o Email</label>
            </div>
            <div className="input-group">
                <input type="password" name="password" id="login-password" placeholder=" " onChange={handleChange} required />
                <label htmlFor="login-password">Contraseña</label>
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <div className="auth-switch-container">
                {/* CAMBIO: Se añade el enlace para "Olvidé mi contraseña" */}
                <p className="auth-switch">
                    <span className="auth-link" onClick={onSwitchToForgot} role="button" tabIndex="0">
                        Olvidé mi contraseña
                    </span>
                </p>
                <p className="auth-switch">
                    ¿Es tu primera vez aquí?{' '}
                    <span className="auth-link" onClick={onSwitchToRegister} role="button" tabIndex="0">
                        Regístrate
                    </span>
                </p>
            </div>
        </form>
    );
};

// --- Formulario de Registro (Sin cambios) ---
const RegisterForm = ({ onSwitchToLogin }) => {
    // ... tu código existente para RegisterForm no cambia ...
    const [form, setForm] = useState({ nombre: '', apellido: '', apodo: '', email: '', password: '' });
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
            setSuccess('¡Refugio creado! Revisa tu email para la confirmación.');
            setTimeout(() => {
                onSwitchToLogin();
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrar la cuenta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h2>Crea tu Refugio</h2>
            <p className="form-description">Tu apodo será tu identidad aquí.</p>
            {success && <p className="success-message">{success}</p>}
            {error && <p className="error-message">{error}</p>}
            <div className="form-row">
                <div className="input-group"><input type="text" name="nombre" id="register-nombre" placeholder=" " onChange={handleChange} required /><label htmlFor="register-nombre">Nombre</label></div>
                <div className="input-group"><input type="text" name="apellido" id="register-apellido" placeholder=" " onChange={handleChange} required /><label htmlFor="register-apellido">Apellido</label></div>
            </div>
            <div className="input-group"><input type="text" name="apodo" id="register-apodo" placeholder=" " onChange={handleChange} required /><label htmlFor="register-apodo">Apodo (único)</label></div>
            <div className="input-group"><input type="email" name="email" id="register-email" placeholder=" " onChange={handleChange} required /><label htmlFor="register-email">Email</label></div>
            <div className="input-group"><input type="password" name="password" id="register-password" placeholder=" " onChange={handleChange} required /><label htmlFor="register-password">Contraseña</label></div>
            <button type="submit" className="auth-button" disabled={loading || !!success}>
                {loading ? 'Creando...' : 'Crear cuenta'}
            </button>
            <p className="auth-switch">
                ¿Ya tienes un refugio?{' '}
                <span className="auth-link" onClick={onSwitchToLogin} role="button" tabIndex="0">
                    Inicia sesión
                </span>
            </p>
        </form>
    );
};


// --- CAMBIO: Nuevo Formulario para Olvidé mi Contraseña ---
const ForgotPasswordForm = ({ onSwitchToLogin }) => {
    const [form, setForm] = useState({ email: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const response = await api.forgotPassword(form);
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo procesar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h2>Restablecer Contraseña</h2>
            <p className="form-description">Ingresa tu email y te enviaremos un enlace para recuperarla.</p>
            {success && <p className="success-message">{success}</p>}
            {error && <p className="error-message">{error}</p>}
            <div className="input-group">
                <input type="email" name="email" id="forgot-email" placeholder=" " onChange={handleChange} required />
                <label htmlFor="forgot-email">Email</label>
            </div>
            <button type="submit" className="auth-button" disabled={loading || !!success}>
                {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <p className="auth-switch">
                <span className="auth-link" onClick={onSwitchToLogin} role="button" tabIndex="0">
                    Volver a Iniciar sesión
                </span>
            </p>
        </form>
    );
};


// --- Componente Principal de Autenticación (Modificado) ---
export default function Auth() {
    const navigate = useNavigate();
    // CAMBIO: El estado de la vista ahora puede ser 'forgot'
    const [view, setView] = useState('intro');

    const handleLogin = async (credentials) => {
        const res = await api.login(credentials);
        localStorage.setItem('token', res.data.token);
        navigate('/home');
    };
    
    return (
        <div className={`auth-scene ${view !== 'intro' ? 'form-active' : ''}`}>
            <div className="auth-intro">
                <h1 className="intro-title">Sun-Self</h1>
                <p className="intro-subtitle">Tu micro-hábito de auto-observación.</p>
                <button className="intro-button" onClick={() => setView('login')}>
                    Iniciar el viaje
                </button>
            </div>

            <div className="auth-form-container">
                <div className="auth-card">
                    <div className={`form-wrapper ${view === 'login' ? 'visible' : ''}`}>
                        <LoginForm 
                            onSwitchToRegister={() => setView('register')} 
                            onSwitchToForgot={() => setView('forgot')} // <-- Se pasa la nueva función
                            onLogin={handleLogin} 
                        />
                    </div>
                    <div className={`form-wrapper ${view === 'register' ? 'visible' : ''}`}>
                        <RegisterForm onSwitchToLogin={() => setView('login')} />
                    </div>
                    {/* CAMBIO: Se añade el nuevo formulario al renderizado condicional */}
                    <div className={`form-wrapper ${view === 'forgot' ? 'visible' : ''}`}>
                        <ForgotPasswordForm onSwitchToLogin={() => setView('login')} />
                    </div>
                </div>
            </div>
        </div>
    );
}
