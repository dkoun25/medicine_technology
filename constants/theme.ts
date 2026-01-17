import { Platform } from 'react-native';

const tintColorLight = '#137fec';
const tintColorDark = '#60a5fa';

export const Colors = {
  light: {
    text: '#111418',
    textSecondary: '#617589',
    background: '#f6f7f8',
    backgroundCard: '#ffffff',
    tint: tintColorLight,
    primary: '#137fec',
    icon: '#687076',
    border: '#dbe0e6',
    borderLight: '#f0f2f4',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    // Badge colors
    green: { bg: '#dcfce7', text: '#166534', ring: '#16a34a' },
    red: { bg: '#fee2e2', text: '#991b1b', ring: '#dc2626' },
    orange: { bg: '#fed7aa', text: '#9a3412', ring: '#ea580c' },
    blue: { bg: '#dbeafe', text: '#1e40af', ring: '#3b82f6' },
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#101922',
    backgroundCard: '#1a2332',
    tint: tintColorDark,
    primary: '#60a5fa',
    icon: '#9BA1A6',
    border: '#2d3748',
    borderLight: '#1e293b',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
    green: { bg: '#065f46', text: '#6ee7b7', ring: '#10b981' },
    red: { bg: '#7f1d1d', text: '#fca5a5', ring: '#ef4444' },
    orange: { bg: '#7c2d12', text: '#fdba74', ring: '#f97316' },
    blue: { bg: '#1e3a8a', text: '#93c5fd', ring: '#3b82f6' },
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'Roboto',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  title: 32,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const Transitions = {
  fast: 150,
  normal: 300,
  slow: 500,
};