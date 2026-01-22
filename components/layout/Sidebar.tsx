import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dataManager } from '@/services/DataManager';
import { useAuthStore } from '@/store/authStore';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
type MenuItem = {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  badgeType?: 'success' | 'danger' | 'warning' | 'info';
};

type MenuSection = {
  title: string;
  items: MenuItem[];
  defaultOpen?: boolean;
};

// --- CẤU HÌNH MENU & ĐƯỜNG DẪN ---
// Lưu ý: Bạn cần tạo các file tương ứng trong thư mục app/(drawer)/... 
// Ví dụ: app/(drawer)/medicines/index.tsx
const getMenuData = (expiringCount: number, lowStockCount: number): MenuSection[] => [
  {
    title: 'Quản lý thuốc',
    defaultOpen: true,
    items: [
      { label: 'Danh sách thuốc', icon: '💊', route: '/medicines' },
      { label: 'Nhập thuốc', icon: '📦', route: '/medicines/import' },
      { label: 'Xuất / Bán thuốc (POS)', icon: '🛒', route: '/pos' },
      { label: 'Thuốc sắp hết hạn', icon: '⏰', route: '/medicines/expiring', badge: expiringCount > 0 ? String(expiringCount) : undefined, badgeType: 'danger' },
      { label: 'Thuốc sắp hết hàng', icon: '📉', route: '/medicines/low-stock', badge: lowStockCount > 0 ? String(lowStockCount) : undefined, badgeType: 'warning' },
    ],
  },
  {
    title: 'Hóa đơn - Giao dịch',
    defaultOpen: true,
    items: [
      // Lưu ý: Đảm bảo tên thư mục là "invoices" hoặc đổi route bên dưới thành "/hoa-don/..."
      { label: 'Hóa đơn bán lẻ', icon: '🧾', route: '/hoa-don/ban-le' },
      { label: 'Hóa đơn nhập hàng', icon: '📋', route: '/hoa-don/nhap-hang' },
      { label: 'Trả hàng - Hoàn tiền', icon: '↩️', route: '/hoa-don/tra-hang' },
    ],
  },
  {
    title: 'Đối tác',
    items: [
      { label: 'Nhà cung cấp', icon: '🚚', route: '/partners/suppliers' },
      { label: 'Khách hàng', icon: '👥', route: '/partners/customers' },
    ],
  },  
  {
    title: 'Báo cáo - Thống kê',
    items: [
      { label: 'Tổng quan (Dashboard)', icon: '📊', route: '/' }, // Route '/' thường là dashboard chính
      { label: 'Doanh thu', icon: '💰', route: '/reports/revenue' },
      { label: 'Tồn kho', icon: '🏭', route: '/reports/inventory' },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { label: 'Nhân viên', icon: '👤', route: '/system/employees' },
      { label: 'Cài đặt', icon: '⚙️', route: '/system/settings' },
    ],
  },
];

// --- COMPONENT CON: NHÓM MENU CÓ THỂ ĐÓNG/MỞ ---
function CollapsibleSection({ 
  section, 
  sectionIndex,
  isActive,
  getBadgeColors,
  onNavigate,
  colors,
}: { 
  section: MenuSection;
  sectionIndex: number;
  isActive: (route: string) => boolean;
  getBadgeColors: (type?: string) => any;
  onNavigate: (route: string) => void;
  colors: any;
}) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false);
  
  const rotation = useSharedValue(section.defaultOpen ? 90 : 0);
  const height = useSharedValue(section.defaultOpen ? 1 : 0);

  const toggleSection = () => {
    setIsOpen(!isOpen);
    rotation.value = withTiming(isOpen ? 0 : 90, { duration: 200 });
    height.value = withTiming(isOpen ? 0 : 1, { duration: 200 });
  };

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    // Ước lượng chiều cao tối đa để animation hoạt động
    maxHeight: interpolate(height.value, [0, 1], [0, 500]), 
    opacity: height.value,
    overflow: 'hidden',
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + sectionIndex * 50).duration(400)}
      style={styles.section}
    >
      <TouchableOpacity
        style={[styles.sectionHeader, { backgroundColor: `${colors.border}30` }]}
        onPress={toggleSection}
        activeOpacity={0.7}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {section.title.toUpperCase()}
        </Text>
        <Animated.Text style={[styles.sectionArrow, { color: colors.textSecondary }, arrowStyle]}>
          ›
        </Animated.Text>
      </TouchableOpacity>

      <Animated.View style={contentStyle}>
        {section.items.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => onNavigate(item.route)}
              style={[
                styles.menuItem,
                active && { backgroundColor: `${colors.primary}15`, borderRightWidth: 3, borderRightColor: colors.primary }
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuIcon, active && { color: colors.primary }]}>
                {item.icon}
              </Text>
              <Text style={[
                styles.menuLabel,
                { color: active ? colors.primary : colors.text },
                active && styles.menuLabelActive
              ]}>{item.label}</Text>
              
              {item.badge && (
                <View style={[styles.badge, { backgroundColor: getBadgeColors(item.badgeType).bg }]}>
                  <Text style={[styles.badgeText, { color: getBadgeColors(item.badgeType).text }]}>
                    {item.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}

// --- COMPONENT CHÍNH: SIDEBAR ---
export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme() ?? 'light';
  const { user, logout } = useAuthStore();
  
  const [expiringCount, setExpiringCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Load số lượng thuốc sắp hết hạn và hết hàng
  useEffect(() => {
    const expiring = dataManager.getExpiringMedicines(30); // 30 ngày
    const lowStock = dataManager.getLowStockMedicines();
    setExpiringCount(expiring.length);
    setLowStockCount(lowStock.length);
  }, []);

  const menuData = getMenuData(expiringCount, lowStockCount);
  
  // Fallback màu sắc nếu theme chưa load kịp
  const colors = Colors[colorScheme] || {
    primary: '#137fec',
    backgroundCard: '#ffffff',
    text: '#111418',
    textSecondary: '#617589',
    border: '#dbe0e6',
    green: '#22c55e',
    red: '#ef4444',
    orange: '#f97316',
    blue: '#3b82f6',
    borderLight: '#e5e7eb',
  };

  // Logic kiểm tra Active
  const isActive = (route: string): boolean => {
    if (route === '/' && pathname === '/') return true;
    if (route !== '/' && pathname.startsWith(route)) return true;
    return false;
  };

  // Xử lý điều hướng thông minh
  const handleNavigation = (route: string) => {
    // Nếu đang ở đúng trang đó rồi thì chỉ đóng drawer
    if (pathname === route) {
      props.navigation.closeDrawer();
      return;
    }
    
    // Điều hướng (dùng router.push để support deep link tốt hơn trong Expo Router)
    // Dùng 'as any' để bypass check type tĩnh nếu chưa khai báo đủ route
    router.push(route as any); 
  };

  const handleProfileClick = () => {
    router.push('/system/settings' as any);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const getBadgeColors = (type: string = 'info') => {
    switch (type) {
      case 'success': return { bg: `${colors.green}20`, text: colors.green };
      case 'danger': return { bg: `${colors.red}20`, text: colors.red };
      case 'warning': return { bg: `${colors.orange}20`, text: colors.orange };
      default: return { bg: `${colors.blue}20`, text: colors.blue };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundCard }}>
      {/* Header Logo */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Text style={styles.logoIcon}>💊</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Pharmacy Pro</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Quản lý nhà thuốc</Text>
        </View>
      </Animated.View>

      {/* Danh sách Menu */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {menuData.map((section, sectionIndex) => (
          <CollapsibleSection
            key={section.title}
            section={section}
            sectionIndex={sectionIndex}
            isActive={isActive}
            getBadgeColors={getBadgeColors}
            onNavigate={handleNavigation}
            colors={colors}
          />
        ))}
      </DrawerContentScrollView>

      {/* Footer User Profile */}
      <Animated.View
        entering={FadeInDown.delay(800).duration(400)}
        style={[styles.footer, { borderTopColor: colors.borderLight }]}
      >
        <TouchableOpacity 
          style={[styles.profileContainer, { backgroundColor: `${colors.border}20` }]} 
          activeOpacity={0.7}
          onPress={handleProfileClick}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </Text>
          </View>
          <View style={styles.profileText}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user?.name || 'Admin User'}
            </Text>
            <Text style={[styles.profileRole, { color: colors.textSecondary }]}>
              {user?.role === 'admin' ? 'Quản lý cấp cao' : user?.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
          >
             <Text style={{ fontSize: 18 }}>🚪</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md, // Nếu lỗi Spacing, thay bằng số (vd: 16)
    paddingTop: 50, // Safe Area top
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12, // BorderRadius.lg
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 24 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' }, // FontSizes.md
  headerSubtitle: { fontSize: 13 }, // FontSizes.xs
  
  section: { marginTop: 12 }, // Spacing.sm
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // Spacing.md
    paddingVertical: 10, // Spacing.sm
    marginHorizontal: 8, // Spacing.xs
    borderRadius: 8, // BorderRadius.md
  },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  sectionArrow: { fontSize: 18, fontWeight: 'bold' },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  menuLabelActive: { fontWeight: '700' },
  
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  
  footer: { padding: 16, borderTopWidth: 1 },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  profileText: { flex: 1 },
  profileName: { fontSize: 14, fontWeight: 'bold' },
  profileRole: { fontSize: 12 },
  logoutButton: { padding: 4 },
});