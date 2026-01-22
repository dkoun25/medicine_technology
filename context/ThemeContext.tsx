// src/context/ThemeContext.tsx
import { Colors } from '@/constants/Colors';
import { dataManager } from '@/services/DataManager';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load cài đặt từ DataManager khi mở app
    const settings = dataManager.getSettings();
    const storedTheme = settings.theme === 'dark' ? 'dark' : 'light';

    // Nếu đang ở dark, ép về light và lưu lại
    if (storedTheme === 'dark') {
      setTheme('light');
      dataManager.updateSettings({ theme: 'light' });
    } else {
      setTheme('light');
      if (storedTheme !== 'light') {
        dataManager.updateSettings({ theme: 'light' });
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // 1. Cập nhật State để App render lại màu ngay lập tức
    setTheme(newTheme);
    
    // 2. Lưu vào DataManager
    dataManager.updateSettings({ theme: newTheme });
  };

  const value = {
    theme,
    colors: Colors[theme], // Tự động lấy bảng màu tương ứng
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook để dùng nhanh ở các màn hình
export const useTheme = () => useContext(ThemeContext);