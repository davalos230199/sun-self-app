import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
// CAMBIO: Importamos el cliente de Supabase para escuchar eventos
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificamos la sesión inicial desde localStorage como antes
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

        // CAMBIO CLAVE: Añadimos un listener para eventos de login y logout normales,
        // pero ignoramos el de recuperación de contraseña.
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

        // Limpiamos el listener cuando el componente se desmonta
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

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}
