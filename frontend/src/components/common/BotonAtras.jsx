// src/components/common/BotonAtras.jsx

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRef } from 'react';

const BotonAtras = () => {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const handleGoBack = () => {
    navigate(-1);
      if (buttonRef.current) {
      buttonRef.current.blur();
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleGoBack}
      className="bg-transparent border-none text-amber-500 hover:text-amber-600 transition-colors focus:outline-none rounded-full p-1"
      aria-label="Volver a la página anterior"
    >
    <ArrowLeft size={26} />
    </button>
  );
};

export default BotonAtras;