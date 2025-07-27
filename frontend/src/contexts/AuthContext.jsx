import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabaseClient';

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
                    // Sincronizamos la sesión de Supabase con nuestro token ANTES de hacer nada más.
                    await supabase.auth.setSession({ access_token: token, refresh_token: '' });
                    
                    // Luego, obtenemos los datos de nuestro perfil desde nuestro backend.
                    const response = await api.getMe();
                    setUser(response.data.user);
                } catch (error) {
                    console.error("Token inválido o sesión expirada, limpiando:", error);
                    localStorage.removeItem('token');
                    await supabase.auth.signOut();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkUserSession();

        // Tu listener de eventos de Supabase es una buena práctica y lo mantenemos.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    localStorage.removeItem('token');
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Nueva función de login que sincroniza todo y devuelve el control.
    const login = async (credentials) => {
        try {
            const response = await api.login(credentials);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            
            // Sincronizamos a los "guardias de seguridad".
            await supabase.auth.setSession({ access_token: token, refresh_token: '' });

            setUser(user);
            // Devolvemos el usuario para que el componente que llama sepa que el login fue exitoso.
            return user; 
        } catch (error) {
            // Si el login falla, nos aseguramos de que todo quede limpio.
            localStorage.removeItem('token');
            await supabase.auth.signOut();
            setUser(null);
            // Re-lanzamos el error para que el formulario de login pueda mostrar "contraseña incorrecta".
            throw error; 
        }
    };

    // Nueva función de logout que limpia todo de forma segura.
    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('token');
        setUser(null);
    };

    // Ahora exportamos 'setUser' para arreglar el bug del logout,
    // y las nuevas funciones 'login' y 'logout'.
    const value = { user, setUser, login, logout, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
