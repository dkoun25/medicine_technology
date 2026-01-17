import { CustomDrawerContent } from '@/components/layout/Sidebar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: Platform.select({
            web: 'permanent',
            default: 'slide',
          }),
          drawerStyle: {
            backgroundColor: colors.backgroundCard,
            width: 280,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Dashboard',
            title: 'Dashboard',
          }}
        />
        <Drawer.Screen
          name="explore"
          options={{
            drawerLabel: 'Explore',
            title: 'Explore',
          }}
        />
        <Drawer.Screen
          name="medicines/index"
          options={{
            drawerLabel: 'Danh sách thuốc',
            title: 'Danh sách thuốc',
          }}
        />
        <Drawer.Screen
          name="medicines/add"
          options={{
            drawerLabel: 'Thêm thuốc',
            title: 'Thêm thuốc mới',
          }}
        />
        <Drawer.Screen
          name="medicines/[id]"
          options={{
            drawerLabel: 'Chi tiết thuốc',
            title: 'Chi tiết thuốc',
          }}
        />
        <Drawer.Screen
          name="pos/index"
          options={{
            drawerLabel: 'Bán thuốc POS',
            title: 'Bán thuốc POS',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}