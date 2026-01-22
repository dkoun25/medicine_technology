import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/context/ThemeContext';
import { dataManager } from '@/services/DataManager';
import { formatCurrency } from '@/utils/formatters';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

interface ImportBatch {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
  supplier: string;
}

export default function ImportScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    medicineName: '',
    quantity: '',
    unitPrice: '',
    batchNumber: `BATCH-${Date.now()}`,
    expiryDate: '',
    supplier: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddBatch = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.medicineName.trim()) {
      newErrors.medicineName = 'Tên thuốc không được để trống';
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0';
    }
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'Giá nhập phải lớn hơn 0';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Ngày hết hạn không được để trống';
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Nhà cung cấp không được để trống';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const batch: ImportBatch = {
        medicineId: Math.random().toString(),
        ...formData,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
      };

      setImportBatches([...importBatches, batch]);
      setFormData({
        medicineName: '',
        quantity: '',
        unitPrice: '',
        batchNumber: `BATCH-${Date.now()}`,
        expiryDate: '',
        supplier: '',
      });
      setErrors({});
      setShowModal(false);
    }
  };

  const handleRemoveBatch = (index: number) => {
    setImportBatches(importBatches.filter((_, i) => i !== index));
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({ ...formData, expiryDate: formattedDate });
    }
  };

  const handleConfirmImport = () => {
    if (importBatches.length === 0) {
      Alert.alert('Lỗi', 'Chưa có batch nào để nhập!');
      return;
    }

    // Thêm tất cả batch vào kho
    importBatches.forEach(batch => {
      const medicineData = {
        name: batch.medicineName,
        category: 'Nhập hàng',
        activeIngredient: 'Chưa cập nhật',
        unit: 'Viên',
        manufacturer: batch.supplier,
        country: 'Việt Nam',
        price: batch.unitPrice * 1.3, // Giá bán = giá nhập * 1.3
        minStock: 10,
        batches: [{
          id: `BATCH-${Date.now()}-${Math.random()}`,
          batchNumber: batch.batchNumber,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
          importDate: new Date().toISOString().split('T')[0],
          costPrice: batch.unitPrice,
          sellingPrice: batch.unitPrice * 1.3,
          supplierId: 'SUP-001',
        }],
      };
      
      dataManager.addMedicine(medicineData);
    });

    // Reset
    setImportBatches([]);
    Alert.alert('✅ Nhập hàng thành công!', `Đã nhập ${totalQuantity} sản phẩm với tổng giá trị ${formatCurrency(totalImportValue)}`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const totalImportValue = importBatches.reduce(
    (sum, batch) => sum + batch.quantity * batch.unitPrice,
    0
  );

  const totalQuantity = importBatches.reduce((sum, batch) => sum + batch.quantity, 0);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    
    // Header
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      backgroundColor: colors.card, 
      paddingHorizontal: isSmallDevice ? 12 : 16, 
      paddingBottom: 16, 
      paddingTop: 50, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.border 
    },
    headerTitle: { fontSize: isSmallDevice ? 16 : 18, fontWeight: 'bold', color: colors.text },
    backBtn: { padding: 4 },

    // Tabs
    tabContainer: { flexDirection: 'row', padding: isSmallDevice ? 12 : 16, gap: 12 },
    tab: { 
      flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, 
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border 
    },
    activeTab: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { fontWeight: '600', color: colors.text, fontSize: isSmallDevice ? 13 : 14 },
    activeTabText: { color: colors.primary },
    
    // Content
    content: { paddingHorizontal: isSmallDevice ? 12 : 16, paddingBottom: 100 },
    section: { 
      backgroundColor: colors.card, borderRadius: 12, padding: isSmallDevice ? 12 : 16, 
      marginBottom: 16, borderWidth: 1, borderColor: colors.border 
    },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    
    formGroup: { marginBottom: 16 },
    row: { flexDirection: 'row', gap: 12 },
    label: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8 },
    input: { 
      height: 48, 
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 8, 
      paddingHorizontal: 12, 
      fontSize: 16, 
      backgroundColor: isDark ? '#1f2937' : '#FAFAFA',
      color: colors.text
    },
    searchFake: {
      height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 8, 
      paddingHorizontal: 12, backgroundColor: '#FAFAFA', flexDirection: 'row', alignItems: 'center'
    },
    
    // Footer
    footer: { 
      position: 'absolute', bottom: 0, left: 0, right: 0, 
      backgroundColor: colors.card, padding: 16, borderTopWidth: 1, borderTopColor: colors.border 
    },
    saveBtn: { 
      backgroundColor: colors.primary, borderRadius: 8, height: 48, 
      alignItems: 'center', justifyContent: 'center' 
    },
    saveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

    // Additional styles
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    subtitle: { fontSize: 14, color: colors.text, marginTop: 4 },
    summaryContainer: { marginVertical: 16 },
    summaryCard: { padding: isSmallDevice ? 12 : 16 },
    summaryRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      gap: isSmallDevice ? 12 : 0
    },
    summaryItem: { alignItems: 'center', minWidth: isSmallDevice ? '45%' : 'auto' },
    summaryLabel: { fontSize: isSmallDevice ? 11 : 12, color: colors.text, marginBottom: 8 },
    summaryValue: { fontSize: isSmallDevice ? 16 : 18, fontWeight: 'bold', color: colors.text },
    addButton: { backgroundColor: colors.primary, marginVertical: 12 },
    listContainer: { marginBottom: 100 },
    listTitle: { fontSize: isSmallDevice ? 15 : 16, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
    batchCard: { marginBottom: 12, padding: isSmallDevice ? 10 : 12 },
    batchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    batchInfo: { flex: 1 },
    batchName: { fontSize: isSmallDevice ? 13 : 14, fontWeight: 'bold', color: colors.text },
    batchMeta: { fontSize: isSmallDevice ? 11 : 12, color: colors.text, marginTop: 4 },
    deleteButton: { padding: 8 },
    deleteButtonText: { fontSize: 18 },
    batchDetails: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    detailLabel: { fontSize: 12, color: colors.text },
    detailValue: { fontSize: 12, fontWeight: '600', color: colors.text },
    confirmButton: { backgroundColor: colors.primary, marginVertical: 12 },
    emptyState: { padding: 24, alignItems: 'center' },
    emptyText: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: colors.text },
    modalContainer: { flex: 1, backgroundColor: colors.background },
    modalContent: { paddingHorizontal: 16, paddingBottom: 200 },
    modalHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: 16, 
      paddingTop: 50,
      borderBottomWidth: 1, 
      borderBottomColor: colors.border,
      backgroundColor: colors.card
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    closeButton: { fontSize: 24, color: colors.text, fontWeight: 'bold' },
    errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
    inputError: { borderColor: '#ef4444' },
    buttonGroup: { flexDirection: 'row', gap: 12, marginTop: 16 },
    addBatchButton: { flex: 1, backgroundColor: colors.primary },
    cancelButton: { flex: 1, backgroundColor: '#6b7280' },
    datePickerButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 8,
      justifyContent: 'flex-start'
    },
    dateText: { 
      fontSize: 16,
      flex: 1
    },
    iosDatePickerButtons: { 
      flexDirection: 'row', 
      justifyContent: 'flex-end', 
      paddingTop: 8 
    },
    iosDateButton: { 
      paddingVertical: 8, 
      paddingHorizontal: 16 
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/medicines' as any)} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhập hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Tổng Số Lượng</ThemedText>
                <ThemedText style={styles.summaryValue}>{totalQuantity}</ThemedText>
              </View>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Tổng Tiền</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#10b981' }]}>
                  {formatCurrency(totalImportValue)}
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        {/* Add Batch Button */}
        <Button
          title="+ Thêm Lô Hàng"
          onPress={() => setShowModal(true)}
          style={styles.addButton}
        />

        {/* Import Batches List */}
        {importBatches.length > 0 ? (
          <View style={styles.listContainer}>
            <ThemedText style={styles.listTitle}>Danh sách lô hàng ({importBatches.length})</ThemedText>
            {importBatches.map((batch, index) => (
              <Card key={index} style={styles.batchCard}>
                <View style={styles.batchHeader}>
                  <View style={styles.batchInfo}>
                    <ThemedText style={styles.batchName}>{batch.medicineName}</ThemedText>
                    <ThemedText style={styles.batchMeta}>
                      Mã lô: {batch.batchNumber}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveBatch(index)}
                    style={styles.deleteButton}
                  >
                    <ThemedText style={styles.deleteButtonText}>🗑️</ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.batchDetails}>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Số lượng:</ThemedText>
                    <ThemedText style={styles.detailValue}>{batch.quantity}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Giá nhập:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {formatCurrency(batch.unitPrice)}/đơn vị
                    </ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Tổng tiền:</ThemedText>
                    <ThemedText style={[styles.detailValue, { fontWeight: '700' }]}>
                      {formatCurrency(batch.quantity * batch.unitPrice)}
                    </ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>HSD:</ThemedText>
                    <ThemedText style={styles.detailValue}>{batch.expiryDate}</ThemedText>
                  </View>
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Nhà cung cấp:</ThemedText>
                    <ThemedText style={styles.detailValue}>{batch.supplier}</ThemedText>
                  </View>
                </View>
              </Card>
            ))}

            {/* Confirm Button */}
            <Button
              title={`✅ Xác Nhận Nhập Hàng (${totalQuantity} sản phẩm)`}
              onPress={handleConfirmImport}
              style={styles.confirmButton}
            />
          </View>
        ) : (
          <Card style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              Chưa có lô hàng nào được thêm
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Nhấn nút "Thêm Lô Hàng" để bắt đầu
            </ThemedText>
          </Card>
        )}
      </ScrollView>

      {/* Modal Thêm Lô Hàng */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Thêm Lô Hàng Mới</ThemedText>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <ThemedText style={styles.closeButton}>✕</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Tên Thuốc */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Tên Thuốc *</ThemedText>
              <Input
                placeholder="Tên thuốc"
                value={formData.medicineName}
                onChangeText={(value) =>
                  setFormData({ ...formData, medicineName: value })
                }
                style={[
                  styles.input,
                  errors.medicineName && styles.inputError,
                ]}
              />
              {errors.medicineName && (
                <ThemedText style={styles.errorText}>{errors.medicineName}</ThemedText>
              )}
            </View>

            {/* Số Lượng */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Số Lượng *</ThemedText>
              <Input
                placeholder="0"
                value={formData.quantity}
                onChangeText={(value) => setFormData({ ...formData, quantity: value })}
                keyboardType="number-pad"
                style={[styles.input, errors.quantity && styles.inputError]}
              />
              {errors.quantity && (
                <ThemedText style={styles.errorText}>{errors.quantity}</ThemedText>
              )}
            </View>

            {/* Giá Nhập */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Giá Nhập (₫) *</ThemedText>
              <Input
                placeholder="0"
                value={formData.unitPrice}
                onChangeText={(value) => setFormData({ ...formData, unitPrice: value })}
                keyboardType="decimal-pad"
                style={[styles.input, errors.unitPrice && styles.inputError]}
              />
              {errors.unitPrice && (
                <ThemedText style={styles.errorText}>{errors.unitPrice}</ThemedText>
              )}
            </View>

            {/* Mã Lô */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Mã Lô (Tự động)</ThemedText>
              <Input
                placeholder="Tự động tạo"
                value={formData.batchNumber}
                editable={false}
                style={[styles.input, { backgroundColor: isDark ? '#1f2937' : '#e5e7eb', color: '#9ca3af' }]}
              />
            </View>

            {/* Ngày Hết Hạn */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Ngày Hết Hạn *</ThemedText>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    console.log('📅 Date selected:', e.target.value);
                    setFormData({ ...formData, expiryDate: e.target.value });
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    height: '48px',
                    border: `1px solid ${errors.expiryDate ? '#ef4444' : colors.border}`,
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '16px',
                    backgroundColor: isDark ? '#1f2937' : '#FAFAFA',
                    color: colors.text,
                    width: '100%',
                    fontFamily: 'inherit'
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity 
                    onPress={() => {
                      console.log('📅 Date picker button clicked!');
                      setShowDatePicker(true);
                    }}
                    activeOpacity={0.6}
                  >
                    <View style={[
                      styles.input, 
                      styles.datePickerButton,
                      errors.expiryDate && styles.inputError
                    ]}>
                      <MaterialIcons name="calendar-today" size={20} color={colors.text} />
                      <Text style={[styles.dateText, { color: formData.expiryDate ? colors.text : '#9ca3af' }]}>
                        {formData.expiryDate || 'Chọn ngày hết hạn'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                  
                  {Platform.OS === 'ios' && showDatePicker && (
                    <View style={styles.iosDatePickerButtons}>
                      <TouchableOpacity 
                        onPress={() => setShowDatePicker(false)}
                        style={styles.iosDateButton}
                      >
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>Xong</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
              {errors.expiryDate && (
                <ThemedText style={styles.errorText}>{errors.expiryDate}</ThemedText>
              )}
            </View>

            {/* Nhà Cung Cấp */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Nhà Cung Cấp *</ThemedText>
              <Input
                placeholder="Tên nhà cung cấp"
                value={formData.supplier}
                onChangeText={(value) => setFormData({ ...formData, supplier: value })}
                style={[styles.input, errors.supplier && styles.inputError]}
              />
              {errors.supplier && (
                <ThemedText style={styles.errorText}>{errors.supplier}</ThemedText>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <Button
                title="Thêm Lô Hàng"
                onPress={handleAddBatch}
                style={styles.addBatchButton}
              />
              <Button
                title="Hủy"
                onPress={() => setShowModal(false)}
                style={styles.cancelButton}
              />
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>
    </View>
  );
}