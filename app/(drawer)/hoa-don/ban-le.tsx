import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
// 1. IMPORT HOOK THEME
import { useTheme } from '@/context/ThemeContext';

export default function RetailInvoicesScreen() {
  const router = useRouter();
  // 2. LẤY MÀU TỪ CONTEXT
  const { colors, isDark } = useTheme();
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    const allInvoices = dataManager.getAllInvoices();
    const retailInvoices = allInvoices.filter(inv => inv.type === 'retail' || !inv.type);
    setInvoices(retailInvoices);
    setFilteredData(retailInvoices);
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(invoices);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = invoices.filter(item => 
        item.code?.toLowerCase().includes(lower) || 
        item.customerName?.toLowerCase().includes(lower)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, invoices]);

  // Hàm lấy màu status thông minh (tự chỉnh màu nền cho đậm hơn khi ở Dark Mode)
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'completed': 
        return { 
          color: '#22c55e', 
          bg: isDark ? '#052e16' : '#f0fdf4', // Nền xanh đậm nếu dark mode
          label: 'Hoàn thành' 
        };
      case 'pending': 
        return { 
          color: '#f97316', 
          bg: isDark ? '#431407' : '#fff7ed', // Nền cam đậm nếu dark mode
          label: 'Chờ xử lý' 
        };
      default: 
        return { 
          color: '#ef4444', 
          bg: isDark ? '#450a0a' : '#fef2f2', // Nền đỏ đậm nếu dark mode
          label: 'Đã hủy' 
        };
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const status = getStatusStyle(item.status);
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity 
          // Card: Dùng màu card và border động
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View>
              {/* Mã code: Dùng màu text động */}
              <Text style={[styles.code, { color: colors.text }]}>#{item.code || item.id.substring(0,8).toUpperCase()}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: status.bg }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#f0f2f5' }]} />
          
          <View style={styles.cardBody}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              {/* Avatar: Đổi nền xanh nhạt thành xám đậm nếu dark mode */}
              <View style={[styles.avatar, { backgroundColor: isDark ? '#333' : '#eff6ff' }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{item.customerName?.charAt(0) || 'K'}</Text>
              </View>
              <View>
                <Text style={styles.label}>Khách hàng</Text>
                {/* Tên khách: Màu text động */}
                <Text style={[styles.value, { color: colors.text }]}>{item.customerName || 'Khách lẻ'}</Text>
              </View>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.label}>Tổng tiền</Text>
              <Text style={[styles.total, { color: colors.primary }]}>{item.total?.toLocaleString()} ₫</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    // Container: Màu nền động
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Hóa đơn bán lẻ</Text>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/pos' as any)}>
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Tạo mới</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Box: Đổi màu nền input khi dark mode */}
        <View style={[styles.searchBox, { backgroundColor: isDark ? '#1f2937' : '#f0f2f5' }]}>
          <MaterialIcons name="search" size={20} color="#617589" />
          <TextInput 
            style={[styles.input, { color: colors.text }]} // Màu chữ input
            placeholder="Tìm theo mã, tên khách..." 
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="receipt" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Chưa có hóa đơn nào</Text>
          </View>
        }
      />
    </View>
  );
}

// Giữ lại layout styles, bỏ các màu cứng (hardcoded colors)
const styles = StyleSheet.create({
  container: { flex: 1 }, // Xóa background cứng
  header: { padding: 16, paddingTop: 50, borderBottomWidth: 1 }, // Xóa màu nền cứng
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', gap: 4 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  searchBox: { flexDirection: 'row', borderRadius: 8, paddingHorizontal: 12, height: 40, alignItems: 'center' },
  input: { flex: 1, marginLeft: 8, fontSize: 14 },
  
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: {width:0, height:1}, shadowOpacity: 0.05, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  code: { fontSize: 16, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#617589', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, marginVertical: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: 'bold' },
  label: { fontSize: 10, color: '#617589' },
  value: { fontSize: 14, fontWeight: '500' },
  total: { fontSize: 16, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 50, gap: 8 },
  emptyText: { color: '#617589' }
});