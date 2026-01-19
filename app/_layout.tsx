import { ThemeProvider } from '@/context/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/context/ThemeContext';

// Tạo một component con để lấy màu từ Theme (để chỉnh StatusBar)
function AppNavigator() {
  const { isDark } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Màn hình Dashboard (file app/index.tsx) */}
        <Stack.Screen name="index" /> 
        
        {/* Màn hình Settings (file app/settings.tsx) */}
        <Stack.Screen name="settings" />

        {/* Các màn hình khác (ví dụ medicines) */}
        {/* <Stack.Screen name="medicines" /> */}
      </Stack>
      
      {/* StatusBar đổi màu chữ: Trắng nếu nền tối, Đen nếu nền sáng */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    // BỌC THEME PROVIDER Ở NGOÀI CÙNG
    <ThemeProvider>
       <AppNavigator />
    </ThemeProvider>
  );
}