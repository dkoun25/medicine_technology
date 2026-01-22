import { ThemeProvider } from '@/context/ThemeContext';
import { dataManager } from '@/services/DataManager';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

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

function RootLayoutContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await dataManager.initialize();
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function RootLayout() {
  return (
    // BỌC THEME PROVIDER Ở NGOÀI CÙNG
    <ThemeProvider>
       <RootLayoutContent />
    </ThemeProvider>
  );
}