import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const THEME = {
  primary: '#137fec',
  bg: '#f6f7f8',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
  blueBg: '#eff6ff',
};

export default function ImportMedicineScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'new' | 'restock'>('new'); // Chế độ tab

  // Form State
  const [form, setForm] = useState({
    name: '', sku: '', unit: '', price: '',
    batchNumber: '', expiryDate: '', quantity: '', supplier: ''
  });

  const handleSave = () => {
    // Logic giả lập lưu dữ liệu
    const message = tab === 'new' 
      ? 'Đã tạo mã thuốc mới và nhập kho thành công!' 
      : 'Đã cập nhật số lượng tồn kho thành công!';
      
    alert(message);
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhập kho</Text>
        <TouchableOpacity>
           <MaterialIcons name="qr-code-scanner" size={24} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, tab === 'new' && styles.activeTab]} 
          onPress={() => setTab('new')}
        >
          <Text style={[styles.tabText, tab === 'new' && styles.activeTabText]}>Thêm thuốc mới</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, tab === 'restock' && styles.activeTab]} 
          onPress={() => setTab('restock')}
        >
          <Text style={[styles.tabText, tab === 'restock' && styles.activeTabText]}>Nhập hàng cũ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* --- FORM THUỐC MỚI --- */}
        {tab === 'new' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Thông tin thuốc</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên thuốc <Text style={{color: 'red'}}>*</Text></Text>
              <TextInput 
                style={styles.input} placeholder="Ví dụ: Panadol Extra" 
                value={form.name} onChangeText={t => setForm({...form, name: t})}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, {flex: 1}]}>
                <Text style={styles.label}>Mã SKU (Barcode)</Text>
                <TextInput 
                  style={styles.input} placeholder="Scan hoặc nhập" 
                  value={form.sku} onChangeText={t => setForm({...form, sku: t})}
                />
              </View>
              <View style={[styles.formGroup, {width: 100}]}>
                <Text style={styles.label}>Đơn vị</Text>
                <TextInput 
                  style={styles.input} placeholder="Hộp/Vỉ" 
                  value={form.unit} onChangeText={t => setForm({...form, unit: t})}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Giá bán niêm yết</Text>
              <TextInput 
                style={styles.input} placeholder="0" keyboardType="numeric"
                value={form.price} onChangeText={t => setForm({...form, price: t})}
              />
            </View>
          </View>
        )}

        {/* --- FORM NHẬP HÀNG CŨ (Chỉ hiện khi chọn tab Restock) --- */}
        {tab === 'restock' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn thuốc cần nhập</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tìm kiếm thuốc</Text>
              <View style={styles.searchFake}>
                 <MaterialIcons name="search" size={20} color={THEME.textGray} />
                 <Text style={{color: THEME.textGray, marginLeft: 8}}>Gõ tên hoặc quét mã vạch...</Text>
              </View>
            </View>
          </View>
        )}

        {/* --- FORM LÔ HÀNG (Dùng chung cho cả 2 tab) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Thông tin lô nhập</Text>
          
          <View style={styles.formGroup}>
             <Text style={styles.label}>Nhà cung cấp</Text>
             <TextInput 
                style={styles.input} placeholder="Chọn nhà cung cấp..." 
                value={form.supplier} onChangeText={t => setForm({...form, supplier: t})}
              />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, {flex: 1}]}>
              <Text style={styles.label}>Số lô (Batch No)</Text>
              <TextInput 
                style={styles.input} placeholder="L00..." 
                value={form.batchNumber} onChangeText={t => setForm({...form, batchNumber: t})}
              />
            </View>
            <View style={[styles.formGroup, {flex: 1}]}>
              <Text style={styles.label}>Hạn sử dụng</Text>
              <TextInput 
                style={styles.input} placeholder="DD/MM/YYYY" 
                value={form.expiryDate} onChangeText={t => setForm({...form, expiryDate: t})}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Số lượng nhập <Text style={{color: 'red'}}>*</Text></Text>
            <TextInput 
              style={[styles.input, {borderColor: THEME.primary, borderWidth: 1.5, fontWeight: 'bold'}]} 
              placeholder="0" keyboardType="numeric"
              value={form.quantity} onChangeText={t => setForm({...form, quantity: t})}
            />
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {tab === 'new' ? 'Lưu & Tạo mới' : 'Xác nhận nhập kho'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  
  // Header
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: THEME.white, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 50, 
    borderBottomWidth: 1, borderBottomColor: THEME.border 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text },
  backBtn: { padding: 4 },

  // Tabs
  tabContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  tab: { 
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, 
    backgroundColor: THEME.white, borderWidth: 1, borderColor: THEME.border 
  },
  activeTab: { backgroundColor: THEME.blueBg, borderColor: THEME.primary },
  tabText: { fontWeight: '600', color: THEME.textGray },
  activeTabText: { color: THEME.primary },
  
  // Content
  content: { paddingHorizontal: 16, paddingBottom: 100 },
  section: { 
    backgroundColor: THEME.white, borderRadius: 12, padding: 16, 
    marginBottom: 16, borderWidth: 1, borderColor: THEME.border 
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: THEME.text, marginBottom: 16 },
  
  formGroup: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 14, fontWeight: '500', color: THEME.text, marginBottom: 8 },
  input: { 
    height: 48, borderWidth: 1, borderColor: THEME.border, borderRadius: 8, 
    paddingHorizontal: 12, fontSize: 16, backgroundColor: '#FAFAFA' 
  },
  searchFake: {
    height: 48, borderWidth: 1, borderColor: THEME.border, borderRadius: 8, 
    paddingHorizontal: 12, backgroundColor: '#FAFAFA', flexDirection: 'row', alignItems: 'center'
  },
  
  // Footer
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: THEME.white, padding: 16, borderTopWidth: 1, borderTopColor: THEME.border 
  },
  saveBtn: { 
    backgroundColor: THEME.primary, borderRadius: 8, height: 48, 
    alignItems: 'center', justifyContent: 'center' 
  },
  saveBtnText: { color: THEME.white, fontWeight: 'bold', fontSize: 16 },
});