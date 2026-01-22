import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const THEME = {
  primary: '#137fec',
  bg: '#f6f7f8',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
  orange: '#f97316',
  orangeBg: '#fff7ed',
  red: '#ef4444',
  green: '#22c55e',
};

export default function LowStockScreen() {
  const router = useRouter();
  const [lowStockList, setLowStockList] = useState<any[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [importQty, setImportQty] = useState('');
  const [importPrice, setImportPrice] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const loadData = () => {
    const all = dataManager.getAllMedicines();
    const low = all.filter(item => {
      const total = item.batches ? item.batches.reduce((sum:number, b:any) => sum + b.quantity, 0) : 0;
      const threshold = typeof item.minStock === 'number' ? item.minStock : 10;
      return total <= threshold; 
    });
    setLowStockList(low);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickImport = (item: any) => {
    setSelectedItem(item);
    setImportQty('');
    setImportPrice(item.price?.toString() || '');
    setShowImportModal(true);
  };

  const confirmImport = () => {
    if (!importQty || parseInt(importQty) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng hợp lệ');
      return;
    }

    if (selectedItem) {
      // Tạo batch mới
      const newBatch = {
        batchNumber: `BATCH-${Date.now()}`,
        quantity: parseInt(importQty),
        importDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 năm
        importPrice: parseFloat(importPrice) || selectedItem.price || 0,
      };

      const updatedBatches = [...(selectedItem.batches || []), newBatch];
      dataManager.updateMedicine(selectedItem.id, { batches: updatedBatches });

      Alert.alert(
        '✅ Nhập hàng thành công',
        `Đã nhập thêm ${importQty} ${selectedItem.unit || 'đơn vị'} ${selectedItem.name}`,
        [{ text: 'OK', onPress: loadData }]
      );
    }

    setShowImportModal(false);
    setSelectedItem(null);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const totalStock = item.batches ? item.batches.reduce((sum:number, b:any) => sum + b.quantity, 0) : 0;
    const isOut = totalStock === 0;
    const showImage = item.image && !failedImages[item.id];

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.cardMain}
            onPress={() => router.push(`/medicines/${item.id}` as any)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.thumbBox}>
                {showImage ? (
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.thumbImage}
                    resizeMode="cover"
                    onError={() => setFailedImages(prev => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <MaterialIcons name="inventory-2" size={24} color={THEME.orange} />
                )}
              </View>
              <View>
                 <Text style={styles.medName}>{item.name}</Text>
                 <Text style={styles.medUnit}>Đơn vị: {item.unit}</Text>
              </View>
            </View>

            <View style={styles.cardRight}>
               <Text style={styles.stockLabel}>Còn lại</Text>
               <Text style={[styles.stockValue, { color: isOut ? THEME.red : THEME.orange }]}>
                 {totalStock}
               </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.importBtn}
              onPress={() => handleQuickImport(item)}
            >
              <MaterialIcons name="add-shopping-cart" size={16} color={THEME.white} />
              <Text style={styles.importBtnText}>Nhập hàng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/medicines' as any)} style={{padding: 4}}>
           <MaterialIcons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sắp hết hàng</Text>
        <TouchableOpacity onPress={() => router.push('/medicines/add' as any)}>
           <MaterialIcons name="add" size={24} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Có <Text style={{fontWeight: 'bold', color: THEME.orange}}>{lowStockList.length}</Text> thuốc dưới định mức tồn kho.
        </Text>
      </View>

      <FlatList
        data={lowStockList}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => item.id}
      />

      {/* Modal Nhập hàng nhanh */}
      <Modal
        visible={showImportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập hàng nhanh</Text>
            
            {selectedItem && (
              <Text style={styles.modalMedName}>{selectedItem.name}</Text>
            )}
            
            <Text style={styles.inputLabel}>Số lượng nhập *</Text>
            <TextInput
              style={styles.input}
              value={importQty}
              onChangeText={setImportQty}
              keyboardType="numeric"
              placeholder="Nhập số lượng"
              placeholderTextColor={THEME.textGray}
            />
            
            <Text style={styles.inputLabel}>Giá nhập (VNĐ)</Text>
            <TextInput
              style={styles.input}
              value={importPrice}
              onChangeText={setImportPrice}
              keyboardType="numeric"
              placeholder="Nhập giá"
              placeholderTextColor={THEME.textGray}
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
                onPress={confirmImport}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: THEME.white, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 50, 
    borderBottomWidth: 1, borderBottomColor: THEME.border 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
  
  summaryBox: { padding: 16, backgroundColor: THEME.orangeBg, margin: 16, borderRadius: 8 },
  summaryText: { color: '#c2410c', fontSize: 14 },

  listContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  
  card: { 
    backgroundColor: THEME.white, borderRadius: 12, 
    borderWidth: 1, borderColor: THEME.border,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16,
  },
  cardLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumbBox: { 
    width: 56, height: 56, borderRadius: 12, backgroundColor: THEME.orangeBg, 
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: THEME.border 
  },
  thumbImage: { width: '100%', height: '100%' },
  medName: { fontSize: 16, fontWeight: '600', color: THEME.text },
  medUnit: { fontSize: 13, color: THEME.textGray },
  
  cardRight: { alignItems: 'flex-end' },
  stockLabel: { fontSize: 12, color: THEME.textGray },
  stockValue: { fontSize: 24, fontWeight: 'bold' },

  cardActions: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: THEME.border,
    padding: 12,
    justifyContent: 'flex-end',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.green,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  importBtnText: { color: THEME.white, fontSize: 13, fontWeight: '600' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: THEME.white, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text, marginBottom: 16, textAlign: 'center' },
  modalMedName: { fontSize: 16, fontWeight: '600', color: THEME.primary, marginBottom: 12, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: THEME.text, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: THEME.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: THEME.text, backgroundColor: THEME.bg },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: THEME.border },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: THEME.textGray },
  confirmBtn: { backgroundColor: THEME.primary },
  confirmBtnText: { fontSize: 14, fontWeight: '600', color: THEME.white },
});