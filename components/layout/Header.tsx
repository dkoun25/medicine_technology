import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type HeaderProps = {
  title: string;
  showSearch?: boolean;
  onMenuPress?: () => void;
};

export function Header({ title, showSearch = true, onMenuPress }: HeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[styles.container, { backgroundColor: colors.backgroundCard, borderBottomColor: colors.border }]}
    >
      <View style={styles.leftSection}>
        {Platform.OS !== 'web' && onMenuPress && (
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>

      {showSearch && Platform.OS === 'web' && (
        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
            <TextInput
              placeholder="Tìm kiếm thuốc, hóa đơn, khách hàng..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>
      )}

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationBadge} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarButton}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>DS</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    ...Platform.select({
      web: {
        height: 64,
      },
      default: {
        paddingTop: Spacing.lg + 8,
      },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  menuButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  menuIcon: {
    fontSize: 24,
    color: '#617589',
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 2,
    maxWidth: 480,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.sm,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  notificationButton: {
    position: 'relative',
    padding: Spacing.sm,
  },
  notificationIcon: {
    fontSize: 22,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarButton: {
    padding: Spacing.xs,
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
});