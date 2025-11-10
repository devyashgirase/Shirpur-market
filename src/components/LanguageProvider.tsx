import React, { createContext, useContext } from 'react';

type Language = 'en';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentLanguage: Language = 'en';
  const changeLanguage = () => {};
  const t = (key: string) => key;

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { currentLanguage: 'en', changeLanguage: () => {}, t: (key: string) => key };
  }
  return context;
};