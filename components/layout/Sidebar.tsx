import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { usePathname, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

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
};

const menuData: MenuSection[] = [
  {
    title: 'Quản lý thuốc',
    items: [
      { label: 'Danh sách thuốc', icon: '💊', route: '/medicines' },
      { label: 'Nhập thuốc', icon: '📦', route: '/medicines/import' },
      { label: 'Xuất / Bán thuốc', icon: '🛒', route: '/pos' },
      { label: 'Thuốc sắp hết hạn', icon: '⏰', route: '/medicines/expiring', badge: '15', badgeType: 'danger' },
      { label: 'Thuốc sắp hết hàng', icon: '📉', route: '/medicines/low-stock', badge: '8', badgeType: 'warning' },
    ],
  },
  {
    title: 'Hóa đơn - Giao dịch',
    items: [
      { label: 'Hóa đơn bán lẻ', icon: '🧾', route: '/invoices/retail' },
      { label: 'Hóa đơn nhập hàng', icon: '📋', route: '/invoices/purchase' },
      { label: 'Trả hàng - Hoàn tiền', icon: '↩️', route: '/invoices/returns' },
    ],
  },
  {
    title: 'Báo cáo - Thống kê',
    items: [
      { label: 'Doanh thu', icon: '📊', route: '/reports/revenue' },
      { label: 'Tồn kho', icon: '🏭', route: '/reports/inventory' },
      { label: 'Thuốc bán chạy', icon: '📈', route: '/reports/bestsellers' },
    ],
  },
];

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const isActive = (route: string): boolean => {
    if (route === '/' && pathname === '/') return true;
    if (route !== '/' && pathname.startsWith(route)) return true;
    return false;
  };

  const getBadgeColors = (type: string = 'info') => {
    switch (type) {
      case 'success': return colors.green;
      case 'danger': return colors.red;
      case 'warning': return colors.orange;
      default: return colors.blue;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundCard }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Logo Header */}
        <Animated.View entering={FadeIn.duration(500)} style={[styles.header, { backgroundColor: colors.backgroundCard }]}>
          <View style={[styles.logoContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.logoIcon, { color: colors.primary }]}>💊</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Pharmacy Pro</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Quản lý nhà thuốc</Text>
          </View>
        </Animated.View>

        {/* Dashboard Item */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.dashboardItem}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={[
              styles.menuItem,
              isActive('/') && { backgroundColor: `${colors.primary}15` }
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuIcon, isActive('/') && { color: colors.primary }]}>📊</Text>
            <Text style={[
              styles.menuLabel,
              { color: isActive('/') ? colors.primary : colors.text },
              isActive('/') && styles.menuLabelActive
            ]}>Dashboard</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Menu Sections */}
        {menuData.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(200 + sectionIndex * 50).duration(400)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title.toUpperCase()}
            </Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as any)}
                style={[
                  styles.menuItem,
                  isActive(item.route) && { backgroundColor: `${colors.primary}15` }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.menuIcon, isActive(item.route) && { color: colors.primary }]}>
                  {item.icon}
                </Text>
                <Text style={[
                  styles.menuLabel,
                  { color: isActive(item.route) ? colors.primary : colors.text },
                  isActive(item.route) && styles.menuLabelActive
                ]}>{item.label}</Text>
                {item.badge && (
                  <View style={[styles.badge, { backgroundColor: getBadgeColors(item.badgeType).bg }]}>
                    <Text style={[styles.badgeText, { color: getBadgeColors(item.badgeType).text }]}>
                      {item.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        ))}
      </ScrollView>

      {/* User Profile Footer */}
      <Animated.View
        entering={FadeInDown.delay(800).duration(400)}
        style={[styles.footer, { backgroundColor: colors.backgroundCard, borderTopColor: colors.borderLight }]}
      >
        <TouchableOpacity style={[styles.profileContainer, { backgroundColor: `${colors.border}40` }]} activeOpacity={0.7}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>DS</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={[styles.profileName, { color: colors.text }]}>DS. Nguyễn Văn A</Text>
            <Text style={[styles.profileRole, { color: colors.textSecondary }]}>Admin</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={{ color: colors.danger }}>🚪</Text>
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
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: FontSizes.xs,
  },
  dashboardItem: {
    marginBottom: Spacing.md,
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  menuLabelActive: {
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: '#137fec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  profileRole: {
    fontSize: FontSizes.xs,
  },
  logoutButton: {
    padding: Spacing.xs,
  },
});