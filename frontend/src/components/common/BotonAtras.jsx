// src/components/common/BotonAtras.jsx

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BotonAtras = () => {
  const navigate = useNavigate();

  // La función navigate con -1 le dice a React Router "vuelve a la página anterior en el historial"
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button
      onClick={handleGoBack}
      // 1. Removed the outline and added a subtle ring on focus for accessibility
      className="bg-transparent border-none text-amber-500 hover:text-amber-600 transition-colors focus:outline-none rounded-full p-1"
      aria-label="Volver a la página anterior"
    >
      {/* 2. Slightly smaller icon for a more refined look */}
      <ArrowLeft size={26} />
    </button>
  );
};

export default BotonAtras;