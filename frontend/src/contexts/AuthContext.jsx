import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

// 1. Creamos el contexto. Es como una central de información.
const AuthContext = createContext(null);

// 2. Creamos el "Proveedor". Este componente envolverá toda tu aplicación
//    y se encargará de mantener y distribuir la información del usuario.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Estado para saber si aún estamos verificando la sesión inicial

    useEffect(() => {
        // Esta función se ejecuta solo una vez, cuando la aplicación carga por primera vez.
        const checkUserSession = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Si encontramos un token, le preguntamos al backend quién es el usuario.
                    const response = await api.getMe();
                    setUser(response.data.user);
                } catch (error) {
                    // Si el token es inválido (expiró, etc.), lo limpiamos.
                    console.error("Sesión inválida, limpiando token:", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            // Marcamos que la carga inicial ha terminado.
            setLoading(false);
        };

        checkUserSession();
    }, []);

    // Este es el "paquete" de información que todos los componentes podrán solicitar.
    const value = { user, setUser, loading };

    // Mientras está cargando, no mostramos nada para evitar parpadeos.
    // Una vez que termina la carga, renderiza el resto de la aplicación (children).
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// 3. Creamos un "Hook" personalizado. Es un atajo para que los componentes
//    puedan acceder fácilmente a la información del contexto.
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}
