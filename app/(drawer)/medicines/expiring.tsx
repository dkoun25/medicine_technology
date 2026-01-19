import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// --- THEME ---
const THEME = {
  primary: '#137fec',
  bg: '#f6f7f8',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
  red: '#ef4444',
  redBg: '#fef2f2',
  orange: '#f97316',
  orangeBg: '#fff7ed',
  green: '#22c55e',
  blueBg: '#eff6ff',
};

export default function ExpiringMedicinesScreen() {
  const router = useRouter();
  const [expiringList, setExpiringList] = useState<any[]>([]);

  useEffect(() => {
    // Lấy thuốc hết hạn trong 60 ngày tới (Mock logic)
    const data = dataManager.getExpiringMedicines ? dataManager.getExpiringMedicines(60) : [];
    setExpiringList(data);
  }, []);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Lấy batch hết hạn sớm nhất để hiển thị
    const batch = item.batches && item.batches.length > 0 ? item.batches[0] : null;
    if (!batch) return null;

    const expiryDate = new Date(batch.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Màu sắc cảnh báo: < 30 ngày là Đỏ, < 60 ngày là Cam
    const isUrgent = daysLeft <= 30;
    const alertColor = isUrgent ? THEME.red : THEME.orange;
    const alertBg = isUrgent ? THEME.redBg : THEME.orangeBg;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity 
          style={[styles.card, { borderColor: isUrgent ? '#fecaca' : THEME.border }]}
          onPress={() => router.push(`/medicines/${item.id}` as any)}
          activeOpacity={0.8}
        >
          {/* Header Card */}
          <View style={styles.cardHeader}>
            <View style={{flex: 1}}>
               <Text style={styles.medName} numberOfLines={1}>{item.name}</Text>
               <Text style={styles.batchInfo}>Lô: {batch.batchNumber} • Kho: {batch.quantity}</Text>
            </View>
            <View style={[styles.daysBadge, { backgroundColor: alertBg }]}>
              <MaterialIcons name="access-time" size={14} color={alertColor} />
              <Text style={[styles.daysText, { color: alertColor }]}>
                {daysLeft < 0 ? `Quá hạn ${Math.abs(daysLeft)} ngày` : `Còn ${daysLeft} ngày`}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Body Card */}
          <View style={styles.actionRow}>
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Ngày hết hạn</Text>
              <Text style={[styles.dateValue, { color: alertColor }]}>
                {expiryDate.toLocaleDateString('vi-VN')}
              </Text>
            </View>

            {/* Nút hành động nhanh */}
            <View style={{flexDirection: 'row', gap: 8}}>
               <TouchableOpacity style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Đổi trả</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push(`/medicines/${item.id}` as any)}>
                  <Text style={styles.primaryBtnText}>Chi tiết</Text>
               </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={{padding: 4}}>
             <MaterialIcons name="arrow-back" size={24} color={THEME.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cảnh báo hết hạn</Text>
          <View style={{width: 24}} /> 
        </View>
        <Text style={styles.subtitle}>Danh sách thuốc cần xử lý ưu tiên (≤ 60 ngày)</Text>
      </View>

      <FlatList
        data={expiringList}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item, index) => item.id + index}
        ListEmptyComponent={
          <View style={styles.emptyState}>
             <MaterialIcons name="check-circle" size={48} color={THEME.green} />
             <Text style={styles.emptyText}>Tuyệt vời! Không có thuốc nào sắp hết hạn.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.white, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: THEME.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
  subtitle: { fontSize: 13, color: THEME.textGray, marginTop: 4, marginLeft: 4 },
  
  listContent: { padding: 16, gap: 12 },
  card: { backgroundColor: THEME.white, borderRadius: 12, padding: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  medName: { fontSize: 16, fontWeight: '600', color: THEME.text, marginBottom: 4 },
  batchInfo: { fontSize: 12, color: THEME.textGray },
  
  daysBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4 },
  daysText: { fontSize: 12, fontWeight: '700' },
  
  divider: { height: 1, backgroundColor: '#f0f2f4', marginVertical: 12 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateInfo: { justifyContent: 'center' },
  dateLabel: { fontSize: 10, color: THEME.textGray },
  dateValue: { fontSize: 14, fontWeight: '600' },

  secondaryBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: THEME.border },
  secondaryBtnText: { fontSize: 12, fontWeight: '600', color: THEME.textGray },
  primaryBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: THEME.blueBg },
  primaryBtnText: { fontSize: 12, fontWeight: '600', color: THEME.primary },
  
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: THEME.textGray, fontSize: 14 }
});