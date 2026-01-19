import { dataManager, Employee } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert, FlatList, Modal, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View
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
  greenBg: '#f0fdf4',
  orange: '#f97316',
  blueBg: '#eff6ff',
};

export default function EmployeeScreen() {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', phone: '', role: 'staff' as Employee['role'] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEmployees([...dataManager.getAllEmployees()]); // Copy array to trigger re-render
  };

  const handleAdd = () => {
    if (!form.name || !form.username) return alert('Vui lòng nhập đủ thông tin');
    dataManager.addEmployee({ ...form, status: 'active' });
    setModalVisible(false);
    setForm({ name: '', username: '', phone: '', role: 'staff' });
    loadData();
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
        dataManager.deleteEmployee(id);
        loadData();
      }
    } else {
      Alert.alert('Xác nhận', 'Xóa nhân viên này?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => { dataManager.deleteEmployee(id); loadData(); } }
      ]);
    }
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    dataManager.updateEmployee(id, { status: currentStatus === 'active' ? 'inactive' : 'active' });
    loadData();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return { color: '#7c3aed', bg: '#f3e8ff', label: 'Quản trị' };
      case 'manager': return { color: '#0ea5e9', bg: '#e0f2fe', label: 'Quản lý kho' };
      default: return { color: THEME.textGray, bg: '#f3f4f6', label: 'Nhân viên' };
    }
  };

  const renderItem = ({ item, index }: { item: Employee, index: number }) => {
    const roleStyle = getRoleBadge(item.role);
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.avatar, { backgroundColor: roleStyle.bg }]}>
              <Text style={{ color: roleStyle.color, fontWeight: 'bold', fontSize: 16 }}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={{backgroundColor: roleStyle.bg, paddingHorizontal: 6, borderRadius: 4}}>
                      <Text style={{color: roleStyle.color, fontSize: 10, fontWeight: 'bold'}}>{roleStyle.label}</Text>
                  </View>
              </View>
              <Text style={styles.subText}>{item.username} • {item.phone}</Text>
            </View>
            <Switch 
              value={item.status === 'active'}
              onValueChange={() => toggleStatus(item.id, item.status)}
              trackColor={{ false: '#e5e7eb', true: THEME.green }}
            />
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={{padding: 4}}>
               <MaterialIcons name="delete-outline" size={22} color={THEME.red} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {Platform.OS !== 'web' && (
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <MaterialIcons name="menu" size={28} color={THEME.text} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Nhân viên</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="add" size={20} color={THEME.white} />
          <Text style={{ color: THEME.white, fontWeight: '600' }}>Thêm mới</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={employees}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Modal Add */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Nhân Viên</Text>
            
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="Nhập tên nhân viên" />
            
            <Text style={styles.label}>Tên đăng nhập</Text>
            <TextInput style={styles.input} value={form.username} onChangeText={t => setForm({...form, username: t})} placeholder="Ví dụ: nv_banhang" autoCapitalize="none" />

            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput style={styles.input} value={form.phone} onChangeText={t => setForm({...form, phone: t})} keyboardType="phone-pad" />

            <Text style={styles.label}>Phân quyền</Text>
            <View style={styles.roleContainer}>
                {['admin', 'manager', 'staff'].map((r) => (
                    <TouchableOpacity 
                        key={r} 
                        style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
                        onPress={() => setForm({...form, role: r as any})}
                    >
                        <Text style={[styles.roleText, form.role === r && {color: 'white'}]}>
                            {r === 'admin' ? 'Quản trị' : r === 'manager' ? 'QL Kho' : 'Nhân viên'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: THEME.textGray }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: 'white' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: THEME.primary }]} onPress={handleAdd}>
                <Text style={{ color: 'white' }}>Lưu lại</Text>
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
  header: { backgroundColor: THEME.white, padding: 16, paddingTop: Platform.OS === 'web' ? 20 : 50, borderBottomWidth: 1, borderColor: THEME.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
  addBtn: { flexDirection: 'row', backgroundColor: THEME.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', gap: 6 },
  card: { backgroundColor: THEME.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: THEME.text },
  subText: { fontSize: 13, color: THEME.textGray, marginTop: 2 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 24, borderRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: THEME.text, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: THEME.border, borderRadius: 8, padding: 10, backgroundColor: '#f9fafb' },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  
  roleContainer: { flexDirection: 'row', gap: 8 },
  roleBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' },
  roleBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  roleText: { fontSize: 12, color: THEME.textGray }
});