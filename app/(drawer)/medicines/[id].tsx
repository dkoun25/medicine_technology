import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { dataManager } from '@/services/DataManager';

// --- THEME ---
const THEME = {
  primary: '#137fec',
  bg: '#f6f7f8',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
  blueBg: '#eff6ff',
};

export default function MedicineDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [medicine, setMedicine] = useState<any>(null);

  useEffect(() => {
    // Tìm thuốc theo ID
    const found = dataManager.getAllMedicines().find((m: any) => m.id === id);
    setMedicine(found);
  }, [id]);

  if (!medicine) return <View style={styles.container}><Text>Đang tải...</Text></View>;

  const totalStock = medicine.batches?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <MaterialIcons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết thuốc</Text>
        <TouchableOpacity onPress={() => { /* Logic sửa */ }}>
           <MaterialIcons name="edit" size={20} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Section 1: Thông tin cơ bản */}
        <View style={styles.sectionCard}>
          <View style={styles.mainInfo}>
            <View style={styles.iconBox}>
               <MaterialIcons name="medication" size={40} color={THEME.primary} />
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
              <Text style={styles.value}>Paracetamol 500mg</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Nhà cung cấp</Text>
              <Text style={styles.value}>Dược Hậu Giang</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Tồn kho tổng</Text>
              <Text style={[styles.value, {color: THEME.primary, fontWeight: 'bold'}]}>{totalStock}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Vị trí kệ</Text>
              <Text style={styles.value}>Kệ A - Hàng 2</Text>
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
         <TouchableOpacity style={styles.actionBtn}>
            <MaterialIcons name="add" size={20} color={THEME.white} />
            <Text style={styles.actionText}>Nhập thêm hàng</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: THEME.white, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: THEME.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text },
  
  content: { padding: 16, paddingBottom: 100 },
  
  // Section 1 Styles
  sectionCard: { backgroundColor: THEME.white, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: THEME.border },
  mainInfo: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  iconBox: { width: 72, height: 72, borderRadius: 12, backgroundColor: THEME.blueBg, alignItems: 'center', justifyContent: 'center' },
  medName: { fontSize: 20, fontWeight: 'bold', color: THEME.text, marginBottom: 4 },
  medSku: { fontSize: 13, color: THEME.textGray, marginBottom: 8 },
  priceTag: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  priceText: { fontSize: 18, fontWeight: 'bold', color: THEME.primary },
  unitText: { fontSize: 14, color: THEME.textGray },
  
  gridInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  infoItem: { width: '45%', gap: 4 },
  label: { fontSize: 12, color: THEME.textGray },
  value: { fontSize: 14, fontWeight: '500', color: THEME.text },
  
  // Section 2 Styles
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.text, marginBottom: 12 },
  batchCard: { backgroundColor: THEME.white, borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: THEME.border },
  batchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  batchNumber: { fontSize: 14, fontWeight: '600', color: THEME.text },
  expiryDate: { fontSize: 13, color: THEME.textGray, marginTop: 2 },
  quantityBox: { alignItems: 'center', backgroundColor: '#f0f2f4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  quantityLabel: { fontSize: 10, color: THEME.textGray },
  quantityValue: { fontSize: 16, fontWeight: 'bold', color: THEME.text },
  
  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: THEME.white, padding: 16, borderTopWidth: 1, borderTopColor: THEME.border },
  actionBtn: { flexDirection: 'row', backgroundColor: THEME.primary, borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionText: { color: THEME.white, fontWeight: 'bold', fontSize: 16 },
});