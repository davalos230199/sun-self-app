import React from 'react';
import Lottie from 'lottie-react';

// VERSIÓN MEJORADA:
// Usamos '{ ...props }' para capturar y pasar CUALQUIER otra propiedad
// que le enviemos al componente, como 'onComplete', 'className', etc.
const LottieIcon = ({ animationData, loop = true, autoplay = true, ...props }) => {
  return (
    <Lottie 
      animationData={animationData} 
      loop={loop} 
      autoplay={autoplay} 
      {...props} // <-- La clave está aquí
    />
  );
};

export default LottieIcon;