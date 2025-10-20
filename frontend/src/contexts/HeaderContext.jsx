// frontend/src/contexts/HeaderContext.jsx
import React, { createContext, useState, useContext } from 'react';

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
    const [pageTitle, setPageTitle] = useState(null);
    const [showBackButton, setShowBackButton] = useState(true);
    const [onBackAction, setOnBackAction] = useState(null); 
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    const value = {
        title: pageTitle,
        setTitle: setPageTitle,
        showBackButton,
        setShowBackButton,
        onBackAction,
        setOnBackAction,
        isHeaderVisible, 
        setIsHeaderVisible
    };

    return (
        <HeaderContext.Provider value={value}>
            {children}
        </HeaderContext.Provider>
    );
};

export const useHeader = () => useContext(HeaderContext);