import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSessionData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setUser(userProfile || null);
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        getSessionData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            getSessionData();
        });

        return () => subscription.unsubscribe();
    }, []);

    // Función para iniciar sesión con Google
    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
            if (error) throw error;
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error.message);
        }
    };

    // Función para cerrar sesión
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };
    
    // Solo se volverá a crear si 'user' o 'loading' cambian su valor real.
    const value = useMemo(
        () => ({
            user,
            loading,
            signInWithGoogle,
            signOut,
        }),
        [user, loading]
    );

    // Renderizamos directamente los children, sin spinner.
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado (sin cambios)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};