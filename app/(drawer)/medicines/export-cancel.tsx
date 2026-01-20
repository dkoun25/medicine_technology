import { useInvoices } from '@/hooks/useInvoices';
import { dataManager } from '@/services/DataManager';
import { Invoice, InvoiceItem } from '@/types/invoice';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const { invoices, saveInvoice } = useInvoices();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [reason, setReason] = useState('defective'); // defective | wrong_item | customer_request
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [customers, setCustomers] = useState<string[]>([]);
  const [customerPurchases, setCustomerPurchases] = useState<any[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<any[]>([]);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);

  useEffect(() => {
    const data = dataManager.getAllMedicines();
    setMedicines(data);
    
    // Lấy danh sách khách hàng từ hóa đơn bán lẻ
    const retailInvoices = invoices.filter(inv => inv.type === 'retail' && inv.status === 'completed');
    const uniqueCustomers = Array.from(new Set(
      retailInvoices.map(inv => inv.customerName || 'Khách Vãng Lai')
    ));
    setCustomers(uniqueCustomers);
  }, [invoices]);

  // Lọc thuốc và lô khi chọn khách hàng
  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerPurchases([]);
      setAvailableMedicines([]);
      return;
    }

    // Lấy tất cả hóa đơn của khách này
    const customerInvoices = invoices.filter(
      inv => inv.type === 'retail' && 
             inv.status === 'completed' && 
             inv.customerName === selectedCustomer
    );

    // Tổng hợp các item đã mua
    const purchasedItems: any[] = [];
    customerInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        purchasedItems.push({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          batchId: item.batchId,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      });
    });

    setCustomerPurchases(purchasedItems);

    // Lọc thuốc chỉ hiển thị những thuốc khách đã mua
    const purchasedMedicineIds = [...new Set(purchasedItems.map(item => item.medicineId))];
    const filteredMedicines = medicines.filter(med => 
      purchasedMedicineIds.includes(med.id)
    );
    setAvailableMedicines(filteredMedicines);
  }, [selectedCustomer, invoices, medicines]);

  // Lọc lô khi chọn thuốc
  useEffect(() => {
    if (!selectedMedicine || !selectedCustomer) {
      setAvailableBatches([]);
      return;
    }

    // Lấy các lô mà khách đã mua từ thuốc này
    const purchasedBatches = customerPurchases
      .filter(item => item.medicineId === selectedMedicine.id)
      .map(item => ({
        batchNumber: item.batchNumber,
        batchId: item.batchId,
        quantity: item.quantity, // Số lượng đã mua
      }));

    // Tính tổng số lượng đã mua theo từng lô
    const batchMap = new Map();
    purchasedBatches.forEach(batch => {
      const existing = batchMap.get(batch.batchNumber);
      if (existing) {
        batchMap.set(batch.batchNumber, {
          ...existing,
          quantity: existing.quantity + batch.quantity,
        });
      } else {
        batchMap.set(batch.batchNumber, batch);
      }
    });

    // Lấy thông tin batch từ medicine và kết hợp với số lượng đã mua
    const batches = selectedMedicine.batches || [];
    const filteredBatches = batches
      .filter((batch: any) => batchMap.has(batch.batchNumber))
      .map((batch: any) => ({
        ...batch,
        purchasedQuantity: batchMap.get(batch.batchNumber)?.quantity || 0,
      }));

    setAvailableBatches(filteredBatches);
  }, [selectedMedicine, selectedCustomer, customerPurchases]);

  const handleReturn = async () => {
    if (!selectedCustomer) {
      Alert.alert('Lỗi', 'Vui lòng chọn khách hàng');
      return;
    }
    if (!selectedMedicine) {
      Alert.alert('Lỗi', 'Vui lòng chọn thuốc cần trả');
      return;
    }
    if (!selectedBatch) {
      Alert.alert('Lỗi', 'Vui lòng chọn lô (batch) cần trả');
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng hợp lệ');
      return;
    }
    
    // Kiểm tra số lượng không vượt quá số lượng đã mua
    const purchasedQty = selectedBatch.purchasedQuantity || 0;
    if (parseInt(quantity) > purchasedQty) {
      Alert.alert(
        'Lỗi', 
        `Khách chỉ mua ${purchasedQty} ${selectedMedicine.unit || 'đơn vị'}.\nKhông thể trả ${quantity} ${selectedMedicine.unit || 'đơn vị'}.`
      );
      return;
    }

    try {
      // Cập nhật số lượng trong kho (cộng trả lại)
      const updatedBatches = selectedMedicine.batches.map((b: any) => {
        if (b.batchNumber === selectedBatch.batchNumber) {
          return { ...b, quantity: b.quantity + parseInt(quantity) };
        }
        return b;
      });

      dataManager.updateMedicine(selectedMedicine.id, { batches: updatedBatches });

      // Tạo hóa đơn trả hàng
      const returnAmount = selectedMedicine.price * parseInt(quantity);
      const reasonText = reason === 'defective' ? 'Sản phẩm lỗi' : reason === 'wrong_item' ? 'Giao sai hàng' : 'Khách yêu cầu';
      
      const invoiceItem: InvoiceItem = {
        medicineId: selectedMedicine.id,
        medicineName: selectedMedicine.name,
        batchId: selectedBatch.id || selectedBatch.batchNumber,
        batchNumber: selectedBatch.batchNumber,
        quantity: parseInt(quantity),
        unitPrice: selectedMedicine.price || 0,
        discount: 0,
        total: returnAmount,
      };
      
      const now = new Date().toISOString();
      const returnInvoice: Invoice = {
        id: `RET-${Date.now()}`,
        code: `TH${Date.now().toString().slice(-6)}`,
        type: 'return',
        customerName: selectedCustomer,
        items: [invoiceItem],
        subtotal: returnAmount,
        discount: 0,
        discountAmount: 0,
        total: returnAmount,
        paid: returnAmount,
        change: 0,
        paymentMethod: 'cash',
        status: 'completed',
        cashierId: 'CASHIER-001',
        cashierName: 'Thu ngân',
        notes: `Lý do: ${reasonText}. ${note ? note : ''}`,
        createdAt: now,
        updatedAt: now,
      };
      
      await saveInvoice(returnInvoice);
      
      Alert.alert(
        '✅ Trả hàng thành công',
        `Đã hoàn tiền ${returnAmount.toLocaleString()} đ\n` +
        `Khách hàng: ${selectedCustomer}\n` +
        `Thuốc: ${selectedMedicine.name}\n` +
        `Số lượng: ${quantity} ${selectedMedicine.unit || 'đơn vị'}\n` +
        `Lô: ${selectedBatch.batchNumber}\n` +
        `Lý do: ${reasonText}`,
        [
          { text: 'Xem hóa đơn', onPress: () => router.push('/(drawer)/hoa-don/ban-le' as any) },
          { text: 'Đóng', style: 'cancel', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Return error:', error);
      Alert.alert('Lỗi', 'Không thể tạo hóa đơn trả hàng');
    }
  };

  const handleSelectMedicine = (medicine: any) => {
    setSelectedMedicine(medicine);
    setSelectedBatch(null);
    setQuantity('');
    setShowMedicineModal(false);
  };

  const handleSelectBatch = (batch: any) => {
    setSelectedBatch(batch);
    setQuantity('');
    setShowBatchModal(false);
  };

  const handleSelectCustomer = (customer: string) => {
    setSelectedCustomer(customer);
    setSelectedMedicine(null);
    setSelectedBatch(null);
    setQuantity('');
    setShowCustomerModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/medicines' as any)} style={{padding: 4}}>
           <MaterialIcons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trả hàng - Hoàn tiền</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Cảnh báo */}
        <View style={styles.warningBox}>
          <MaterialIcons name="info" size={20} color={THEME.red} />
          <Text style={styles.warningText}>
            Chức năng này dùng để xử lý trả hàng và hoàn tiền cho khách hàng. Số lượng sẽ được cộng trả lại kho và doanh thu sẽ giảm tương ứng.
          </Text>
        </View>

        {/* Chọn khách hàng */}
        <View style={styles.card}>
          <Text style={styles.label}>Khách hàng</Text>
          <TouchableOpacity style={styles.fakeSelect} onPress={() => setShowCustomerModal(true)}>
            <Text style={[styles.fakeSelectText, !selectedCustomer && { color: THEME.textGray }]}>
              {selectedCustomer || 'Chọn khách hàng...'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={THEME.textGray} />
          </TouchableOpacity>
        </View>

        {/* Form chọn thuốc */}
        <View style={styles.card}>
          <Text style={styles.label}>Thuốc cần trả</Text>
          <TouchableOpacity 
            style={[styles.fakeSelect, !selectedCustomer && { opacity: 0.5 }]} 
            onPress={() => selectedCustomer && setShowMedicineModal(true)}
            disabled={!selectedCustomer}
          >
            <Text style={[styles.fakeSelectText, !selectedMedicine && { color: THEME.textGray }]}>
              {selectedMedicine ? `${selectedMedicine.name} (${selectedMedicine.unit})` : selectedCustomer ? 'Chọn thuốc...' : 'Chọn khách hàng trước'}
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
                ? `${selectedBatch.batchNumber} - HSD: ${selectedBatch.expiryDate} (Đã mua: ${selectedBatch.purchasedQuantity})` 
                : 'Chọn lô...'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={THEME.textGray} />
          </TouchableOpacity>
        </View>

        {/* Lý do trả */}
        <View style={styles.card}>
          <Text style={styles.label}>Lý do trả</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={[styles.radioItem, reason === 'defective' && styles.radioActive]}
              onPress={() => setReason('defective')}
            >
              <Text style={[styles.radioText, reason === 'defective' && styles.radioTextActive]}>Sản phẩm lỗi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.radioItem, reason === 'wrong_item' && styles.radioActive]}
              onPress={() => setReason('wrong_item')}
            >
              <Text style={[styles.radioText, reason === 'wrong_item' && styles.radioTextActive]}>Giao sai hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.radioItem, reason === 'customer_request' && styles.radioActive]}
              onPress={() => setReason('customer_request')}
            >
              <Text style={[styles.radioText, reason === 'customer_request' && styles.radioTextActive]}>Khách yêu cầu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Số lượng & Ghi chú */}
        <View style={styles.card}>
          <Text style={styles.label}>Số lượng trả</Text>
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
            placeholder="Ví dụ: Lỗi bán chạy, khách không hài lòng..."
            multiline
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleReturn}>
          <Text style={styles.submitBtnText}>Xác nhận Trả hàng - Hoàn tiền</Text>
        </TouchableOpacity>
      </View>

      {/* Modal chọn khách hàng */}
      <Modal
        visible={showCustomerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn khách hàng</Text>
              <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                <MaterialIcons name="close" size={24} color={THEME.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={customers}
              keyExtractor={(item, index) => `customer-${index}`}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => handleSelectCustomer(item)}
                >
                  <Text style={styles.modalItemName}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Chưa có khách hàng nào mua hàng</Text>
              }
            />
          </View>
        </View>
      </Modal>

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
              data={availableMedicines}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
              renderItem={({ item }) => {
                const purchasedCount = customerPurchases.filter(p => p.medicineId === item.id).length;
                return (
                  <TouchableOpacity 
                    style={styles.modalItem}
                    onPress={() => handleSelectMedicine(item)}
                  >
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemSub}>{item.unit} • Đã mua: {purchasedCount} lần</Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {selectedCustomer ? 'Khách chưa mua thuốc nào' : 'Vui lòng chọn khách hàng trước'}
                </Text>
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
              data={availableBatches}
              keyExtractor={(item, index) => item.batchNumber + index}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => handleSelectBatch(item)}
                >
                  <Text style={styles.modalItemName}>{item.batchNumber}</Text>
                  <Text style={styles.modalItemSub}>
                    HSD: {item.expiryDate} • Đã mua: {item.purchasedQuantity}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {selectedMedicine ? 'Khách chưa mua lô nào của thuốc này' : 'Vui lòng chọn thuốc trước'}
                </Text>
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