// frontend/src/components/CalendarTile.jsx

import React from 'react';
import Lottie from 'lottie-react';

// Importamos las animaciones
import sunLoopAnimation from '../assets/animations/sun-loop.json';
import cloudLoopAnimation from '../assets/animations/cloud-loop.json';
import rainLoopAnimation from '../assets/animations/rain-loop.json';

const animationMap = {
    soleado: sunLoopAnimation,
    nublado: cloudLoopAnimation,
    lluvioso: rainLoopAnimation,
};

// Este es el componente que renderiza UNA SOLA casilla del calendario
const CalendarTileContent = ({ registro, date }) => {
    const diaDelMes = date.getDate(); // Obtenemos el número del día

    return (
         <div className="flex flex-col items-center justify-end h-full w-full">
            {registro && (
                // Ajustamos el margen para que se vea bien debajo del número que dibuja react-calendar
                <div className="w-10 h-10 -mt-10"> 
                    <Lottie animationData={animationMap[registro.estado_general]} loop={true} />
                </div>
            )}
        </div>
    );
};

// Aquí está la magia: React.memo evita re-renderizados innecesarios.
// El componente solo se actualizará si sus props 'registro' o 'date' cambian.
export default React.memo(CalendarTileContent);