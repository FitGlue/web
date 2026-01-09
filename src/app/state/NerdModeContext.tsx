import React, { createContext, useContext, useState, useEffect } from 'react';

interface NerdModeContextType {
  isNerdMode: boolean;
  toggleNerdMode: () => void;
}

const NerdModeContext = createContext<NerdModeContextType | undefined>(undefined);

export const useNerdMode = () => {
  const context = useContext(NerdModeContext);
  if (!context) {
    throw new Error('useNerdMode must be used within a NerdModeProvider');
  }
  return context;
};

export const NerdModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNerdMode, setIsNerdMode] = useState(() => {
    const stored = localStorage.getItem('fitglue_nerd_mode');
    return stored === 'true';
  });

  const toggleNerdMode = () => {
    setIsNerdMode(prev => {
      const newValue = !prev;
      localStorage.setItem('fitglue_nerd_mode', String(newValue));
      return newValue;
    });
  };

  return (
    <NerdModeContext.Provider value={{ isNerdMode, toggleNerdMode }}>
      {children}
    </NerdModeContext.Provider>
  );
};
