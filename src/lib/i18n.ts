// Minimal i18n without problematic characters
export type Language = 'en' | 'hi' | 'mr';

export const translations = {
  en: {
    'app.title': 'Shirpur Market',
    'common.loading': 'Loading',
    'delivery.acceptOrder': 'Accept Order',
    'delivery.reject': 'Reject',
    'delivery.readyForDelivery': 'Ready for Delivery'
  },
  hi: {
    'app.title': 'शिरपूर मार्केट',
    'common.loading': 'लोड हो रहा है',
    'delivery.acceptOrder': 'ऑर्डर स्वीकार करें',
    'delivery.reject': 'अस्वीकार करें',
    'delivery.readyForDelivery': 'डिलीवरी के लिए तैयार'
  },
  mr: {
    'app.title': 'शिरपूर मार्केट',
    'common.loading': 'लोड होत आहे',
    'delivery.acceptOrder': 'ऑर्डर स्वीकारा',
    'delivery.reject': 'नाकारा',
    'delivery.readyForDelivery': 'डिलिव्हरीसाठी तयार'
  }
};

export class LanguageService {
  static getCurrentLanguage(): Language {
    return 'en';
  }
  
  static translate(key: string): string {
    return translations.en[key] || key;
  }
}

import React from 'react';

export const useTranslation = () => {
  const t = (key: string) => LanguageService.translate(key);
  return { t, currentLang: 'en', changeLanguage: () => {} };
};