// src/components/common/BotonAtras.jsx

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useHeader } from '../../contexts/HeaderContext';

const BotonAtras = () => {
  const navigate = useNavigate();
  const { onBackAction } = useHeader(); // Leemos la acción personalizada
  const handleGoBack = () => {
        // Si hay una acción personalizada en el contexto, la ejecutamos.
        if (typeof onBackAction === 'function') {
            onBackAction();
        } else {
            // Si no, ejecutamos el comportamiento por defecto.
            navigate(-1);
        }
    };

  return (
    <button
      onClick={handleGoBack}
      className="bg-transparent border-none text-amber-500 hover:text-amber-600 transition-colors focus:outline-none rounded-full p-1"
      aria-label="Volver a la página anterior"
    >
    <ArrowLeft size={26} />
    </button>
  );
};

export default BotonAtras;