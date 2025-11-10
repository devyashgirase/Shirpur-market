// Clean Language support system without problematic characters
export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  [key: string]: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common
    'app.title': 'Shirpur Market',
    'common.loading': 'Loading',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.refresh': 'Refresh',
    'common.logout': 'Logout',
    'common.support': 'Support',
    'common.orders': 'orders',
    'common.order': 'Order',
    'common.total': 'Total',
    'common.status': 'Status',
    'common.distance': 'Distance',
    'common.location': 'Location',
    'common.phone': 'Phone',
    'common.address': 'Address',
    'common.name': 'Name',
    'common.items': 'Items',
    'common.customer': 'Customer',
    'common.details': 'Details',
    'common.contact': 'Contact',
    'common.whatsapp': 'WhatsApp',
    'common.deliverTo': 'Deliver To',
    'common.orderID': 'Order ID',
    'common.km': 'km',
    'common.min': 'min',
    
    // Delivery Tasks
    'delivery.tasks': 'Delivery Tasks',
    'delivery.earnings': 'Earnings',
    'delivery.todayEarnings': 'Today Earnings',
    'delivery.completedOrders': 'Completed Orders',
    'delivery.pendingDeliveries': 'Pending Deliveries',
    'delivery.acceptOrder': 'Accept Order',
    'delivery.completeDelivery': 'Complete Delivery',
    'delivery.orderDetails': 'Order Details',
    'delivery.customerDetails': 'Customer Details',
    'delivery.noOrders': 'No orders available',
    'delivery.gettingLocation': 'Getting location',
    'delivery.yourEarning': 'Your Earning 15%',
    'delivery.adminApproved': 'Admin Approved',
    'delivery.readyForPickup': 'Ready for Pickup',
    'delivery.readyForDelivery': 'Ready for Delivery',
    'delivery.outForDelivery': 'Out for Delivery',
    'delivery.nearbyOrder': 'Nearby Order',
    'delivery.availableOrders': 'Available Orders Within 10km',
    'delivery.allTasks': 'All Available Tasks',
    'delivery.noTasksAvailable': 'No tasks available',
    'delivery.newTasksWillAppear': 'New delivery tasks will appear here when available',
    'delivery.orderValue': 'Order Value',
    'delivery.estimatedTime': 'ETA',
    'delivery.minutes': 'minutes',
    'delivery.fromGPS': 'From your GPS location',
    'delivery.moreItems': 'more items',
    'delivery.acceptDelivery': 'Accept Delivery',
    'delivery.startRoute': 'Start Route',
    'delivery.markDelivered': 'Mark Delivered',
    'delivery.orderDelivered': 'Order delivered successfully',
    'delivery.realTimeNotifications': 'Real-time notifications enabled',
    'delivery.notifiedInstantly': 'You will be notified instantly when new orders are available in your area',
    'delivery.reject': 'Reject',
    'delivery.loadingOrders': 'Loading Orders',
    'delivery.checkingOutForDelivery': 'Checking for orders marked as out for delivery',
    'delivery.checkingNewRequests': 'Checking for new delivery requests',
    
    // Orders
    'order.status.confirmed': 'Confirmed',
    'order.status.preparing': 'Preparing',
    'order.status.ready': 'Ready for Delivery',
    'order.status.outForDelivery': 'Out for Delivery',
    'order.status.delivered': 'Delivered',
    
    // Navigation
    'nav.home': 'Home',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'nav.notifications': 'Notifications',
    'nav.support': 'Support',
  },
  
  hi: {
    // Common
    'app.title': 'शिरपूर मार्केट',
    'common.loading': 'लोड हो रहा है',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'common.save': 'सेव करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.submit': 'जमा करें',
    'common.close': 'बंद करें',
    'common.refresh': 'रिफ्रेश',
    'common.logout': 'लॉगआउट',
    'common.support': 'सहायता',
    'common.orders': 'ऑर्डर',
    'common.order': 'ऑर्डर',
    'common.total': 'कुल',
    'common.status': 'स्थिति',
    'common.distance': 'दूरी',
    'common.location': 'स्थान',
    'common.phone': 'फोन',
    'common.address': 'पता',
    'common.name': 'नाम',
    'common.items': 'आइटम',
    'common.customer': 'ग्राहक',
    'common.details': 'विवरण',
    'common.contact': 'संपर्क',
    'common.whatsapp': 'व्हाट्सऐप',
    'common.deliverTo': 'डिलीवर करें',
    'common.orderID': 'ऑर्डर आईडी',
    'common.km': 'किमी',
    'common.min': 'मिनट',
    
    // Delivery Tasks
    'delivery.tasks': 'डिलीवरी कार्य',
    'delivery.earnings': 'कमाई',
    'delivery.todayEarnings': 'आज की कमाई',
    'delivery.completedOrders': 'पूर्ण ऑर्डर',
    'delivery.pendingDeliveries': 'लंबित डिलीवरी',
    'delivery.acceptOrder': 'ऑर्डर स्वीकार करें',
    'delivery.completeDelivery': 'डिलीवरी पूर्ण करें',
    'delivery.orderDetails': 'ऑर्डर विवरण',
    'delivery.customerDetails': 'ग्राहक विवरण',
    'delivery.noOrders': 'कोई ऑर्डर उपलब्ध नहीं',
    'delivery.gettingLocation': 'स्थान प्राप्त कर रहे हैं',
    'delivery.yourEarning': 'आपकी कमाई 15%',
    'delivery.adminApproved': 'एडमिन द्वारा अनुमोदित',
    'delivery.readyForPickup': 'पिकअप के लिए तैयार',
    'delivery.readyForDelivery': 'डिलीवरी के लिए तैयार',
    'delivery.outForDelivery': 'डिलीवरी के लिए निकला',
    'delivery.nearbyOrder': 'नजदीकी ऑर्डर',
    'delivery.availableOrders': 'उपलब्ध ऑर्डर 10 किमी के भीतर',
    'delivery.allTasks': 'सभी उपलब्ध कार्य',
    'delivery.noTasksAvailable': 'कोई कार्य उपलब्ध नहीं',
    'delivery.newTasksWillAppear': 'उपलब्ध होने पर नए डिलीवरी कार्य यहां दिखाई देंगे',
    'delivery.orderValue': 'ऑर्डर मूल्य',
    'delivery.estimatedTime': 'अनुमानित समय',
    'delivery.minutes': 'मिनट',
    'delivery.fromGPS': 'आपके GPS स्थान से',
    'delivery.moreItems': 'और आइटम',
    'delivery.acceptDelivery': 'डिलीवरी स्वीकार करें',
    'delivery.startRoute': 'रूट शुरू करें',
    'delivery.markDelivered': 'डिलीवर के रूप में चिह्नित करें',
    'delivery.orderDelivered': 'ऑर्डर सफलतापूर्वक डिलीवर किया गया',
    'delivery.realTimeNotifications': 'रियल-टाइम सूचनाएं सक्षम',
    'delivery.notifiedInstantly': 'जब आपके क्षेत्र में नए ऑर्डर उपलब्ध होंगे तो आपको तुरंत सूचित किया जाएगा',
    'delivery.reject': 'अस्वीकार करें',
    'delivery.loadingOrders': 'ऑर्डर लोड हो रहे हैं',
    'delivery.checkingOutForDelivery': 'डिलीवरी के लिए निकले ऑर्डर की जांच की जा रही है',
    'delivery.checkingNewRequests': 'नई डिलीवरी अनुरोधों की जांच की जा रही है',
    
    // Orders
    'order.status.confirmed': 'पुष्ट',
    'order.status.preparing': 'तैयार हो रहा है',
    'order.status.ready': 'डिलीवरी के लिए तैयार',
    'order.status.outForDelivery': 'डिलीवरी के लिए निकला',
    'order.status.delivered': 'डिलीवर किया गया',
    
    // Navigation
    'nav.home': 'होम',
    'nav.orders': 'ऑर्डर',
    'nav.profile': 'प्रोफाइल',
    'nav.notifications': 'सूचनाएं',
    'nav.support': 'सहायता',
  },
  
  mr: {
    // Common
    'app.title': 'शिरपूर मार्केट',
    'common.loading': 'लोड होत आहे',
    'common.error': 'त्रुटी',
    'common.success': 'यश',
    'common.cancel': 'रद्द करा',
    'common.confirm': 'पुष्टी करा',
    'common.save': 'सेव्ह करा',
    'common.edit': 'संपादित करा',
    'common.delete': 'हटवा',
    'common.back': 'परत',
    'common.next': 'पुढे',
    'common.submit': 'सबमिट करा',
    'common.close': 'बंद करा',
    'common.refresh': 'रिफ्रेश',
    'common.logout': 'लॉगआउट',
    'common.support': 'सहाय्य',
    'common.orders': 'ऑर्डर',
    'common.order': 'ऑर्डर',
    'common.total': 'एकूण',
    'common.status': 'स्थिती',
    'common.distance': 'अंतर',
    'common.location': 'स्थान',
    'common.phone': 'फोन',
    'common.address': 'पत्ता',
    'common.name': 'नाव',
    'common.items': 'वस्तू',
    'common.customer': 'ग्राहक',
    'common.details': 'तपशील',
    'common.contact': 'संपर्क',
    'common.whatsapp': 'व्हाट्सऐप',
    'common.deliverTo': 'डिलिव्हर करा',
    'common.orderID': 'ऑर्डर आयडी',
    'common.km': 'किमी',
    'common.min': 'मिनिट',
    
    // Delivery Tasks
    'delivery.tasks': 'डिलिव्हरी कार्ये',
    'delivery.earnings': 'कमाई',
    'delivery.todayEarnings': 'आजची कमाई',
    'delivery.completedOrders': 'पूर्ण ऑर्डर',
    'delivery.pendingDeliveries': 'प्रलंबित डिलिव्हरी',
    'delivery.acceptOrder': 'ऑर्डर स्वीकारा',
    'delivery.completeDelivery': 'डिलिव्हरी पूर्ण करा',
    'delivery.orderDetails': 'ऑर्डर तपशील',
    'delivery.customerDetails': 'ग्राहक तपशील',
    'delivery.noOrders': 'कोणतेही ऑर्डर उपलब्ध नाहीत',
    'delivery.gettingLocation': 'स्थान मिळवत आहे',
    'delivery.yourEarning': 'तुमची कमाई 15%',
    'delivery.adminApproved': 'अॅडमिनने मंजूर केले',
    'delivery.readyForPickup': 'पिकअपसाठी तयार',
    'delivery.readyForDelivery': 'डिलिव्हरीसाठी तयार',
    'delivery.outForDelivery': 'डिलिव्हरीसाठी निघाले',
    'delivery.nearbyOrder': 'जवळचे ऑर्डर',
    'delivery.availableOrders': 'उपलब्ध ऑर्डर 10 किमी मध्ये',
    'delivery.allTasks': 'सर्व उपलब्ध कार्ये',
    'delivery.noTasksAvailable': 'कोणतीही कार्ये उपलब्ध नाहीत',
    'delivery.newTasksWillAppear': 'उपलब्ध झाल्यावर नवीन डिलिव्हरी कार्ये येथे दिसतील',
    'delivery.orderValue': 'ऑर्डर मूल्य',
    'delivery.estimatedTime': 'अंदाजित वेळ',
    'delivery.minutes': 'मिनिटे',
    'delivery.fromGPS': 'तुमच्या GPS स्थानावरून',
    'delivery.moreItems': 'अधिक वस्तू',
    'delivery.acceptDelivery': 'डिलिव्हरी स्वीकारा',
    'delivery.startRoute': 'रूट सुरू करा',
    'delivery.markDelivered': 'डिलिव्हर म्हणून चिन्हांकित करा',
    'delivery.orderDelivered': 'ऑर्डर यशस्वीरित्या डिलिव्हर केले',
    'delivery.realTimeNotifications': 'रिअल-टाइम सूचना सक्षम',
    'delivery.notifiedInstantly': 'तुमच्या क्षेत्रात नवीन ऑर्डर उपलब्ध झाल्यावर तुम्हाला तात्काळ सूचित केले जाईल',
    'delivery.reject': 'नाकारा',
    'delivery.loadingOrders': 'ऑर्डर लोड होत आहेत',
    'delivery.checkingOutForDelivery': 'डिलिव्हरीसाठी निघालेले ऑर्डर तपासत आहे',
    'delivery.checkingNewRequests': 'नवीन डिलिव्हरी विनंत्या तपासत आहे',
    
    // Orders
    'order.status.confirmed': 'पुष्ट',
    'order.status.preparing': 'तयार होत आहे',
    'order.status.ready': 'डिलिव्हरीसाठी तयार',
    'order.status.outForDelivery': 'डिलिव्हरीसाठी निघाले',
    'order.status.delivered': 'डिलिव्हर केले',
    
    // Navigation
    'nav.home': 'होम',
    'nav.orders': 'ऑर्डर',
    'nav.profile': 'प्रोफाइल',
    'nav.notifications': 'सूचना',
    'nav.support': 'सहाय्य',
  }
};

// Language service
export class LanguageService {
  private static currentLanguage: Language = 'en';
  private static listeners: Array<(lang: Language) => void> = [];

  static getCurrentLanguage(): Language {
    const saved = localStorage.getItem('app_language') as Language;
    return saved || 'en';
  }

  static setLanguage(lang: Language): void {
    this.currentLanguage = lang;
    localStorage.setItem('app_language', lang);
    this.listeners.forEach(listener => listener(lang));
  }

  static subscribe(listener: (lang: Language) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static translate(key: string, lang?: Language): string {
    const currentLang = lang || this.getCurrentLanguage();
    return translations[currentLang]?.[key] || translations.en[key] || key;
  }
}

import React from 'react';

// Hook for components
export const useTranslation = () => {
  const [currentLang, setCurrentLang] = React.useState<Language>(LanguageService.getCurrentLanguage());

  React.useEffect(() => {
    const unsubscribe = LanguageService.subscribe(setCurrentLang);
    return unsubscribe;
  }, []);

  const t = (key: string) => LanguageService.translate(key, currentLang);
  const changeLanguage = (lang: Language) => LanguageService.setLanguage(lang);

  return { t, currentLang, changeLanguage };
};