import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
// Importamos el cliente de Supabase para poder escuchar los eventos de autenticación
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Verificamos la sesión inicial desde localStorage como antes
        const checkUserSession = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.getMe();
                    setUser(response.data.user);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkUserSession();

        // 2. CAMBIO CLAVE: Añadimos un listener para los eventos de Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                // Solo actualizamos el estado global si es un login normal (SIGNED_IN)
                // o un cierre de sesión (SIGNED_OUT).
                if (event === 'SIGNED_IN') {
                    setUser(session.user);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
                // Al ignorar explícitamente el evento 'PASSWORD_RECOVERY', evitamos que el AuthContext
                // establezca un usuario global y provoque la redirección del GuestRoute.
            }
        );

        // 3. Limpiamos el listener cuando el componente se desmonta
        return () => {
            subscription.unsubscribe();
        };

    }, []);

    const value = { user, setUser, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para usar el contexto (sin cambios)
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}
