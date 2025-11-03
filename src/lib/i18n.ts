// Language support system
export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  [key: string]: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common
    'app.title': 'Shirpur Market',
    'common.loading': 'Loading...',
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
    
    // Profile
    'profile.title': 'Profile',
    'profile.language': 'Language',
    'profile.changeLanguage': 'Change Language',
    'profile.english': 'English',
    'profile.hindi': 'हिंदी',
    'profile.marathi': 'मराठी',
    'profile.logout': 'Logout',
    'profile.editProfile': 'Edit Profile',
    
    // Delivery Tasks
    'delivery.tasks': 'Delivery Tasks',
    'delivery.earnings': 'Earnings',
    'delivery.todayEarnings': "Today's Earnings",
    'delivery.completedOrders': 'Completed Orders',
    'delivery.pendingDeliveries': 'Pending Deliveries',
    'delivery.acceptOrder': 'Accept & Start GPS Tracking',
    'delivery.completeDelivery': 'Complete Delivery',
    'delivery.orderDetails': 'Order Details',
    'delivery.customerDetails': 'Customer Details',
    'delivery.earnings.details': 'Earnings Details',
    'delivery.earnings.today': "Today's Summary",
    'delivery.earnings.week': 'This Week',
    'delivery.earnings.month': 'This Month',
    'delivery.performance': 'Performance',
    'delivery.rating': 'Rating',
    'delivery.completionRate': 'Completion Rate',
    'delivery.incentiveBonus': 'Incentive Bonus',
    'delivery.noOrders': 'No orders available',
    'delivery.gettingLocation': 'Getting location...',
    'delivery.yourEarning': 'Your Earning (15%)',
    'delivery.adminApproved': 'Admin Approved',
    'delivery.readyForPickup': 'Ready for Pickup',
    'delivery.readyForDelivery': 'Ready for Delivery',
    'delivery.outForDelivery': 'Out for Delivery',
    'delivery.nearbyOrder': 'Nearby Order',
    'delivery.availableOrders': 'Available Orders (Within 10km)',
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
    'delivery.orderDelivered': 'Order delivered successfully!',
    'delivery.avgPerOrder': 'Avg per Order',
    'delivery.quickStats': 'Quick Stats',
    'delivery.avgDeliveryTime': 'Avg Delivery Time',
    'delivery.customerRating': 'Customer Rating',
    'delivery.weeklyEarnings': 'Weekly Earnings',
    'delivery.systemStatus': 'System Status - Live Data',
    'delivery.currentLocation': 'Current Location',
    'delivery.ordersAvailable': 'Orders Available',
    'delivery.totalOrders': 'Total Orders',
    'delivery.allStatuses': 'All statuses combined',
    'delivery.activeTasks': 'Active Tasks',
    'delivery.dailyIncentive': 'Daily Incentive Tracker',
    'delivery.completeOrders': 'Complete 10 orders to earn ₹250 bonus!',
    'delivery.earnedToday': 'Earned Today',
    'delivery.remaining': 'remaining',
    'delivery.congratulations': 'Congratulations! Daily target achieved!',
    'delivery.fullBonus': "You've earned the full ₹250 incentive bonus!",
    'delivery.noNearbyOrders': 'No nearby orders',
    'delivery.ordersWithinRange': 'Orders within 10km will appear here',
    'delivery.manageDeliveries': 'Manage your deliveries and track earnings',
    
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
    'common.loading': 'लोड हो रहा है...',
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
    
    // Profile
    'profile.title': 'प्रोफाइल',
    'profile.language': 'भाषा',
    'profile.changeLanguage': 'भाषा बदलें',
    'profile.english': 'English',
    'profile.hindi': 'हिंदी',
    'profile.marathi': 'मराठी',
    'profile.logout': 'लॉगआउट',
    'profile.editProfile': 'प्रोफाइल संपादित करें',
    
    // Delivery Tasks
    'delivery.tasks': 'डिलीवरी कार्य',
    'delivery.earnings': 'कमाई',
    'delivery.todayEarnings': 'आज की कमाई',
    'delivery.completedOrders': 'पूर्ण ऑर्डर',
    'delivery.pendingDeliveries': 'लंबित डिलीवरी',
    'delivery.acceptOrder': 'स्वीकार करें और GPS ट्रैकिंग शुरू करें',
    'delivery.completeDelivery': 'डिलीवरी पूर्ण करें',
    'delivery.orderDetails': 'ऑर्डर विवरण',
    'delivery.customerDetails': 'ग्राहक विवरण',
    'delivery.earnings.details': 'कमाई विवरण',
    'delivery.earnings.today': 'आज का सारांश',
    'delivery.earnings.week': 'इस सप्ताह',
    'delivery.earnings.month': 'इस महीने',
    'delivery.performance': 'प्रदर्शन',
    'delivery.rating': 'रेटिंग',
    'delivery.completionRate': 'पूर्णता दर',
    'delivery.incentiveBonus': 'प्रोत्साहन बोनस',
    'delivery.noOrders': 'कोई ऑर्डर उपलब्ध नहीं',
    'delivery.gettingLocation': 'स्थान प्राप्त कर रहे हैं...',
    'delivery.yourEarning': 'आपकी कमाई (15%)',
    'delivery.adminApproved': 'एडमिन द्वारा अनुमोदित',
    'delivery.readyForPickup': 'पिकअप के लिए तैयार',
    'delivery.readyForDelivery': 'डिलीवरी के लिए तैयार',
    'delivery.outForDelivery': 'डिलीवरी के लिए निकला',
    'delivery.nearbyOrder': 'नजदीकी ऑर्डर',
    'delivery.availableOrders': 'उपलब्ध ऑर्डर (10 किमी के भीतर)',
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
    'delivery.orderDelivered': 'ऑर्डर सफलतापूर्वक डिलीवर किया गया!',
    'delivery.avgPerOrder': 'प्रति ऑर्डर औसत',
    'delivery.quickStats': 'त्वरित आंकड़े',
    'delivery.avgDeliveryTime': 'औसत डिलीवरी समय',
    'delivery.customerRating': 'ग्राहक रेटिंग',
    'delivery.weeklyEarnings': 'साप्ताहिक कमाई',
    'delivery.systemStatus': 'सिस्टम स्थिति - लाइव डेटा',
    'delivery.currentLocation': 'वर्तमान स्थान',
    'delivery.ordersAvailable': 'उपलब्ध ऑर्डर',
    'delivery.totalOrders': 'कुल ऑर्डर',
    'delivery.allStatuses': 'सभी स्थितियां संयुक्त',
    'delivery.activeTasks': 'सक्रिय कार्य',
    'delivery.dailyIncentive': 'दैनिक प्रोत्साहन ट्रैकर',
    'delivery.completeOrders': '₹250 बोनस कमाने के लिए 10 ऑर्डर पूरे करें!',
    'delivery.earnedToday': 'आज कमाया',
    'delivery.remaining': 'शेष',
    'delivery.congratulations': 'बधाई हो! दैनिक लक्ष्य प्राप्त!',
    'delivery.fullBonus': 'आपने पूरा ₹250 प्रोत्साहन बोनस कमाया है!',
    'delivery.noNearbyOrders': 'कोई नजदीकी ऑर्डर नहीं',
    'delivery.ordersWithinRange': '10 किमी के भीतर ऑर्डर यहां दिखाई देंगे',
    'delivery.manageDeliveries': 'अपनी डिलीवरी प्रबंधित करें और कमाई ट्रैक करें',
    
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
    'common.loading': 'लोड होत आहे...',
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
    
    // Profile
    'profile.title': 'प्रोफाइल',
    'profile.language': 'भाषा',
    'profile.changeLanguage': 'भाषा बदला',
    'profile.english': 'English',
    'profile.hindi': 'हिंदी',
    'profile.marathi': 'मराठी',
    'profile.logout': 'लॉगआउट',
    'profile.editProfile': 'प्रोफाइल संपादित करा',
    
    // Delivery Tasks
    'delivery.tasks': 'डिलिव्हरी कार्ये',
    'delivery.earnings': 'कमाई',
    'delivery.todayEarnings': 'आजची कमाई',
    'delivery.completedOrders': 'पूर्ण ऑर्डर',
    'delivery.pendingDeliveries': 'प्रलंबित डिलिव्हरी',
    'delivery.acceptOrder': 'स्वीकार करा आणि GPS ट्रॅकिंग सुरू करा',
    'delivery.completeDelivery': 'डिलिव्हरी पूर्ण करा',
    'delivery.orderDetails': 'ऑर्डर तपशील',
    'delivery.customerDetails': 'ग्राहक तपशील',
    'delivery.earnings.details': 'कमाई तपशील',
    'delivery.earnings.today': 'आजचा सारांश',
    'delivery.earnings.week': 'या आठवड्यात',
    'delivery.earnings.month': 'या महिन्यात',
    'delivery.performance': 'कामगिरी',
    'delivery.rating': 'रेटिंग',
    'delivery.completionRate': 'पूर्णता दर',
    'delivery.incentiveBonus': 'प्रोत्साहन बोनस',
    'delivery.noOrders': 'कोणतेही ऑर्डर उपलब्ध नाहीत',
    'delivery.gettingLocation': 'स्थान मिळवत आहे...',
    'delivery.yourEarning': 'तुमची कमाई (15%)',
    'delivery.adminApproved': 'अॅडमिनने मंजूर केले',
    'delivery.readyForPickup': 'पिकअपसाठी तयार',
    'delivery.readyForDelivery': 'डिलिव्हरीसाठी तयार',
    'delivery.outForDelivery': 'डिलिव्हरीसाठी निघाले',
    'delivery.nearbyOrder': 'जवळचे ऑर्डर',
    'delivery.availableOrders': 'उपलब्ध ऑर्डर (10 किमी मध्ये)',
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
    'delivery.orderDelivered': 'ऑर्डर यशस्वीरित्या डिलिव्हर केले!',
    'delivery.avgPerOrder': 'प्रति ऑर्डर सरासरी',
    'delivery.quickStats': 'त्वरित आकडेवारी',
    'delivery.avgDeliveryTime': 'सरासरी डिलिव्हरी वेळ',
    'delivery.customerRating': 'ग्राहक रेटिंग',
    'delivery.weeklyEarnings': 'साप्ताहिक कमाई',
    'delivery.systemStatus': 'सिस्टम स्थिती - लाइव्ह डेटा',
    'delivery.currentLocation': 'सध्याचे स्थान',
    'delivery.ordersAvailable': 'उपलब्ध ऑर्डर',
    'delivery.totalOrders': 'एकूण ऑर्डर',
    'delivery.allStatuses': 'सर्व स्थिती एकत्रित',
    'delivery.activeTasks': 'सक्रिय कार्ये',
    'delivery.dailyIncentive': 'दैनिक प्रोत्साहन ट्रॅकर',
    'delivery.completeOrders': '₹250 बोनस मिळवण्यासाठी 10 ऑर्डर पूर्ण करा!',
    'delivery.earnedToday': 'आज कमावले',
    'delivery.remaining': 'उरलेले',
    'delivery.congratulations': 'अभिनंदन! दैनिक लक्ष्य गाठले!',
    'delivery.fullBonus': 'तुम्ही पूर्ण ₹250 प्रोत्साहन बोनस कमावला आहे!',
    'delivery.noNearbyOrders': 'कोणतेही जवळचे ऑर्डर नाहीत',
    'delivery.ordersWithinRange': '10 किमी मध्ये ऑर्डर येथे दिसतील',
    'delivery.manageDeliveries': 'तुमच्या डिलिव्हरी व्यवस्थापित करा आणि कमाई ट्रॅक करा',
    
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

// Language context and hooks
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

import React from 'react';