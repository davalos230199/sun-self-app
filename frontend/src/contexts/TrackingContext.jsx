// frontend/src/contexts/TrackingContext.jsx
import React, { createContext, useState, useContext } from 'react';

const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
    // Guardamos la fecha que el calendario está mostrando
    const [activeStartDate, setActiveStartDate] = useState(new Date());

    const value = {
        activeStartDate,
        setActiveStartDate,
    };

    return (
        <TrackingContext.Provider value={value}>
            {children}
        </TrackingContext.Provider>
    );
};

export const useTracking = () => useContext(TrackingContext);