import React, { createContext, useContext } from 'react';
import { useTranslation, Language } from '@/lib/i18n';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, currentLang, changeLanguage } = useTranslation();

  return (
    <LanguageContext.Provider value={{ currentLanguage: currentLang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    const { t, currentLang, changeLanguage } = useTranslation();
    return { currentLanguage: currentLang, changeLanguage, t };
  }
  return context;
};