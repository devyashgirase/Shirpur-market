// Disabled i18n to fix build issues
export type Language = 'en';
export const translations = { en: {} };
export class LanguageService {
  static getCurrentLanguage() { return 'en'; }
  static translate(key: string) { return key; }
}
import React from 'react';
export const useTranslation = () => ({ 
  t: (key: string) => key, 
  currentLang: 'en', 
  changeLanguage: () => {} 
});