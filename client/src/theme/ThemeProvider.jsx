// 主题提供者
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { themes } from '@/theme/theme';
import { GlobalStyles } from '@/theme/global';

const ThemeContext = createContext();

export const AppThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 从 localStorage 中读取保存的主题
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? JSON.parse(savedTheme) : themes.light;
  });

  useEffect(() => {
    // 保存主题到 localStorage
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme.name === 'light' ? themes.dark : themes.light);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <StyledThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
