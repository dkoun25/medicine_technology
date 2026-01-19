import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const THEME = {
  primary: '#137fec',
  bg: '#f6f7f8',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
  red: '#ef4444',
  redBg: '#fef2f2',
};

export default function ExportCancelScreen() {
  const router = useRouter();
  // Giả lập state
  const [reason, setReason] = useState('expired'); // expired | damaged | lost
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');

  const handleExport = () => {
    alert('Đã tạo phiếu xuất hủy thành công!');
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{padding: 4}}>
           <MaterialIcons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xuất hủy / Điều chỉnh</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Cảnh báo */}
        <View style={styles.warningBox}>
          <MaterialIcons name="warning" size={20} color={THEME.red} />
          <Text style={styles.warningText}>
            Chức năng này dùng để trừ kho khi thuốc bị hỏng, hết hạn hoặc thất thoát. Không dùng cho bán hàng.
          </Text>
        </View>

        {/* Form chọn thuốc (Mockup: Giả sử đã chọn thuốc ID: 123) */}
        <View style={styles.card}>
          <Text style={styles.label}>Thuốc cần xuất</Text>
          <View style={styles.fakeSelect}>
            <Text style={styles.fakeSelectText}>Panadol Extra (Viên nén)</Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={THEME.textGray} />
          </View>
          
          <Text style={[styles.label, {marginTop: 12}]}>Chọn Lô (Batch)</Text>
          <View style={styles.fakeSelect}>
            <Text style={styles.fakeSelectText}>L001 - HSD: 12/2025 (Tồn: 50)</Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={THEME.textGray} />
          </View>
        </View>

        {/* Lý do xuất */}
        <View style={styles.card}>
          <Text style={styles.label}>Lý do xuất</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={[styles.radioItem, reason === 'expired' && styles.radioActive]}
              onPress={() => setReason('expired')}
            >
              <Text style={[styles.radioText, reason === 'expired' && styles.radioTextActive]}>Hết hạn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.radioItem, reason === 'damaged' && styles.radioActive]}
              onPress={() => setReason('damaged')}
            >
              <Text style={[styles.radioText, reason === 'damaged' && styles.radioTextActive]}>Hư hỏng/Vỡ</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.radioItem, reason === 'lost' && styles.radioActive]}
              onPress={() => setReason('lost')}
            >
              <Text style={[styles.radioText, reason === 'lost' && styles.radioTextActive]}>Thất thoát</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Số lượng & Ghi chú */}
        <View style={styles.card}>
          <Text style={styles.label}>Số lượng xuất hủy</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nhập số lượng..."
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={[styles.label, {marginTop: 16}]}>Ghi chú chi tiết</Text>
          <TextInput 
            style={[styles.input, {height: 80, paddingTop: 12}]} 
            placeholder="Ví dụ: Vỡ trong quá trình vận chuyển..."
            multiline
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleExport}>
          <Text style={styles.submitBtnText}>Xác nhận Xuất hủy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: THEME.white, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 50, 
    borderBottomWidth: 1, borderBottomColor: THEME.border 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text },
  
  content: { padding: 16, paddingBottom: 100 },
  
  warningBox: { 
    flexDirection: 'row', gap: 8, backgroundColor: THEME.redBg, padding: 12, borderRadius: 8, marginBottom: 16 
  },
  warningText: { flex: 1, fontSize: 12, color: THEME.red, lineHeight: 18 },

  card: { backgroundColor: THEME.white, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.border },
  label: { fontSize: 14, fontWeight: '500', color: THEME.text, marginBottom: 8 },
  
  fakeSelect: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    height: 48, borderWidth: 1, borderColor: THEME.border, borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#FAFAFA' 
  },
  fakeSelectText: { color: THEME.text },

  radioGroup: { flexDirection: 'row', gap: 8 },
  radioItem: { 
    flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', 
    borderWidth: 1, borderColor: THEME.border, borderRadius: 8, backgroundColor: '#FAFAFA' 
  },
  radioActive: { backgroundColor: THEME.redBg, borderColor: THEME.red },
  radioText: { color: THEME.textGray, fontSize: 13 },
  radioTextActive: { color: THEME.red, fontWeight: 'bold' },

  input: { 
    borderWidth: 1, borderColor: THEME.border, borderRadius: 8, 
    paddingHorizontal: 12, fontSize: 16, color: THEME.text, backgroundColor: '#FAFAFA', height: 48 
  },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: THEME.white, padding: 16, borderTopWidth: 1, borderTopColor: THEME.border 
  },
  submitBtn: { 
    backgroundColor: THEME.red, borderRadius: 8, height: 48, 
    alignItems: 'center', justifyContent: 'center' 
  },
  submitBtnText: { color: THEME.white, fontWeight: 'bold', fontSize: 16 },
});