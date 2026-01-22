import { useTheme } from '@/context/ThemeContext';
import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function MedicineDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [medicine, setMedicine] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [importQty, setImportQty] = useState('');
  const [importPrice, setImportPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editActiveIngredient, setEditActiveIngredient] = useState('');
  const [editSupplier, setEditSupplier] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editImage, setEditImage] = useState('');
  const [tempImage, setTempImage] = useState<string | null>(null);

  const SEMANTIC = {
    blueBg: isDark ? '#172554' : '#eff6ff',
    textGray: isDark ? '#9ca3af' : '#617589',
  };

  const loadData = () => {
    const found = dataManager.getAllMedicines().find((m: any) => m.id === id);
    setMedicine(found);
    if (found) {
      setEditName(found.name || '');
      setEditActiveIngredient(found.activeIngredient || '');
      setEditSupplier(found.manufacturer || '');
      setEditCategory(found.category || '');
      const price = found.batches?.[0]?.sellingPrice || 0;
      setEditPrice(price.toString());
      setEditUnit(found.unit || '');
      setEditImage(found.image || '');
      setTempImage(found.image || null);
    }
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        // Create persistent directory for medicine images
        const imageDir = `${FileSystem.documentDirectory}medicine_images/`;
        
        try {
          await FileSystem.getInfoAsync(imageDir);
        } catch {
          await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
        }

        // Save image to persistent location
        const fileName = `${medicine.id}_${Date.now()}.jpg`;
        const persistentUri = `${imageDir}${fileName}`;
        
        await FileSystem.copyAsync({
          from: result.assets[0].uri,
          to: persistentUri,
        });

        setTempImage(persistentUri);
        setEditImage(persistentUri);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể lưu ảnh: ' + (error as any).message);
      }
    }
  };

  const handleEditMedicine = () => {
    if (!editName.trim()) {
      Alert.alert('Lỗi', 'Tên thuốc không được để trống');
      return;
    }

    const updateData = {
      name: editName,
      activeIngredient: editActiveIngredient,
      manufacturer: editSupplier,
      category: editCategory,
      unit: editUnit,
      image: editImage,
    };

    dataManager.updateMedicine(medicine.id, updateData);
    Alert.alert('✅ Cập nhật thành công', 'Thông tin thuốc đã được cập nhật', [
      { text: 'OK', onPress: () => { loadData(); setShowEditModal(false); } }
    ]);
  };

  const handleDeleteMedicine = () => {
    if (!medicine) return;
    const success = dataManager.deleteMedicine(medicine.id);
    if (success) {
      setShowDeleteModal(false);
      router.replace('/medicines' as any);
      setTimeout(() => {
        Alert.alert('✅ Đã xóa', 'Thuốc đã được xóa khỏi hệ thống');
      }, 300);
    } else {
      Alert.alert('Lỗi', 'Không thể xóa thuốc');
    }
  };

  if (!medicine) return <View style={{flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center'}}><Text style={{color: colors.text}}>Đang tải...</Text></View>;

  const totalStock = medicine.batches?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { padding: 8, minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
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

    imagePickerBtn: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border },
    imagePickerPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    previewImage: { width: '100%', height: '100%' },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/medicines' as any)} style={styles.backBtn}>
           <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết thuốc</Text>
        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={styles.backBtn}>
             <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.backBtn}>
             <MaterialIcons name="edit-note" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {medicine ? (
          <>
            {/* Section 1: Thông tin cơ bản */}
            <View style={styles.sectionCard}>
              <View style={styles.mainInfo}>
                <View style={styles.iconBox}>
                   {medicine.image && !failedImages[medicine.id] ? (
                     <Image 
                       source={{ uri: medicine.image.startsWith('http') || medicine.image.startsWith('file://') ? medicine.image : `file://${medicine.image}` }} 
                       style={styles.medImage} 
                       resizeMode="cover"
                       onError={() => setFailedImages(prev => ({ ...prev, [medicine.id]: true }))}
                     />
                   ) : (
                     <MaterialIcons name="medication" size={40} color={colors.primary} />
                   )}
                </View>
                <View style={{flex: 1}}>
                   <Text style={styles.medName}>{medicine.name}</Text>
                   <Text style={styles.medSku}>SKU: {medicine.id}</Text>
                   <View style={styles.priceTag}>
                     <Text style={styles.priceText}>{medicine.batches?.[0]?.sellingPrice?.toLocaleString() || '0'} ₫</Text>
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
                  <Text style={styles.label}>Nhà sản xuất</Text>
                  <Text style={styles.value}>{medicine.manufacturer || 'Chưa cập nhật'}</Text>
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

          </>
        ) : (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40}}>
            <Text style={{color: colors.text}}>Đang tải dữ liệu...</Text>
          </View>
        )}

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
              placeholder={medicine.batches?.[0]?.sellingPrice?.toString() || "Nhập giá"}
              placeholderTextColor={SEMANTIC.textGray}
            />
            
            <Text style={styles.inputLabel}>Ngày hết hạn (YYYY-MM-DD) *</Text>
            {Platform.OS === 'web' ? (
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="2025-12-31"
                placeholderTextColor={SEMANTIC.textGray}
              />
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.input, { justifyContent: 'center', paddingVertical: 12 }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: expiryDate ? colors.text : SEMANTIC.textGray }}>
                    {expiryDate || 'Chọn ngày hết hạn'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={expiryDate ? new Date(expiryDate) : new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setExpiryDate(selectedDate.toISOString().split('T')[0]);
                      }
                      setShowDatePicker(false);
                    }}
                  />
                )}
              </>
            )}
            
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

      {/* Modal Chỉnh sửa thông tin */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1, justifyContent: 'center', padding: 20}}>
            <View style={styles.modalContent}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <MaterialIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Ảnh */}
              <TouchableOpacity 
                style={[styles.imagePickerBtn, { backgroundColor: isDark ? '#1f2937' : '#f0f2f4' }]}
                onPress={pickImage}
              >
                {tempImage ? (
                  <Image source={{ uri: tempImage.startsWith('http') || tempImage.startsWith('file://') ? tempImage : `file://${tempImage}` }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <MaterialIcons name="add-photo-alternate" size={40} color={colors.primary} />
                    <Text style={{color: SEMANTIC.textGray, marginTop: 8}}>Chọn ảnh</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Tên thuốc *</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nhập tên thuốc"
                placeholderTextColor={SEMANTIC.textGray}
              />

              <Text style={styles.inputLabel}>Hoạt chất</Text>
              <TextInput
                style={styles.input}
                value={editActiveIngredient}
                onChangeText={setEditActiveIngredient}
                placeholder="Nhập hoạt chất"
                placeholderTextColor={SEMANTIC.textGray}
              />

              <Text style={styles.inputLabel}>Nhà sản xuất</Text>
              <TextInput
                style={styles.input}
                value={editSupplier}
                onChangeText={setEditSupplier}
                placeholder="Nhập nhà sản xuất"
                placeholderTextColor={SEMANTIC.textGray}
              />

              <Text style={styles.inputLabel}>Danh mục</Text>
              <TextInput
                style={styles.input}
                value={editCategory}
                onChangeText={setEditCategory}
                placeholder="Nhập danh mục"
                placeholderTextColor={SEMANTIC.textGray}
              />

              <Text style={styles.inputLabel}>Giá bán (VNĐ)</Text>
              <TextInput
                style={styles.input}
                value={editPrice}
                onChangeText={setEditPrice}
                keyboardType="numeric"
                placeholder="Nhập giá"
                placeholderTextColor={SEMANTIC.textGray}
              />

              <Text style={styles.inputLabel}>Đơn vị tính</Text>
              <TextInput
                style={styles.input}
                value={editUnit}
                onChangeText={setEditUnit}
                placeholder="Vị dụ: Viên, Hộp..."
                placeholderTextColor={SEMANTIC.textGray}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.confirmBtn]}
                  onPress={handleEditMedicine}
                >
                  <Text style={styles.confirmBtnText}>Cập nhật</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Xóa thuốc */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {maxWidth: 350}]}>
            <MaterialIcons name="warning" size={48} color="#ef4444" style={{alignSelf: 'center', marginBottom: 16}} />
            <Text style={[styles.modalTitle, {color: '#ef4444'}]}>Xác nhận xóa thuốc</Text>
            <Text style={{color: colors.text, textAlign: 'center', marginBottom: 20, lineHeight: 20}}>
              Bạn có chắc chắn muốn xóa <Text style={{fontWeight: 'bold'}}>{medicine.name}</Text> khỏi hệ thống?
            </Text>
            <Text style={{color: SEMANTIC.textGray, fontSize: 13, textAlign: 'center', marginBottom: 20}}>
              ⚠️ Hành động này không thể hoàn tác!
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, {backgroundColor: '#ef4444'}]}
                onPress={handleDeleteMedicine}
              >
                <Text style={styles.confirmBtnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}