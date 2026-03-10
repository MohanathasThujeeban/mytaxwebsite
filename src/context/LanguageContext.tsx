import React, { createContext, useContext, useState } from 'react';
import { Language, getStrings } from '../utils/strings';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  s: Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ENGLISH',
  setLanguage: () => {},
  s: getStrings('ENGLISH'),
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>('ENGLISH');

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, s: getStrings(language) }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
