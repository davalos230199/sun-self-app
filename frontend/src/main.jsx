import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';

// El componente AppWrapper no cambia
const AppWrapper = () => {
    useEffect(() => {
        const setVhVariable = () => {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        window.addEventListener('resize', setVhVariable);
        setVhVariable();
        return () => window.removeEventListener('resize', setVhVariable);
    }, []);

    return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <AppWrapper />
        </AuthProvider>
    </React.StrictMode>,
);
