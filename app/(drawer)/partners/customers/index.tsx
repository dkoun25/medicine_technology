import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const THEME = {
  primary: '#137fec',
  bg: '#f6f7f8',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
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
  const [newForm, setNewForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // FIX 2: Sửa thành getAllCustomers()
    setCustomers(dataManager.getAllCustomers());
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
  };

  const filteredData = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <View style={styles.card}>
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
      </View>
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