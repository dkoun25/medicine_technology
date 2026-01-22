import { dataManager, Supplier } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert, FlatList, Linking, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const THEME = {
  primary: '#137fec',
  bg: '#f6f7f8',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
  red: '#ef4444',
  green: '#22c55e',
  blueBg: '#eff6ff',
};

export default function SuppliersScreen() {
  const navigation = useNavigation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newForm, setNewForm] = useState({ name: '', phone: '', address: '' });

  const saveSuppliers = useCallback(async (list: Supplier[]) => {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem('suppliers', JSON.stringify(list));
      } else {
        await AsyncStorage.setItem('suppliers', JSON.stringify(list));
      }
    } catch (error) {
      console.error('Error saving suppliers:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      let stored: string | null = null;
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        stored = localStorage.getItem('suppliers');
      } else {
        stored = await AsyncStorage.getItem('suppliers');
      }

      if (stored) {
        setSuppliers(JSON.parse(stored));
      } else {
        const fromDataManager = dataManager.getAllSuppliers();
        await saveSuppliers(fromDataManager);
        setSuppliers(fromDataManager);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setSuppliers(dataManager.getAllSuppliers());
    }
  }, [saveSuppliers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (supplier: Supplier) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa "${supplier.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const allSuppliers = dataManager.getAllSuppliers();
            const filtered = allSuppliers.filter(s => s.id !== supplier.id);
            await saveSuppliers(filtered);
            setDetailModal(false);
            loadData();
            Alert.alert('Thành công', 'Nhà cung cấp đã được xóa');
          }
        }
      ]
    );
  };

  const handleAdd = async () => {
    if (!newForm.name) return alert('Vui lòng nhập tên!');
    
    // Thêm vào dataManager
    const newSupplier = dataManager.addSupplier(newForm);
    
    // Đồng bộ vào localStorage
    const allSuppliers = dataManager.getAllSuppliers();
    await saveSuppliers(allSuppliers);
    
    setModalVisible(false);
    setNewForm({ name: '', phone: '', address: '' });
    loadData();
    Alert.alert('Thành công', 'Nhà cung cấp đã được thêm');
  };

  const filteredData = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.phone.includes(search)
  );

  const renderItem = ({ item, index }: { item: Supplier, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <TouchableOpacity style={styles.card} onPress={() => { setSelectedSupplier(item); setDetailModal(true); }} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.rowInfo}>
              <MaterialIcons name="location-on" size={14} color={THEME.textGray} />
              <Text style={styles.subText} numberOfLines={1}>{item.address}</Text>
            </View>
          </View>
          {item.debt > 0 ? (
             <View style={[styles.badge, { backgroundColor: '#fef2f2' }]}>
                <Text style={{ fontSize: 10, color: THEME.red, fontWeight: 'bold' }}>Nợ: {(item.debt/1000).toFixed(0)}k</Text>
             </View>
          ) : (
             <View style={[styles.badge, { backgroundColor: '#f0fdf4' }]}>
                <Text style={{ fontSize: 10, color: THEME.green, fontWeight: 'bold' }}>Sạch nợ</Text>
             </View>
          )}
        </View>
        <View style={styles.divider} />
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
            <MaterialIcons name="phone" size={16} color={THEME.textGray} />
            <Text style={styles.actionText}>{item.phone}</Text>
          </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Nhà cung cấp</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <MaterialIcons name="add" size={20} color={THEME.white} />
            <Text style={{ color: THEME.white, fontWeight: '600' }}>Thêm</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={THEME.textGray} />
          <TextInput 
            placeholder="Tìm nhà cung cấp..." 
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

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Nhà Cung Cấp</Text>
            <TextInput 
              placeholder="Tên nhà cung cấp" 
              style={styles.modalInput} 
              value={newForm.name} onChangeText={t => setNewForm({...newForm, name: t})}
            />
            <TextInput 
              placeholder="Số điện thoại" 
              keyboardType="phone-pad"
              style={styles.modalInput} 
              value={newForm.phone} onChangeText={t => setNewForm({...newForm, phone: t})}
            />
            <TextInput 
              placeholder="Địa chỉ" 
              style={styles.modalInput} 
              value={newForm.address} onChangeText={t => setNewForm({...newForm, address: t})}
            />
            <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.textGray}]} onPress={() => setModalVisible(false)}>
                <Text style={{color: 'white'}}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.primary}]} onPress={handleAdd}>
                <Text style={{color: 'white'}}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={detailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Chi tiết nhà cung cấp</Text>
              <TouchableOpacity onPress={() => setDetailModal(false)}>
                <MaterialIcons name="close" size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>
            {selectedSupplier && (
              <>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: THEME.textGray, marginBottom: 4 }}>Tên</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: THEME.text }}>{selectedSupplier.name}</Text>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: THEME.textGray, marginBottom: 4 }}>Số điện thoại</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: THEME.text }}>{selectedSupplier.phone}</Text>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: THEME.textGray, marginBottom: 4 }}>Địa chỉ</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: THEME.text }}>{selectedSupplier.address || 'N/A'}</Text>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, color: THEME.textGray, marginBottom: 4 }}>Công nợ</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: selectedSupplier.debt > 0 ? THEME.red : THEME.green }}>
                    {selectedSupplier.debt ? (selectedSupplier.debt/1000).toFixed(0) + 'k đ' : 'Sạch nợ'}
                  </Text>
                </View>
              </>
            )}
            <View style={{flexDirection: 'row', gap: 10, marginTop: 20}}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.textGray}]} onPress={() => setDetailModal(false)}>
                <Text style={{color: 'white'}}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: THEME.red, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4}]} onPress={() => selectedSupplier && handleDelete(selectedSupplier)}>
                <MaterialIcons name="delete" size={18} color="white" />
                <Text style={{color: 'white'}}>Xóa</Text>
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
  addBtn: { flexDirection: 'row', backgroundColor: THEME.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', gap: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 12, height: 44, borderRadius: 8 },
  input: { flex: 1, marginLeft: 8 },
  card: { backgroundColor: THEME.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.blueBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: THEME.primary },
  name: { fontSize: 16, fontWeight: '600', color: THEME.text },
  rowInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  subText: { fontSize: 13, color: THEME.textGray },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  divider: { height: 1, backgroundColor: '#f0f2f4', marginVertical: 12 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: THEME.textGray },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: THEME.border, borderRadius: 8, padding: 10, marginBottom: 12 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' }
});