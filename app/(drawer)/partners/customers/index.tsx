import { dataManager } from '@/services/DataManager';
import { Invoice } from '@/types/invoice';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert, FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const INVOICES_KEY = 'invoices';

const THEME = {
  primary: '#137fec',
  bg: '#f6f7f8',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
  red: '#ef4444',
  gold: '#eab308',
  goldBg: '#fefce8',
  blueBg: '#eff6ff',
};

export default function CustomersScreen() {
  const navigation = useNavigation();
  // Sử dụng 'any' tạm thời cho mảng customers để tránh lỗi type quá khắt khe khi hiển thị
  // hoặc bạn có thể dùng Customer[] nếu type đã khớp hoàn toàn
  const [customers, setCustomers] = useState<any[]>([]); 
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newForm, setNewForm] = useState({ name: '', phone: '' });
  const [editForm, setEditForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    loadData();
  }, []);

  // Reload khi màn hình focus - để lấy khách hàng mới từ hóa đơn bán lẻ
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = useCallback(async () => {
    // FIX 2: Sửa thành getAllCustomers()
    const allCustomers = dataManager.getAllCustomers();
    
    // Lấy thêm khách hàng từ các hóa đơn bán lẻ - ĐỌC TỪ ASYNCSTORAGE
    try {
      const stored = await AsyncStorage.getItem(INVOICES_KEY);
      const invoices: Invoice[] = stored ? JSON.parse(stored) : [];
      console.log('Total invoices from AsyncStorage:', invoices.length);
      
      const retailInvoices = invoices.filter(inv => inv.type === 'retail' && inv.customerName && typeof inv.customerName === 'string');
      console.log('Retail invoices with customer:', retailInvoices.length);
      
      // Group by customerName to deduplicate and sum purchases
      const customerMap = new Map<string, any>();
      
      retailInvoices.forEach(inv => {
        const safeName = inv.customerName as string;
        const key = safeName.toLowerCase().trim();
        
        if (customerMap.has(key)) {
          // Update existing customer - add to total purchases
          const existing = customerMap.get(key);
          existing.totalPurchases += inv.total || 0;
        } else {
          // New customer from invoice
          customerMap.set(key, {
            id: inv.customerId || 'KH_' + safeName.replace(/\s+/g, '_'),
            name: safeName,
            phone: inv.customerPhone || '',
            code: 'KH' + Date.now().toString().slice(-6),
            loyaltyPoints: 0,
            totalPurchases: inv.total || 0,
            address: '',
            email: '',
          });
        }
      });
      
      const invoiceCustomers = Array.from(customerMap.values());
      console.log('Unique invoice customers:', invoiceCustomers.length);
      
      // Merge customers: prioritize dataManager customers, add invoice customers not in main list
      const mergedCustomers = [
        ...allCustomers,
        ...invoiceCustomers.filter(ic => !allCustomers.some(ac => ac.id === ic.id || ac.name.toLowerCase().trim() === ic.name.toLowerCase().trim()))
      ];
      
      console.log('Total merged customers:', mergedCustomers.length);
      setCustomers(mergedCustomers);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setCustomers(allCustomers);
    }
  }, []);

  const handleDelete = (customer: any) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa "${customer.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const allCustomers = dataManager.getAllCustomers();
            const filtered = allCustomers.filter(c => c.id !== customer.id);
            localStorage.setItem('customers', JSON.stringify(filtered));
            setDetailModal(false);
            loadData();
            Alert.alert('Thành công', 'Khách hàng đã được xóa');
          }
        }
      ]
    );
  };

  const handleAdd = () => {
    if (!newForm.name) return alert('Vui lòng nhập tên!');
    
    // FIX 3: Bổ sung các trường dữ liệu bắt buộc (code, loyaltyPoints...)
    dataManager.addCustomer({
      name: newForm.name,
      phone: newForm.phone,
      code: 'KH' + Date.now().toString().slice(-6), // Tự sinh mã KH
      loyaltyPoints: 0,
      totalPurchases: 0,
      address: '',
      email: '',
      // Các trường tùy chọn khác nếu type yêu cầu thì thêm vào đây
    });

    setModalVisible(false);
    setNewForm({ name: '', phone: '' });
    loadData();
    Alert.alert('Thành công', 'Khách hàng đã được thêm');
  };

  const handleEdit = () => {
    if (!editForm.name) return alert('Vui lòng nhập tên!');
    if (!selectedCustomer) return;

    dataManager.updateCustomer(selectedCustomer.id, {
      name: editForm.name,
      phone: editForm.phone,
    });

    setEditModal(false);
    setSelectedCustomer(null);
    setEditForm({ name: '', phone: '' });
    loadData();
    Alert.alert('Thành công', 'Khách hàng đã được cập nhật');
  };

  const openEditModal = (customer: any) => {
    setSelectedCustomer(customer);
    setEditForm({ name: customer.name, phone: customer.phone || '' });
    setEditModal(true);
  };

  const filteredData = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => { setSelectedCustomer(item); setDetailModal(true); }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.avatar, item.isVip && { backgroundColor: THEME.goldBg }]}>
               <MaterialIcons name={item.isVip ? "star" : "person"} size={20} color={item.isVip ? THEME.gold : THEME.primary} />
            </View>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone || 'Chưa có SĐT'}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
             <Text style={styles.spentText}>{(item.totalPurchases || 0).toLocaleString()} đ</Text>
             <Text style={styles.pointText}>{item.points || item.loyaltyPoints || 0} điểm</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <MaterialIcons name="menu" size={28} color={THEME.text} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Khách hàng</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <MaterialIcons name="person-add" size={20} color={THEME.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={THEME.textGray} />
          <TextInput 
            placeholder="Tìm khách hàng..." 
            style={styles.input} 
            value={search} onChangeText={setSearch} 
          />
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Khách Hàng Mới</Text>
            <TextInput 
              placeholder="Tên khách hàng" 
              style={styles.modalInput} 
              value={newForm.name} onChangeText={t => setNewForm({...newForm, name: t})}
            />
            <TextInput 
              placeholder="Số điện thoại" 
              keyboardType="phone-pad"
              style={styles.modalInput} 
              value={newForm.phone} onChangeText={t => setNewForm({...newForm, phone: t})}
            />
            <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.textGray}]} onPress={() => setModalVisible(false)}>
                <Text style={{color: 'white'}}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.primary}]} onPress={handleAdd}>
                <Text style={{color: 'white'}}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={detailModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Chi tiết khách hàng</Text>
              <TouchableOpacity onPress={() => setDetailModal(false)}>
                <MaterialIcons name="close" size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>
            {selectedCustomer && (
              <>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: THEME.textGray, marginBottom: 4 }}>Tên</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: THEME.text }}>{selectedCustomer.name}</Text>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: THEME.textGray, marginBottom: 4 }}>Số điện thoại</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: THEME.text }}>{selectedCustomer.phone || 'N/A'}</Text>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: THEME.textGray, marginBottom: 4 }}>Tổng chi tiêu</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: THEME.primary }}>{(selectedCustomer.totalPurchases || 0).toLocaleString()} đ</Text>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: THEME.textGray, marginBottom: 4 }}>Điểm thưởng</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: THEME.gold }}>{selectedCustomer.loyaltyPoints || 0} điểm</Text>
                </View>
              </>
            )}
            <View style={{flexDirection: 'row', gap: 10, marginTop: 20}}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.textGray}]} onPress={() => setDetailModal(false)}>
                <Text style={{color: 'white'}}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4}]} onPress={() => { setDetailModal(false); openEditModal(selectedCustomer); }}>
                <MaterialIcons name="edit" size={18} color="white" />
                <Text style={{color: 'white'}}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.red, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4}]} onPress={() => selectedCustomer && handleDelete(selectedCustomer)}>
                <MaterialIcons name="delete" size={18} color="white" />
                <Text style={{color: 'white'}}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Sửa thông tin khách hàng</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <MaterialIcons name="close" size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên khách hàng *"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Số điện thoại"
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
              keyboardType="phone-pad"
            />
            <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.textGray}]} onPress={() => setEditModal(false)}>
                <Text style={{color: 'white'}}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.primary}]} onPress={handleEdit}>
                <Text style={{color: 'white'}}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.white, padding: 16, paddingTop: Platform.OS === 'web' ? 20 : 50, borderBottomWidth: 1, borderColor: THEME.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.text },
  addBtn: { backgroundColor: THEME.primary, padding: 10, borderRadius: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 12, height: 44, borderRadius: 8 },
  input: { flex: 1, marginLeft: 8 },
  card: { backgroundColor: THEME.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.blueBg, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: 'bold', color: THEME.text },
  phone: { fontSize: 13, color: THEME.textGray, marginTop: 2 },
  spentText: { fontSize: 15, fontWeight: 'bold', color: THEME.primary },
  pointText: { fontSize: 11, color: THEME.gold, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: THEME.border, borderRadius: 8, padding: 10, marginBottom: 12 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' }
});