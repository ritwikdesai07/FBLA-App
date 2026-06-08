import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ColorScheme;
}

interface ColorScheme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  border: string;
  card: string;
  error: string;
}

const lightColors: ColorScheme = {
  background: '#fff',
  surface: '#f5f5f5',
  text: '#000',
  textSecondary: '#666',
  primary: '#003A8F',
  accent: '#F0E15B',
  border: '#ddd',
  card: '#fff',
  error: '#ff0000',
};

const darkColors: ColorScheme = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  primary: '#4A7BC8',
  accent: '#F0E15B',
  border: '#333',
  card: '#1e1e1e',
  error: '#ff6b6b',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme');
      if (savedTheme) setTheme(savedTheme as Theme);
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('@theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};