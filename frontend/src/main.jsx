// frontend/src/main.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Un componente wrapper para manejar la lógica del viewport
const AppWrapper = () => {
  useEffect(() => {
    const setVhVariable = () => {
      // Medimos la altura real de la ventana interna
      let vh = window.innerHeight * 0.01;
      // La establecemos como una variable CSS en el elemento raíz
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // La ejecutamos al cargar y cada vez que se redimensiona la ventana
    window.addEventListener('resize', setVhVariable);
    setVhVariable(); // La llamamos una vez al inicio

    // Limpiamos el event listener cuando el componente se desmonta
    return () => window.removeEventListener('resize', setVhVariable);
  }, []);

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
);
