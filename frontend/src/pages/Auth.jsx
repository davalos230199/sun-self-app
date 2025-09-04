import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
// Mantenemos el import del CSS por ahora, pero su contenido será mínimo.
import './Auth.css';
import { useAuth } from '../contexts/AuthContext';

// --- Formulario de Login ---
const LoginForm = ({ onSwitchToRegister, onSwitchToForgot }) => {
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.login(form);
            localStorage.setItem('token', res.data.token);
            const { data: userData } = await api.getMe();
            setUser(userData.user);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h2 className="font-['Patrick_Hand'] text-3xl mb-2 text-zinc-800">Bienvenido de vuelta</h2>
            <p className="mb-8 text-zinc-500 text-sm">Ingresa con tu apodo o email.</p>
            {error && <p className="p-2.5 rounded-md mb-5 bg-red-100 text-red-700 text-sm">{error}</p>}
            
            <div className="relative mb-6">
                <input type="text" name="identifier" id="login-identifier" placeholder=" " onChange={handleChange} required 
                       className="peer w-full border-b-2 border-zinc-300 p-2 bg-transparent text-base outline-none focus:border-orange-400" />
                <label htmlFor="login-identifier" 
                       className="absolute top-2 left-2 text-zinc-500 pointer-events-none transition-all duration-200 ease-in-out peer-focus:-top-5 peer-focus:left-0 peer-focus:text-xs peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-500">
                    Apodo o Email
                </label>
            </div>
            
            <div className="relative mb-6">
                <input type="password" name="password" id="login-password" placeholder=" " onChange={handleChange} required 
                       className="peer w-full border-b-2 border-zinc-300 p-2 bg-transparent text-base outline-none focus:border-orange-400" />
                <label htmlFor="login-password" 
                       className="absolute top-2 left-2 text-zinc-500 pointer-events-none transition-all duration-200 ease-in-out peer-focus:-top-5 peer-focus:left-0 peer-focus:text-xs peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-500">
                    Contraseña
                </label>
            </div>
            
            <button type="submit" disabled={loading}
                    className="w-full p-3 border-none rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-white text-lg font-semibold cursor-pointer transition-all duration-200 hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg hover:enabled:shadow-orange-500/30 disabled:bg-zinc-300 disabled:cursor-not-allowed">
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
            
            <div className="mt-5 text-sm">
                <p className="mb-2">
                    <span className="text-orange-500 font-semibold cursor-pointer p-1 transition-all hover:underline" onClick={onSwitchToForgot} role="button" tabIndex="0">
                        Olvidé mi contraseña
                    </span>
                </p>
                <p>
                    ¿Es tu primera vez aquí?{' '}
                    <span className="text-orange-500 font-semibold cursor-pointer p-1 transition-all hover:underline" onClick={onSwitchToRegister} role="button" tabIndex="0">
                        Regístrate
                    </span>
                </p>
            </div>
        </form>
    );
};

// --- Formulario de Registro ---
const RegisterForm = ({ onSwitchToLogin }) => {
    const [form, setForm] = useState({ nombre: '', apellido: '', apodo: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            await api.register(form);
            setSuccess('¡Cuenta creada! Revisa tu email para la confirmación.');
            setTimeout(() => { onSwitchToLogin(); }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrar la cuenta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            {/* CAMBIO DE TEXTO */}
            <h2 className="font-['Patrick_Hand'] text-3xl mb-2 text-zinc-800">Aquí comienza tu auto-descubrimiento</h2>
            <p className="mb-8 text-zinc-500 text-sm">Crea tu cuenta para guardar tu progreso.</p>
            {success && <p className="p-2.5 rounded-md mb-5 bg-green-100 text-green-800 text-sm">{success}</p>}
            {error && <p className="p-2.5 rounded-md mb-5 bg-red-100 text-red-700 text-sm">{error}</p>}
            
            <div className="flex flex-col sm:flex-row sm:gap-5">
                <div className="relative mb-6 w-full">
                    <input type="text" name="nombre" id="register-nombre" placeholder=" " onChange={handleChange} required className="peer w-full border-b-2 border-zinc-300 p-2 bg-transparent text-base outline-none focus:border-orange-400" />
                    <label htmlFor="register-nombre" className="absolute top-2 left-2 text-zinc-500 pointer-events-none transition-all duration-200 ease-in-out peer-focus:-top-5 peer-focus:left-0 peer-focus:text-xs peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-500">Nombre</label>
                </div>
                <div className="relative mb-6 w-full">
                    <input type="text" name="apellido" id="register-apellido" placeholder=" " onChange={handleChange} required className="peer w-full border-b-2 border-zinc-300 p-2 bg-transparent text-base outline-none focus:border-orange-400" />
                    <label htmlFor="register-apellido" className="absolute top-2 left-2 text-zinc-500 pointer-events-none transition-all duration-200 ease-in-out peer-focus:-top-5 peer-focus:left-0 peer-focus:text-xs peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-500">Apellido</label>
                </div>
            </div>
            <div className="relative mb-6"><input type="text" name="apodo" id="register-apodo" placeholder=" " onChange={handleChange} required className="peer w-full border-b-2 border-zinc-300 p-2 bg-transparent text-base outline-none focus:border-orange-400" /><label htmlFor="register-apodo" className="absolute top-2 left-2 text-zinc-500 pointer-events-none transition-all duration-200 ease-in-out peer-focus:-top-5 peer-focus:left-0 peer-focus:text-xs peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-500">Apodo (único)</label></div>
            <div className="relative mb-6"><input type="email" name="email" id="register-email" placeholder=" " onChange={handleChange} required className="peer w-full border-b-2 border-zinc-300 p-2 bg-transparent text-base outline-none focus:border-orange-400" /><label htmlFor="register-email" className="absolute top-2 left-2 text-zinc-500 pointer-events-none transition-all duration-200 ease-in-out peer-focus:-top-5 peer-focus:left-0 peer-focus:text-xs peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-500">Email</label></div>
            <div className="relative mb-6"><input type="password" name="password" id="register-password" placeholder=" " onChange={handleChange} required className="peer w-full border-b-2 border-zinc-300 p-2 bg-transparent text-base outline-none focus:border-orange-400" /><label htmlFor="register-password" className="absolute top-2 left-2 text-zinc-500 pointer-events-none transition-all duration-200 ease-in-out peer-focus:-top-5 peer-focus:left-0 peer-focus:text-xs peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-500">Contraseña</label></div>
            
            <button type="submit" disabled={loading || !!success} className="w-full p-3 border-none rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-white text-lg font-semibold cursor-pointer transition-all duration-200 hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg hover:enabled:shadow-orange-500/30 disabled:bg-zinc-300 disabled:cursor-not-allowed">
                {loading ? 'Creando...' : 'Crear cuenta'}
            </button>
            <p className="mt-5 text-sm">
                ¿Ya tienes una cuenta?{' '}
                <span className="text-orange-500 font-semibold cursor-pointer p-1 transition-all hover:underline" onClick={onSwitchToLogin} role="button" tabIndex="0">
                    Inicia sesión
                </span>
            </p>
        </form>
    );
};

// --- Formulario Olvidé Contraseña ---
const ForgotPasswordForm = ({ onSwitchToLogin }) => {
    // ... (sin cambios en esta función)
    const [form, setForm] = useState({ email: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            const response = await api.forgotPassword({ email: form.email });
            setSuccess(response.data.message);
            setTimeout(() => { onSwitchToLogin(); }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo procesar la solicitud.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h2 className="font-['Patrick_Hand'] text-3xl mb-2 text-zinc-800">Restablecer Contraseña</h2>
            <p className="mb-8 text-zinc-500 text-sm">Ingresa tu email y te enviaremos un enlace.</p>
            {success && <p className="p-2.5 rounded-md mb-5 bg-green-100 text-green-800 text-sm">{success}</p>}
            {error && <p className="p-2.5 rounded-md mb-5 bg-red-100 text-red-700 text-sm">{error}</p>}
            <div className="relative mb-6">
                <input type="email" name="email" id="forgot-email" placeholder=" " onChange={handleChange} required className="peer w-full border-b-2 border-zinc-300 p-2 bg-transparent text-base outline-none focus:border-orange-400" />
                <label htmlFor="forgot-email" className="absolute top-2 left-2 text-zinc-500 pointer-events-none transition-all duration-200 ease-in-out peer-focus:-top-5 peer-focus:left-0 peer-focus:text-xs peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-500">Email</label>
            </div>
            <button type="submit" disabled={loading || !!success} className="w-full p-3 border-none rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-white text-lg font-semibold cursor-pointer transition-all duration-200 hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg hover:enabled:shadow-orange-500/30 disabled:bg-zinc-300 disabled:cursor-not-allowed">
                {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <p className="mt-5 text-sm">
                <span className="text-orange-500 font-semibold cursor-pointer p-1 transition-all hover:underline" onClick={onSwitchToLogin} role="button" tabIndex="0">
                    Volver a Iniciar sesión
                </span>
            </p>
        </form>
    );
};


// --- Componente Principal de Autenticación ---
export default function Auth() {
    const [view, setView] = useState('intro');
    
    return (
        <div className={`auth-scene ${view !== 'intro' ? 'form-active' : ''}`}>
            {/* INTRO */}
            <div className="auth-intro">
                <h1 className="font-['Patrick_Hand'] text-5xl sm:text-6xl font-semibold text-white [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.2)]">
                    Sun-Self
                </h1>
                <p className="text-lg mt-2 mb-8 text-white font-light [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.2)]">
                    Tu micro-hábito de auto-observación.
                </p>
                <button 
                    onClick={() => setView('login')}
                    className="bg-white/20 border border-white text-white py-3 px-8 rounded-full text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-white/30 hover:scale-105"
                >
                    Iniciar el viaje
                </button>
            </div>

            {/* FORMULARIOS */}
            <div className="auth-form-container">
                {/* CAMBIO DE ALTURA DINÁMICA */}
                <div className={`
                    relative bg-white/80 backdrop-blur-md p-7 sm:p-10 rounded-xl shadow-lg text-center overflow-hidden 
                    transition-all duration-500 ease-in-out
                    ${view === 'register' ? 'sm:min-h-[700px] min-h-[680px]' : 'sm:min-h-[620px] min-h-[590px]'}
                `}>
                    <div className={`form-wrapper ${view === 'login' ? 'visible' : ''}`}>
                        <LoginForm 
                            onSwitchToRegister={() => setView('register')} 
                            onSwitchToForgot={() => setView('forgot')}
                        />
                    </div>
                    <div className={`form-wrapper ${view === 'register' ? 'visible' : ''}`}>
                        <RegisterForm onSwitchToLogin={() => setView('login')} />
                    </div>
                    <div className={`form-wrapper ${view === 'forgot' ? 'visible' : ''}`}>
                        <ForgotPasswordForm onSwitchToLogin={() => setView('login')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

