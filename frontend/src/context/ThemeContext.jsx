import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'sunset';
  });

  useEffect(() => {
    // Set theme attribute on HTML root tag
    if (theme === 'sunset') {
      document.documentElement.removeAttribute('theme');
    } else {
      document.documentElement.setAttribute('theme', theme);
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    if (['sunset', 'forest', 'velvet'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
