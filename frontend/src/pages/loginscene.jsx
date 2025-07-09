import { useState } from 'react';
import Login from './login';
import './LoginScene.css';

export default function LoginScene() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenNotebook = () => {
    setIsOpen(true);
  };

  return (
    <div className="scene-container">
      {/* Usamos una clase condicional para aplicar la animación */}
      <div className={`notebook ${isOpen ? 'open' : ''}`}>

        {/* La tapa del cuaderno, que al hacer clic la abre */}
        <div className="notebook-cover" onClick={handleOpenNotebook}>
          {/* Ocultamos el texto de la tapa cuando está abierta */}
          {!isOpen && <span>Sun-Self</span>}
        </div>

        {/* La página derecha del cuaderno, que contiene el formulario de login */}
        <div className="notebook-page">
          {/* El formulario de Login solo es visible cuando el cuaderno está abierto */}
          {isOpen && <Login />}
        </div>

      </div>
    </div>
  );
}