import { dataManager, Supplier } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    FlatList, Linking, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View
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
  const [newForm, setNewForm] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // FIX: Sửa thành getAllSuppliers()
    setSuppliers(dataManager.getAllSuppliers());
  };

  const handleAdd = () => {
    if (!newForm.name) return alert('Vui lòng nhập tên!');
    dataManager.addSupplier(newForm);
    setModalVisible(false);
    setNewForm({ name: '', phone: '', address: '' });
    loadData(); 
  };

  const filteredData = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.phone.includes(search)
  );

  const renderItem = ({ item, index }: { item: Supplier, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <View style={styles.card}>
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