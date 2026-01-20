import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Modal, FlatList } from 'react-native';

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
  const [medicines, setMedicines] = useState<any[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  
  const [reason, setReason] = useState('expired'); // expired | damaged | lost
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const data = dataManager.getAllMedicines();
    setMedicines(data);
  }, []);

  const handleExport = () => {
    if (!selectedMedicine) {
      Alert.alert('Lỗi', 'Vui lòng chọn thuốc cần xuất hủy');
      return;
    }
    if (!selectedBatch) {
      Alert.alert('Lỗi', 'Vui lòng chọn lô (batch) cần xuất hủy');
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng hợp lệ');
      return;
    }
    if (parseInt(quantity) > selectedBatch.quantity) {
      Alert.alert('Lỗi', `Số lượng xuất hủy không được vượt quá ${selectedBatch.quantity}`);
      return;
    }

    // Cập nhật số lượng trong kho
    const updatedBatches = selectedMedicine.batches.map((b: any) => {
      if (b.batchNumber === selectedBatch.batchNumber) {
        return { ...b, quantity: b.quantity - parseInt(quantity) };
      }
      return b;
    }).filter((b: any) => b.quantity > 0);

    dataManager.updateMedicine(selectedMedicine.id, { batches: updatedBatches });

    const reasonText = reason === 'expired' ? 'Hết hạn' : reason === 'damaged' ? 'Hư hỏng/Vỡ' : 'Thất thoát';
    
    Alert.alert(
      '✅ Xuất hủy thành công',
      `Đã xuất hủy ${quantity} ${selectedMedicine.unit || 'đơn vị'}\n${selectedMedicine.name}\nLô: ${selectedBatch.batchNumber}\nLý do: ${reasonText}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleSelectMedicine = (medicine: any) => {
    setSelectedMedicine(medicine);
    setSelectedBatch(null);
    setShowMedicineModal(false);
  };

  const handleSelectBatch = (batch: any) => {
    setSelectedBatch(batch);
    setShowBatchModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/medicines' as any)} style={{padding: 4}}>
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

        {/* Form chọn thuốc */}
        <View style={styles.card}>
          <Text style={styles.label}>Thuốc cần xuất</Text>
          <TouchableOpacity style={styles.fakeSelect} onPress={() => setShowMedicineModal(true)}>
            <Text style={[styles.fakeSelectText, !selectedMedicine && { color: THEME.textGray }]}>
              {selectedMedicine ? `${selectedMedicine.name} (${selectedMedicine.unit})` : 'Chọn thuốc...'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={THEME.textGray} />
          </TouchableOpacity>
          
          <Text style={[styles.label, {marginTop: 12}]}>Chọn Lô (Batch)</Text>
          <TouchableOpacity 
            style={[styles.fakeSelect, !selectedMedicine && { opacity: 0.5 }]} 
            onPress={() => selectedMedicine && setShowBatchModal(true)}
            disabled={!selectedMedicine}
          >
            <Text style={[styles.fakeSelectText, !selectedBatch && { color: THEME.textGray }]}>
              {selectedBatch 
                ? `${selectedBatch.batchNumber} - HSD: ${selectedBatch.expiryDate} (Tồn: ${selectedBatch.quantity})` 
                : 'Chọn lô...'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={THEME.textGray} />
          </TouchableOpacity>
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

      {/* Modal chọn thuốc */}
      <Modal
        visible={showMedicineModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMedicineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn thuốc</Text>
              <TouchableOpacity onPress={() => setShowMedicineModal(false)}>
                <MaterialIcons name="close" size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={medicines}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
              renderItem={({ item }) => {
                const totalStock = item.batches?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0;
                return (
                  <TouchableOpacity 
                    style={styles.modalItem}
                    onPress={() => handleSelectMedicine(item)}
                  >
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemSub}>{item.unit} • Tồn: {totalStock}</Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Không có thuốc nào</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal chọn batch */}
      <Modal
        visible={showBatchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn lô</Text>
              <TouchableOpacity onPress={() => setShowBatchModal(false)}>
                <MaterialIcons name="close" size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedMedicine?.batches || []}
              keyExtractor={(item, index) => item.batchNumber + index}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => handleSelectBatch(item)}
                >
                  <Text style={styles.modalItemName}>{item.batchNumber}</Text>
                  <Text style={styles.modalItemSub}>
                    HSD: {item.expiryDate} • Tồn: {item.quantity}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Không có lô nào</Text>
              }
            />
          </View>
        </View>
      </Modal>
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

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: THEME.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: THEME.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text },
  modalList: { padding: 8 },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: THEME.border },
  modalItemName: { fontSize: 16, fontWeight: '600', color: THEME.text },
  modalItemSub: { fontSize: 13, color: THEME.textGray, marginTop: 4 },
  emptyText: { textAlign: 'center', color: THEME.textGray, padding: 20 },
});