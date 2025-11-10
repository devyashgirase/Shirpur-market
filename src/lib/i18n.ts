// Clean multi-language support
export type Language = 'en' | 'hi' | 'mr';

export const translations = {
  en: {
    'app.title': 'Shirpur Market',
    'common.loading': 'Loading',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'delivery.tasks': 'Delivery Tasks',
    'delivery.earnings': 'Earnings',
    'delivery.acceptOrder': 'Accept Order',
    'delivery.reject': 'Reject',
    'delivery.readyForDelivery': 'Ready for Delivery',
    'nav.home': 'Home',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'nav.notifications': 'Notifications'
  },
  hi: {
    'app.title': 'शिरपूर मार्केट',
    'common.loading': 'लोड हो रहा है',
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'delivery.tasks': 'डिलीवरी कार्य',
    'delivery.earnings': 'कमाई',
    'delivery.acceptOrder': 'ऑर्डर स्वीकार करें',
    'delivery.reject': 'अस्वीकार करें',
    'delivery.readyForDelivery': 'डिलीवरी के लिए तैयार',
    'nav.home': 'होम',
    'nav.orders': 'ऑर्डर',
    'nav.profile': 'प्रोफाइल',
    'nav.notifications': 'सूचनाएं'
  },
  mr: {
    'app.title': 'शिरपूर मार्केट',
    'common.loading': 'लोड होत आहे',
    'common.save': 'सेव्ह करा',
    'common.cancel': 'रद्द करा',
    'common.edit': 'संपादित करा',
    'common.delete': 'हटवा',
    'delivery.tasks': 'डिलिव्हरी कार्ये',
    'delivery.earnings': 'कमाई',
    'delivery.acceptOrder': 'ऑर्डर स्वीकारा',
    'delivery.reject': 'नाकारा',
    'delivery.readyForDelivery': 'डिलिव्हरीसाठी तयार',
    'nav.home': 'होम',
    'nav.orders': 'ऑर्डर',
    'nav.profile': 'प्रोफाइल',
    'nav.notifications': 'सूचना'
  }
};

export class LanguageService {
  private static currentLang: Language = 'en';
  
  static getCurrentLanguage(): Language {
    const saved = localStorage.getItem('app_language') as Language;
    return saved || 'en';
  }
  
  static setLanguage(lang: Language): void {
    this.currentLang = lang;
    localStorage.setItem('app_language', lang);
  }
  
  static translate(key: string, lang?: Language): string {
    const currentLang = lang || this.getCurrentLanguage();
    return translations[currentLang]?.[key] || translations.en[key] || key;
  }
}

import React from 'react';

export const useTranslation = () => {
  const [currentLang, setCurrentLang] = React.useState<Language>(LanguageService.getCurrentLanguage());
  
  const t = (key: string) => LanguageService.translate(key, currentLang);
  
  const changeLanguage = (lang: Language) => {
    LanguageService.setLanguage(lang);
    setCurrentLang(lang);
  };
  
  return { t, currentLang, changeLanguage };
};