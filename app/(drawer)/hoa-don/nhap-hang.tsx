import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Dữ liệu giả lập
const MOCK_IMPORTS = [
  { id: 'PN00123', supplier: 'Công ty Dược phẩm TW1', date: '2024-05-20T10:30:00Z', total: 15500000, status: 'completed' },
  { id: 'PN00124', supplier: 'Dược Hậu Giang', date: '2024-05-19T09:15:00Z', total: 8200000, status: 'completed' },
  { id: 'PN00125', supplier: 'Sanofi Việt Nam', date: '2024-05-18T14:20:00Z', total: 24000000, status: 'pending' },
];

export default function PurchaseInvoicesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [imports, setImports] = useState(MOCK_IMPORTS);
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // Xử lý màu trạng thái (Status)
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'completed': 
        return { 
          color: '#22c55e', 
          bg: isDark ? '#052e16' : '#f0fdf4', // Nền xanh đậm khi Dark Mode
          label: 'Đã nhập kho' 
        };
      case 'pending': 
        return { 
          color: '#f97316', 
          bg: isDark ? '#431407' : '#fff7ed', // Nền cam đậm khi Dark Mode
          label: 'Chờ hàng về' 
        };
      default: 
        return { 
          color: '#617589', 
          bg: isDark ? '#333' : '#f0f2f5', 
          label: status 
        };
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const status = getStatusStyle(item.status);
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity 
          // Card đổi màu theo theme
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              {/* Icon Box: Giữ màu Tím nhưng chỉnh nền tối đi khi Dark Mode */}
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#2e1065' : '#f3e8ff' }]}>
                <MaterialIcons name="inventory" size={20} color="#8b5cf6" />
              </View>
              <View>
                {/* Text đổi màu */}
                <Text style={[styles.code, { color: colors.text }]}>{item.id}</Text>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString('vi-VN')}</Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: status.bg }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#f0f2f5' }]} />
          
          <View style={styles.cardBody}>
            <View>
              <Text style={styles.label}>Nhà cung cấp</Text>
              <Text style={[styles.value, { color: colors.text }]}>{item.supplier}</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.label}>Giá trị nhập</Text>
              <Text style={[styles.total, { color: colors.text }]}>{item.total.toLocaleString()} ₫</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    // Container đổi màu nền
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header đổi màu */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity onPress={openDrawer} style={{padding: 4}}>
                <MaterialIcons name="menu" size={28} color={colors.text} />
              </TouchableOpacity>
            )}
            <Text style={[styles.title, { color: colors.text }]}>Hóa đơn nhập hàng</Text>
          </View>
          
          {/* Nút Nhập Hàng: Giữ màu Tím (Purple) đặc trưng */}
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: '#8b5cf6' }]} 
            onPress={() => router.push('/medicines/import' as any)}
          >
            <MaterialIcons name="add" size={20} color="#ffffff" />
            <Text style={styles.addBtnText}>Nhập hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Ô tìm kiếm đổi màu */}
        <View style={[styles.searchBox, { backgroundColor: isDark ? '#1f2937' : '#f0f2f5' }]}>
          <MaterialIcons name="search" size={20} color="#617589" />
          <TextInput 
            style={[styles.input, { color: colors.text }]} 
            placeholder="Tìm phiếu nhập, nhà cung cấp..." 
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <FlatList
        data={imports}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, // Xóa bg cứng
  header: { padding: 16, paddingTop: 50, borderBottomWidth: 1 }, // Xóa màu nền cứng
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', gap: 4 },
  addBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  searchBox: { flexDirection: 'row', borderRadius: 8, paddingHorizontal: 12, height: 40, alignItems: 'center' },
  input: { flex: 1, marginLeft: 8, fontSize: 14 },
  
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#dbe0e6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  code: { fontSize: 16, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#617589' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, marginVertical: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 10, color: '#617589' },
  value: { fontSize: 14, fontWeight: '500' },
  total: { fontSize: 16, fontWeight: 'bold' },
});