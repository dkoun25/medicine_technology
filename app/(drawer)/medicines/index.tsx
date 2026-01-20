import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

export default function MedicinesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState<any[]>([]);

  // Định nghĩa các màu semantic
  const SEMANTIC = {
    red: '#ef4444',
    redBg: isDark ? '#450a0a' : '#fef2f2',
    orange: '#f97316',
    orangeBg: isDark ? '#431407' : '#fff7ed',
    green: '#22c55e',
    greenBg: isDark ? '#052e16' : '#f0fdf4',
    blueBg: isDark ? '#172554' : '#eff6ff',
    textGray: isDark ? '#9ca3af' : '#617589',
  };

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
    if (quantity === 0) return { label: 'Hết hàng', color: SEMANTIC.red, bg: SEMANTIC.redBg };
    if (quantity <= 10) return { label: 'Sắp hết', color: SEMANTIC.orange, bg: SEMANTIC.orangeBg };
    return { label: 'Còn hàng', color: SEMANTIC.green, bg: SEMANTIC.greenBg };
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
            <MaterialIcons name="medication" size={28} color={colors.primary} />
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

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background 
    },
    
    // Header Styles
    header: { 
      backgroundColor: colors.card, 
      paddingHorizontal: 16, 
      paddingBottom: 16, 
      paddingTop: 50, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.border 
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
      color: colors.text 
    },
    addButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: colors.primary, 
      paddingHorizontal: 12, 
      paddingVertical: 8, 
      borderRadius: 8, 
      gap: 4 
    },
    addButtonText: { 
      color: colors.card, 
      fontWeight: '600', 
      fontSize: 14 
    },
    searchContainer: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: isDark ? '#333333' : '#f0f2f4', 
      borderRadius: 8, 
      paddingHorizontal: 12, 
      height: 44 
    },
    searchInput: { 
      flex: 1, 
      marginLeft: 8, 
      fontSize: 14, 
      color: colors.text 
    },

  // List Styles
  listContent: { 
    padding: 16, 
    gap: 12 
  },
  
  // Card Styles
  card: { 
    flexDirection: 'row',
    backgroundColor: colors.card, 
    borderRadius: 12, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: colors.border, 
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
    backgroundColor: SEMANTIC.blueBg, 
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
    color: colors.text,
    marginBottom: 2
  },
  medSku: { 
    fontSize: 12, 
    color: SEMANTIC.textGray 
  },
  medPrice: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: colors.primary 
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  unitBadge: {
    backgroundColor: isDark ? '#333333' : '#f0f2f4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  unitText: {
    fontSize: 12,
    color: SEMANTIC.textGray
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
    color: SEMANTIC.textGray,
    fontSize: 14
  }
});

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
            <MaterialIcons name="add" size={24} color={colors.card} />
            <Text style={styles.addButtonText}>Thêm mới</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={SEMANTIC.textGray} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Tìm tên thuốc, hoạt chất, SKU..."
            placeholderTextColor={SEMANTIC.textGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={SEMANTIC.textGray} />
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
            <MaterialIcons name="search-off" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Không tìm thấy thuốc nào</Text>
          </View>
        }
      />
    </View>
  );
}