// frontend/src/components/CalendarTile.jsx

import React from 'react';

// Importamos las animaciones
import sunIcon from '../assets/icons/sun.svg';
import cloudIcon from '../assets/icons/cloud.svg';
import rainIcon from '../assets/icons/rain.svg';

const iconMap = {
    soleado: sunIcon,
    nublado: cloudIcon,
    lluvioso: rainIcon,
};

// Este es el componente que renderiza UNA SOLA casilla del calendario
const CalendarTileContent = ({ registro, date }) => {
    const diaDelMes = date.getDate(); // Obtenemos el número del día

    return (
         <div className="flex flex-col items-center justify-end h-full w-full">
            {registro && (
                // Ajustamos el margen para que se vea bien debajo del número que dibuja react-calendar
                <div className="w-10 h-10 -mt-10"> 
                    <img src={iconMap[registro.estado_general]} alt={registro.estado_general} className="w-full h-full" />
                </div>
            )}
        </div>
    );
};

// Aquí está la magia: React.memo evita re-renderizados innecesarios.
// El componente solo se actualizará si sus props 'registro' o 'date' cambian.
export default React.memo(CalendarTileContent);