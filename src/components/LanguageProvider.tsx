import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageService, Language } from '@/lib/i18n';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(LanguageService.getCurrentLanguage());

  useEffect(() => {
    const unsubscribe = LanguageService.subscribe(setCurrentLanguage);
    return unsubscribe;
  }, []);

  const changeLanguage = (lang: Language) => {
    LanguageService.setLanguage(lang);
  };

  const t = (key: string) => LanguageService.translate(key, currentLanguage);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};