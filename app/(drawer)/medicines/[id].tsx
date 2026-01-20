import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert, Image } from 'react-native';
import { dataManager } from '@/services/DataManager';
import { useTheme } from '@/context/ThemeContext';

export default function MedicineDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [medicine, setMedicine] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importQty, setImportQty] = useState('');
  const [importPrice, setImportPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const SEMANTIC = {
    blueBg: isDark ? '#172554' : '#eff6ff',
    textGray: isDark ? '#9ca3af' : '#617589',
  };

  const loadData = () => {
    const found = dataManager.getAllMedicines().find((m: any) => m.id === id);
    setMedicine(found);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleImport = () => {
    if (!importQty || parseInt(importQty) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng hợp lệ');
      return;
    }
    if (!expiryDate) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày hết hạn');
      return;
    }

    const batchNumber = `BATCH-${Date.now()}`;
    const newBatch = {
      batchNumber,
      quantity: parseInt(importQty),
      expiryDate,
      importDate: new Date().toISOString().split('T')[0],
      importPrice: parseFloat(importPrice) || medicine.price || 0,
    };

    const updatedBatches = [...(medicine.batches || []), newBatch];
    dataManager.updateMedicine(medicine.id, { batches: updatedBatches });

    Alert.alert(
      '✅ Nhập hàng thành công',
      `Đã nhập ${importQty} ${medicine.unit || 'đơn vị'}\nLô: ${batchNumber}`,
      [{ text: 'OK', onPress: () => { loadData(); setShowImportModal(false); } }]
    );
    setImportQty('');
    setImportPrice('');
    setExpiryDate('');
  };

  if (!medicine) return <View style={{flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center'}}><Text style={{color: colors.text}}>Đang tải...</Text></View>;

  const totalStock = medicine.batches?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    
    content: { padding: 16, paddingBottom: 100 },
    
    // Section 1 Styles
    sectionCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
    mainInfo: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    iconBox: { width: 72, height: 72, borderRadius: 12, backgroundColor: SEMANTIC.blueBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    medImage: { width: '100%', height: '100%' },
    medName: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    medSku: { fontSize: 13, color: SEMANTIC.textGray, marginBottom: 8 },
    priceTag: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    priceText: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
    unitText: { fontSize: 14, color: SEMANTIC.textGray },
    
    gridInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    infoItem: { width: '45%', gap: 4 },
    label: { fontSize: 12, color: SEMANTIC.textGray },
    value: { fontSize: 14, fontWeight: '500', color: colors.text },
    
    // Section 2 Styles
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
    batchCard: { backgroundColor: colors.card, borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
    batchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    batchNumber: { fontSize: 14, fontWeight: '600', color: colors.text },
    expiryDate: { fontSize: 13, color: SEMANTIC.textGray, marginTop: 2 },
    quantityBox: { alignItems: 'center', backgroundColor: isDark ? '#333' : '#f0f2f4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    quantityLabel: { fontSize: 10, color: SEMANTIC.textGray },
    quantityValue: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    
    // Footer
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.card, padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
    actionBtn: { flexDirection: 'row', backgroundColor: colors.primary, borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center', gap: 8 },
    actionText: { color: colors.card, fontWeight: 'bold', fontSize: 16 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.card, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16, textAlign: 'center' },
    inputLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text, backgroundColor: colors.background },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelBtn: { backgroundColor: isDark ? '#374151' : '#f1f5f9', borderWidth: 1, borderColor: colors.border },
    cancelBtnText: { fontSize: 14, fontWeight: '600', color: SEMANTIC.textGray },
    confirmBtn: { backgroundColor: colors.primary },
    confirmBtnText: { fontSize: 14, fontWeight: '600', color: colors.card },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/medicines' as any)} style={styles.backBtn}>
           <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết thuốc</Text>
        <TouchableOpacity onPress={() => { /* Logic sửa */ }}>
           <MaterialIcons name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Section 1: Thông tin cơ bản */}
        <View style={styles.sectionCard}>
          <View style={styles.mainInfo}>
            <View style={styles.iconBox}>
               {medicine.image ? (
                 <Image source={{ uri: medicine.image }} style={styles.medImage} resizeMode="cover" />
               ) : (
                 <MaterialIcons name="medication" size={40} color={colors.primary} />
               )}
            </View>
            <View style={{flex: 1}}>
               <Text style={styles.medName}>{medicine.name}</Text>
               <Text style={styles.medSku}>SKU: {medicine.id}</Text>
               <View style={styles.priceTag}>
                 <Text style={styles.priceText}>{medicine.price?.toLocaleString()} ₫</Text>
                 <Text style={styles.unitText}>/ {medicine.unit}</Text>
               </View>
            </View>
          </View>

          <View style={styles.gridInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Hoạt chất</Text>
              <Text style={styles.value}>{medicine.activeIngredient || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Nhà cung cấp</Text>
              <Text style={styles.value}>{medicine.supplier || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Tồn kho tổng</Text>
              <Text style={[styles.value, {color: colors.primary, fontWeight: 'bold'}]}>{totalStock}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Danh mục</Text>
              <Text style={styles.value}>{medicine.category || 'Chưa phân loại'}</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Danh sách lô hàng (Batches) */}
        <Text style={styles.sectionTitle}>Lô hàng trong kho</Text>
        
        {medicine.batches && medicine.batches.map((batch: any, index: number) => (
          <View key={index} style={styles.batchCard}>
            <View style={styles.batchRow}>
               <View>
                 <Text style={styles.batchNumber}>Lô: {batch.batchNumber}</Text>
                 <Text style={styles.expiryDate}>Hạn: {new Date(batch.expiryDate).toLocaleDateString('vi-VN')}</Text>
               </View>
               <View style={styles.quantityBox}>
                 <Text style={styles.quantityLabel}>SL</Text>
                 <Text style={styles.quantityValue}>{batch.quantity}</Text>
               </View>
            </View>
          </View>
        ))}

      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
         <TouchableOpacity style={styles.actionBtn} onPress={() => setShowImportModal(true)}>
            <MaterialIcons name="add" size={20} color={colors.card} />
            <Text style={styles.actionText}>Nhập thêm hàng</Text>
         </TouchableOpacity>
      </View>

      {/* Modal Nhập hàng */}
      <Modal
        visible={showImportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập thêm hàng</Text>
            <Text style={{color: colors.primary, fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'center'}}>
              {medicine.name}
            </Text>
            
            <Text style={styles.inputLabel}>Mã lô (Tự động)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1f2937' : '#e5e7eb', color: SEMANTIC.textGray }]}
              value={`BATCH-${Date.now()}`}
              editable={false}
            />
            
            <Text style={styles.inputLabel}>Số lượng nhập *</Text>
            <TextInput
              style={styles.input}
              value={importQty}
              onChangeText={setImportQty}
              keyboardType="numeric"
              placeholder="Nhập số lượng"
              placeholderTextColor={SEMANTIC.textGray}
            />
            
            <Text style={styles.inputLabel}>Giá nhập (VNĐ)</Text>
            <TextInput
              style={styles.input}
              value={importPrice}
              onChangeText={setImportPrice}
              keyboardType="numeric"
              placeholder={medicine.price?.toString() || "Nhập giá"}
              placeholderTextColor={SEMANTIC.textGray}
            />
            
            <Text style={styles.inputLabel}>Ngày hết hạn (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="2025-12-31"
              placeholderTextColor={SEMANTIC.textGray}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowImportModal(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={handleImport}
              >
                <Text style={styles.confirmBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}