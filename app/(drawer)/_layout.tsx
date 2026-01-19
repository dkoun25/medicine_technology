import { CustomDrawerContent } from '@/components/layout/Sidebar';
import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions } from 'react-native';

export default function DrawerLayout() {
  const { width } = useWindowDimensions();
  // Nếu chiều rộng > 768px (Tablet/Web) thì coi là màn hình lớn
  const isLargeScreen = width >= 768; 

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Vẫn ẩn header mặc định của Drawer
        
        // --- CẤU HÌNH QUAN TRỌNG CHO WEB ---
        // 'permanent': Luôn hiện (cho Web)
        // 'front': Trượt ra từ bên trái (cho Mobile)
        drawerType: isLargeScreen ? 'permanent' : 'front',
        
        // Chỉnh style cho drawer
        drawerStyle: {
           width: 280,
           backgroundColor: 'transparent', // Để sidebar không bị màu nền mặc định đè lên
           borderRightWidth: isLargeScreen ? 0 : 1, // Web thì không cần đường viền ngăn cách quá rõ
        },
        
        // Trên web (permanent) thì không cần lớp phủ mờ tối màu nền
        overlayColor: isLargeScreen ? 'transparent' : 'rgba(0,0,0,0.5)',
      }}
    >
      {/* Các màn hình sẽ tự động được load dựa trên file trong thư mục */}
    </Drawer>
  );
}