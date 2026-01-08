import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const swissCities = [
  { id: 1, name: 'Zürich', country: 'Switzerland' },
  { id: 2, name: 'Bern', country: 'Switzerland' },
  { id: 3, name: 'Basel', country: 'Switzerland' },
  { id: 4, name: 'Geneva', country: 'Switzerland'},
  { id: 5, name: 'Lausanne', country: 'Switzerland' },
  { id: 6, name: 'Luzern', country: 'Switzerland' },
];

export const AppProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(swissCities[0]);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [isLandscape, setIsLandscape] = useState(false); // Wird nun manuell geändert

  useEffect(() => {
    loadPreferences();
  }, []);

  const toggleOrientation = () => {
    setIsLandscape(prev => !prev);
  };

  const loadPreferences = async () => {
    try {
      const savedCity = await AsyncStorage.getItem('selectedCity');
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedLanguage = await AsyncStorage.getItem('language');

      if (savedCity) setSelectedCity(JSON.parse(savedCity));
      if (savedTheme) setTheme(savedTheme);
      if (savedLanguage) setLanguage(savedLanguage);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updateSelectedCity = async (city) => {
    setSelectedCity(city);
    try {
      await AsyncStorage.setItem('selectedCity', JSON.stringify(city));
    } catch (error) {
      console.error('Error saving city:', error);
    }
  };

  const updateTheme = async (newTheme) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const updateLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value = {
    selectedCity,
    setSelectedCity: updateSelectedCity,
    theme,
    setTheme: updateTheme,
    language,
    setLanguage: updateLanguage,
    swissCities,
    isLandscape,
    toggleOrientation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
