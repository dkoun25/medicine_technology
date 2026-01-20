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
        {/* Modal screens */}
        <Stack.Screen name="modal" />
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