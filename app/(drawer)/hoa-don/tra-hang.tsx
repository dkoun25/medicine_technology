import { useTheme } from '@/context/ThemeContext';
import { useInvoices } from '@/hooks/useInvoices';
import { Invoice } from '@/types/invoice';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ReturnsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { invoices } = useInvoices();
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const [returns, setReturns] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc hóa đơn trả hàng
  useEffect(() => {
    const returnInvoices = invoices.filter(inv => inv.type === 'return');
    setReturns(returnInvoices);
  }, [invoices]);

  // Lọc theo tìm kiếm
  const filteredReturns = returns.filter(item =>
    !searchQuery ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item, index }: { item: Invoice, index: number }) => {
    // Lấy lý do từ notes
    const reason = item.notes || 'Không ghi chú';
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert(
              `Phiếu trả ${item.code}`,
              `Khách hàng: ${item.customerName}\n` +
              `Ngày tạo: ${new Date(item.createdAt).toLocaleString('vi-VN')}\n` +
              `Số lượng SP: ${item.items.length}\n` +
              `Số tiền hoàn: ${item.total.toLocaleString()} ₫\n` +
              `Lý do: ${reason}`,
              [{ text: 'Đóng' }]
            );
          }}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.code, { color: colors.text }]}>{item.code}</Text>
              <Text style={styles.ref}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
            </View>
            
            <View style={[styles.refundBadge, { backgroundColor: isDark ? '#450a0a' : '#fef2f2' }]}>
              <Text style={styles.refundText}>- {item.total.toLocaleString()} ₫</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#f0f2f5' }]} />

          <View style={styles.cardBody}>
            <View>
              <Text style={styles.label}>Khách hàng</Text>
              <Text style={[styles.value, { color: colors.text }]}>{item.customerName}</Text>
            </View>
            <View style={{alignItems: 'flex-end', flex: 1}}>
              <Text style={styles.label}>Lý do</Text>
              <Text style={[styles.reason, { color: colors.text }]} numberOfLines={1}>{reason}</Text>
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
            <Text style={[styles.title, { color: colors.text }]}>Trả hàng - Hoàn tiền</Text>
          </View>
          
          {/* Nút Tạo phiếu: Giữ màu đỏ đặc trưng (#ef4444) */}
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: '#ef4444' }]} 
            onPress={() => router.push('/medicines/export-cancel' as any)}
          >
            <MaterialIcons name="keyboard-return" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Tạo phiếu trả</Text>
          </TouchableOpacity>
        </View>

        {/* Search Box đổi màu */}
        <View style={[styles.searchBox, { backgroundColor: isDark ? '#1f2937' : '#f0f2f5' }]}>
          <MaterialIcons name="search" size={20} color="#617589" />
          <TextInput 
            style={[styles.input, { color: colors.text }]} 
            placeholder="Tìm phiếu trả, tên khách..." 
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredReturns}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="assignment-return" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: '#617589' }]}>Chưa có phiếu trả hàng nào</Text>
          </View>
        }
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
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  searchBox: { flexDirection: 'row', borderRadius: 8, paddingHorizontal: 12, height: 40, alignItems: 'center' },
  input: { flex: 1, marginLeft: 8, fontSize: 14 },
  
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#dbe0e6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { fontSize: 16, fontWeight: 'bold' },
  ref: { fontSize: 12, color: '#617589' },
  refundBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  refundText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
  divider: { height: 1, marginVertical: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 10, color: '#617589' },
  value: { fontSize: 14, fontWeight: '500' },
  reason: { fontSize: 14, fontStyle: 'italic' },
  empty: { alignItems: 'center', marginTop: 50, gap: 8 },
  emptyText: { fontSize: 14 },
});