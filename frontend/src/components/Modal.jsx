// frontend/src/components/Modal.jsx
import { useEffect } from 'react';
import './Modal.css';

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function Modal({ isOpen, onClose, children }) {
  // Efecto para deshabilitar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Limpiamos el estilo cuando el componente se desmonta
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    // El overlay oscuro que cubre toda la pantalla
    <div className="modal-overlay" onClick={onClose}>
      {/* El contenido del modal. Detenemos la propagación para que un clic aquí no cierre el modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          <CloseIcon />
        </button>
        {/* Aquí se renderizará cualquier contenido que le pasemos al modal */}
        {children}
      </div>
    </div>
  );
}
