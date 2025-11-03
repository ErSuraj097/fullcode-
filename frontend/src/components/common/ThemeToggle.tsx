import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle "
      title={`Switch to ${theme === 'dark' ? 'light' : 'light'} theme`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'light'} theme`}
    >
      <div className="theme-toggle-slider ">
        {theme === 'light' ? (
          <Sun className="w-3 h-3 "  />
        ) : (
          <Moon className="w-3 h-3" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;