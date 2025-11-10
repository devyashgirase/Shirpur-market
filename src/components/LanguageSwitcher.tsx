import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { setLanguage, getLanguage } from '@/lib/i18n';

const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = useState(getLanguage());

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🚩' }
  ];

  const handleLanguageChange = (langCode: 'en' | 'hi' | 'mr') => {
    setLanguage(langCode);
    setCurrentLang(langCode);
    window.location.reload(); // Simple reload to apply changes
  };

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={currentLang === lang.code ? "default" : "outline"}
          size="sm"
          className={`text-xs px-2 py-1 ${
            currentLang === lang.code 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
          }`}
          onClick={() => handleLanguageChange(lang.code as 'en' | 'hi' | 'mr')}
        >
          {lang.flag} {lang.name}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;