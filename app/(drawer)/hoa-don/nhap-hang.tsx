import { useTheme } from '@/context/ThemeContext';
import { PurchaseOrder } from '@/types/invoice';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const PURCHASE_ORDERS_KEY = 'purchase_orders';

export default function PurchaseInvoicesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [imports, setImports] = useState<PurchaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Load purchase orders from AsyncStorage
  const loadPurchaseOrders = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PURCHASE_ORDERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setImports(parsed);
        console.log('Loaded purchase orders:', parsed.length);
      }
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    }
  }, []);

  // Reload when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadPurchaseOrders();
    }, [loadPurchaseOrders])
  );
  
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

  const renderItem = ({ item, index }: { item: PurchaseOrder, index: number }) => {
    const status = getStatusStyle(item.status);
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity 
          // Card đổi màu theo theme
          onPress={() => { setSelectedOrder(item); setShowDetailModal(true); }}
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
                <Text style={[styles.code, { color: colors.text }]}>{item.code}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
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
              <Text style={[styles.value, { color: colors.text }]}>{item.supplierName}</Text>
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

      {/* Modal Chi tiết phiếu nhập */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Chi tiết phiếu nhập</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <>
                {/* Thông tin chung */}
                <View style={styles.infoSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin phiếu</Text>
                  
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Mã phiếu</Text>
                    <Text style={[styles.infoValue, { color: colors.primary }]}>{selectedOrder.code}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Nhà cung cấp</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selectedOrder.supplierName}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Ngày nhập</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Trạng thái</Text>
                    <Text style={[styles.infoValue, { color: '#22c55e' }]}>
                      {selectedOrder.status === 'completed' ? 'Đã nhập kho' : 'Chờ hàng về'}
                    </Text>
                  </View>
                </View>

                {/* Danh sách thuốc */}
                <View style={styles.infoSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Danh sách thuốc ({selectedOrder.items.length})</Text>
                  
                  {selectedOrder.items.map((item, idx) => (
                    <View key={idx} style={[styles.itemRow, { backgroundColor: isDark ? '#1f2937' : '#f9fafb', borderColor: colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemName, { color: colors.text }]}>{item.medicineName}</Text>
                        <Text style={[styles.itemBatch, { color: colors.text }]}>Lô: {item.batchNumber}</Text>
                        <Text style={[styles.itemBatch, { color: colors.text }]}>Hạn: {new Date(item.expiryDate).toLocaleDateString('vi-VN')}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.itemQty, { color: colors.primary }]}>{item.quantity} đơn vị</Text>
                        <Text style={[styles.itemPrice, { color: colors.text }]}>{item.total.toLocaleString()} ₫</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Tổng tiền */}
                <View style={[styles.totalSection, { borderTopColor: colors.border }]}>
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>Tổng cộng</Text>
                    <Text style={[styles.totalValue, { color: colors.primary }]}>{selectedOrder.total.toLocaleString()} ₫</Text>
                  </View>
                </View>

                {/* Nút đóng */}
                <TouchableOpacity 
                  style={[styles.closeBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Text style={styles.closeBtnText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 20, width: '100%', maxWidth: 500, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  infoSection: { marginTop: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '600' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
  itemName: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  itemBatch: { fontSize: 12, marginTop: 2 },
  itemQty: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  itemPrice: { fontSize: 12, fontWeight: '600' },
  totalSection: { borderTopWidth: 2, paddingTop: 16, marginTop: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },
  closeBtn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});