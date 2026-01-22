import { useTheme } from '@/context/ThemeContext';
import { useInvoices } from '@/hooks/useInvoices';
import { Invoice } from '@/types/invoice';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RetailInvoicesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { invoices: allInvoices, loading, loadInvoices: reloadInvoices, deleteInvoice, updateInvoice } = useInvoices();
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Invoice[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');

  // Luôn reload khi màn hình focus để thấy hóa đơn mới tạo từ POS
  useFocusEffect(
    useCallback(() => {
      reloadInvoices();
    }, [reloadInvoices])
  );

  // Lọc hóa đơn bán lẻ
  useEffect(() => {
    const retailInvoices = allInvoices.filter(inv => inv.type === 'retail');
    setFilteredData(retailInvoices);
  }, [allInvoices]);

  // Tìm kiếm
  useEffect(() => {
    const retailInvoices = allInvoices.filter(inv => inv.type === 'retail');
    
    if (!searchQuery) {
      setFilteredData(retailInvoices);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = retailInvoices.filter(item => 
        item.code?.toLowerCase().includes(lower) || 
        item.id?.toLowerCase().includes(lower) || 
        item.customerName?.toLowerCase().includes(lower)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, allInvoices]);

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

  const renderItem = ({ item, index }: { item: Invoice, index: number }) => {
    const status = getStatusStyle(item.status);
    const handleDelete = () => {
      Alert.alert(
        'Xóa hóa đơn',
        `Bạn chắc chắn xóa hóa đơn ${item.code}?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: async () => {
            await deleteInvoice(item.id);
            reloadInvoices();
          }}
        ]
      );
    };

    const handleEditStart = () => {
      setEditingId(item.id);
      setEditCustomerName(item.customerName || '');
    };

    const handleEditSave = async () => {
      await updateInvoice(item.id, { customerName: editCustomerName.trim() || 'Khách Vãng Lai' });
      setEditingId(null);
      setEditCustomerName('');
      reloadInvoices();
    };

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert(
              `Hóa đơn ${item.code}`,
              `Khách hàng: ${item.customerName || 'Khách Vãng Lai'}\n` +
              `Ngày tạo: ${new Date(item.createdAt).toLocaleString('vi-VN')}\n` +
              `Thu ngân: ${item.cashierName}\n` +
              `Số lượng SP: ${item.items.length}\n` +
              `Tổng tiền: ${item.total.toLocaleString()} ₫\n` +
              `Thanh toán: ${item.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}\n` +
              `Trạng thái: ${status.label}`,
              [{ text: 'Đóng' }]
            );
          }}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.code, { color: colors.text }]}>{item.code}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: status.bg }]}>
                <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleEditStart}>
                  <MaterialIcons name="edit" size={20} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
                  <MaterialIcons name="delete" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#f0f2f5' }]} />

          <View style={styles.cardBody}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <View style={[styles.avatar, { backgroundColor: isDark ? '#333' : '#eff6ff' }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{item.customerName?.charAt(0) || 'K'}</Text>
              </View>
              <View>
                <Text style={styles.label}>Khách hàng</Text>
                <Text style={[styles.value, { color: colors.text }]}>{item.customerName || 'Khách Vãng Lai'}</Text>
              </View>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.label}>Tổng tiền</Text>
              <Text style={[styles.total, { color: colors.primary }]}>{item.total.toLocaleString()} ₫</Text>
            </View>
          </View>

          {editingId === item.id && (
            <View style={styles.editBlock}>
              <Text style={[styles.label, { marginBottom: 4 }]}>Sửa tên khách hàng</Text>
              <TextInput
                style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
                placeholder="Tên khách hàng"
                placeholderTextColor="#9ca3af"
                value={editCustomerName}
                onChangeText={setEditCustomerName}
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]} onPress={() => { setEditingId(null); setEditCustomerName(''); }}>
                  <Text style={[styles.editBtnText, { color: colors.text }]}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={handleEditSave}>
                  <Text style={[styles.editBtnText, { color: '#fff' }]}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity onPress={openDrawer} style={{padding: 4}}>
                <MaterialIcons name="menu" size={28} color={colors.text} />
              </TouchableOpacity>
            )}
            <Text style={[styles.title, { color: colors.text }]}>Hóa đơn bán lẻ</Text>
          </View>
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
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  code: { fontSize: 16, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#617589', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  actionBtn: { padding: 6, borderRadius: 6, backgroundColor: 'transparent' },
  divider: { height: 1, marginVertical: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: 'bold' },
  label: { fontSize: 10, color: '#617589' },
  value: { fontSize: 14, fontWeight: '500' },
  total: { fontSize: 16, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 50, gap: 8 },
  emptyText: { color: '#617589' }
  ,editBlock: { marginTop: 12, gap: 8 },
  editInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, height: 40, fontSize: 14 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  editBtnText: { fontWeight: '600', fontSize: 14 }
});