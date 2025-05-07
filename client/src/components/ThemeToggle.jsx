import { useTheme } from '@/theme/ThemeProvider';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} style={{ marginLeft: 'auto' }}>
      {theme.name === 'light' ? '🌙 暗黑模式' : '☀️ 白天模式'}
    </button>
  );
};
