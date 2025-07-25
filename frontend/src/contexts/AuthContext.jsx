import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // Tu api.js
import { supabase } from '../services/supabaseClient'; // Tu cliente de supabase

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Este useEffect se encarga de verificar la sesión al cargar la app
    useEffect(() => {
        const checkUserSession = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Sincronizamos la sesión de Supabase con nuestro token
                    await supabase.auth.setSession({ access_token: token, refresh_token: '' });
                    // Y obtenemos los datos del usuario desde nuestro backend
                    const response = await api.getMe();
                    setUser(response.data.user);
                } catch (error) {
                    console.error("Token inválido o sesión expirada:", error);
                    localStorage.removeItem('token');
                    await supabase.auth.signOut();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkUserSession();

        // Mantenemos tu listener para eventos de Supabase, es una buena práctica
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                // Si Supabase detecta un cierre de sesión, actualizamos el estado
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Nueva función de login que sincroniza todo
    const login = async (credentials) => {
        // 1. Hacemos login contra nuestro backend en Render
        const response = await api.login(credentials);
        const { token, user } = response.data;

        // 2. Guardamos el token de nuestro backend en localStorage
        localStorage.setItem('token', token);
        
        // 3. ¡LA CLAVE! Usamos el mismo token para establecer la sesión en el cliente de Supabase
        await supabase.auth.setSession({ access_token: token, refresh_token: '' });

        // 4. Actualizamos el estado del usuario en la app
        setUser(user);
    };

    // Nueva función de logout que limpia todo
    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('token');
        setUser(null);
    };

    // Ahora el contexto provee las funciones 'login' y 'logout'
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// El hook para usar el contexto no cambia
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
