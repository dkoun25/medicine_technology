import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// --- ĐỊNH NGHĨA THEME (Fix lỗi import) ---
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
  greenBg: '#f0fdf4',
  blueBg: '#eff6ff',
};

export default function MedicinesScreen() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState<any[]>([]);

  // 1. Load dữ liệu ban đầu
  useEffect(() => {
    const data = dataManager.getAllMedicines();
    setMedicines(data);
    setFilteredMedicines(data);
  }, []);

  // 2. Xử lý logic tìm kiếm
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMedicines(medicines);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = medicines.filter(
        (item) => 
          item.name.toLowerCase().includes(lowerQuery) || 
          item.id.toLowerCase().includes(lowerQuery)
      );
      setFilteredMedicines(filtered);
    }
  }, [searchQuery, medicines]);

  // 3. Helper tính trạng thái tồn kho
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Hết hàng', color: THEME.red, bg: THEME.redBg };
    if (quantity <= 10) return { label: 'Sắp hết', color: THEME.orange, bg: THEME.orangeBg };
    return { label: 'Còn hàng', color: THEME.green, bg: THEME.greenBg };
  };

  // 4. Render từng item thuốc
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Tính tổng tồn từ các batch
    const totalStock = item.batches 
      ? item.batches.reduce((sum: number, b: any) => sum + b.quantity, 0) 
      : 0;
      
    const status = getStockStatus(totalStock);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push(`/medicines/${item.id}` as any)}
          activeOpacity={0.7} // Đã sửa lỗi cú pháp tại đây
        >
          {/* Cột trái: Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="medication" size={28} color={THEME.primary} />
          </View>

          {/* Cột phải: Thông tin */}
          <View style={styles.infoContainer}>
            <View style={styles.topRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.medName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.medSku}>SKU: {item.id}</Text>
              </View>
              <Text style={styles.medPrice}>{item.price?.toLocaleString()} ₫</Text>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.unitBadge}>
                 <Text style={styles.unitText}>{item.unit}</Text>
              </View>

              <View style={[styles.stockBadge, { backgroundColor: status.bg }]}>
                <View style={[styles.dot, { backgroundColor: status.color }]} />
                <Text style={[styles.stockText, { color: status.color }]}>
                  {status.label}: <Text style={{fontWeight: 'bold'}}>{totalStock}</Text>
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Danh sách thuốc</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => router.push('/medicines/add' as any)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={24} color={THEME.white} />
            <Text style={styles.addButtonText}>Thêm mới</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={THEME.textGray} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Tìm tên thuốc, hoạt chất, SKU..."
            placeholderTextColor={THEME.textGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={THEME.textGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- LIST VIEW --- */}
      <FlatList
        data={filteredMedicines}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color={THEME.border} />
            <Text style={styles.emptyText}>Không tìm thấy thuốc nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: THEME.bg 
  },
  
  // Header Styles
  header: { 
    backgroundColor: THEME.white, 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    paddingTop: 50, 
    borderBottomWidth: 1, 
    borderBottomColor: THEME.border 
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: THEME.text 
  },
  addButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: THEME.primary, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8, 
    gap: 4 
  },
  addButtonText: { 
    color: THEME.white, 
    fontWeight: '600', 
    fontSize: 14 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f0f2f4', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    height: 44 
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 14, 
    color: THEME.text 
  },

  // List Styles
  listContent: { 
    padding: 16, 
    gap: 12 
  },
  
  // Card Styles
  card: { 
    flexDirection: 'row',
    backgroundColor: THEME.white, 
    borderRadius: 12, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: THEME.border, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    elevation: 1 
  },
  iconContainer: { 
    width: 56, 
    height: 56, 
    borderRadius: 8, 
    backgroundColor: THEME.blueBg, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 12
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 6
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  medName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: THEME.text,
    marginBottom: 2
  },
  medSku: { 
    fontSize: 12, 
    color: THEME.textGray 
  },
  medPrice: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: THEME.primary 
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  unitBadge: {
    backgroundColor: '#f0f2f4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  unitText: {
    fontSize: 12,
    color: THEME.textGray
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12, 
    gap: 4
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500'
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 12
  },
  emptyText: {
    color: THEME.textGray,
    fontSize: 14
  }
});