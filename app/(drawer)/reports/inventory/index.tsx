import { dataManager } from '@/services/DataManager';
import { Medicine } from '@/types/medicine';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  redBg: '#fef2f2',
};

type FilterType = 'all' | 'low_stock' | 'expiring';

export default function InventoryReportScreen() {
  const navigation = useNavigation();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, expiring: 0, totalValue: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allMeds = dataManager.getAllMedicines();
    
    let lowStockCount = 0;
    let expiringCount = 0;
    let totalVal = 0;

    const processedMeds = allMeds.map(med => {
        const totalQuantity = med.batches.reduce((sum, b) => sum + b.quantity, 0);
        
        // 1. Kiểm tra sắp hết hàng (tồn <= định mức tối thiểu)
        const isLow = totalQuantity <= med.minStock;
        if (isLow) lowStockCount++;

        // 2. Kiểm tra trạng thái hạn: đã hết / sắp hết / gần hết
        let isExpiring = false;
        let expiryStatus = 'normal'; // 'normal' | 'warning' | 'urgent' | 'expired'
        
        med.batches.forEach(b => {
            if (!b.expiryDate) return;
            const exp = new Date(b.expiryDate).getTime();
            const now = new Date().getTime();
            const sixtyDays = 60 * 24 * 60 * 60 * 1000;
            const ninetyDays = 90 * 24 * 60 * 60 * 1000;
            
            if (exp < now) {
                // Đã qua hạn
                isExpiring = true;
                expiryStatus = 'expired';
            } else if (exp - now < sixtyDays) {
                // Sắp hết hạn (< 60 ngày)
                isExpiring = true;
                if (expiryStatus !== 'expired') expiryStatus = 'urgent';
            } else if (exp - now < ninetyDays) {
                // Gần hết hạn (60-90 ngày)
                isExpiring = true;
                if (expiryStatus !== 'expired' && expiryStatus !== 'urgent') expiryStatus = 'warning';
            }
        });
        if (isExpiring) expiringCount++;

        // 3. Tính giá trị kho
        // FIX LỖI: Sử dụng (med as any) để lấy giá bán (sellPrice) hoặc giá (price)
        // Nếu không có thì mặc định = 0. Giả định giá vốn = 70% giá bán.
        const unitPrice = (med as any).sellPrice || (med as any).price || 0;
        const medValue = med.batches.reduce((sum, b) => sum + (b.quantity * (unitPrice * 0.7)), 0); 
        totalVal += medValue;

        return { ...med, totalQuantity, isLow, isExpiring, expiryStatus };
    });

    setStats({
        totalItems: allMeds.length,
        lowStock: lowStockCount,
        expiring: expiringCount,
        totalValue: totalVal
    });

    setMedicines(processedMeds);
  };

  const getFilteredData = () => {
    if (filter === 'low_stock') return medicines.filter((m: any) => m.isLow);
    if (filter === 'expiring') return medicines.filter((m: any) => m.isExpiring);
    return medicines;
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.medName}>{item.name}</Text>
          <Text style={styles.medSub}>
             Tồn kho: <Text style={{fontWeight: 'bold', color: THEME.text}}>{item.totalQuantity}</Text> {item.unit}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
           {item.isLow && (
               <View style={[styles.tag, { backgroundColor: THEME.orangeBg }]}>
                   <Text style={{ color: THEME.orange, fontSize: 10, fontWeight: 'bold' }}>Sắp hết</Text>
               </View>
           )}
           {item.isExpiring && (
               <View style={[styles.tag, { 
                 backgroundColor: item.expiryStatus === 'expired' ? THEME.redBg : 
                                  item.expiryStatus === 'urgent' ? THEME.redBg : 
                                  '#fff7ed' 
               }]}>
                   <Text style={{ 
                     color: item.expiryStatus === 'expired' ? THEME.red : 
                            item.expiryStatus === 'urgent' ? THEME.red : 
                            THEME.orange, 
                     fontSize: 10, 
                     fontWeight: 'bold' 
                   }}>
                     {item.expiryStatus === 'expired' ? 'Đã hết hạn' : 
                      item.expiryStatus === 'urgent' ? 'Sắp hết hạn' : 
                      'Gần hết hạn'}
                   </Text>
               </View>
           )}
           {!item.isLow && !item.isExpiring && (
               <View style={[styles.tag, { backgroundColor: '#f0fdf4' }]}>
                  <Text style={{fontSize: 10, color: '#16a34a', fontWeight: 'bold'}}>Ổn định</Text>
               </View>
           )}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <MaterialIcons name="menu" size={28} color={THEME.text} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Báo cáo tồn kho</Text>
        </View>
        <TouchableOpacity onPress={loadData}>
           <MaterialIcons name="refresh" size={24} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsGrid}>
          <View style={styles.statBox}>
              <Text style={styles.statLabel}>Tổng giá trị</Text>
              <Text style={[styles.statValue, {color: THEME.primary}]}>
                 {(stats.totalValue/1000000).toFixed(1)} <Text style={{fontSize: 14, color: THEME.textGray}}>tr</Text>
              </Text>
          </View>
          <View style={styles.statBox}>
              <Text style={styles.statLabel}>Mặt hàng</Text>
              <Text style={styles.statValue}>{stats.totalItems}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: THEME.orangeBg }]}>
              <Text style={styles.statLabel}>Sắp hết</Text>
              <Text style={[styles.statValue, {color: THEME.orange}]}>{stats.lowStock}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: THEME.redBg }]}>
              <Text style={styles.statLabel}>Cảnh báo hạn</Text>
              <Text style={[styles.statValue, {color: THEME.red}]}>{stats.expiring}</Text>
          </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, filter === 'all' && styles.activeTab]} onPress={() => setFilter('all')}>
              <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, filter === 'low_stock' && styles.activeTab]} onPress={() => setFilter('low_stock')}>
              <Text style={[styles.tabText, filter === 'low_stock' && styles.activeTabText]}>Sắp hết hàng ({stats.lowStock})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, filter === 'expiring' && styles.activeTab]} onPress={() => setFilter('expiring')}>
              <Text style={[styles.tabText, filter === 'expiring' && styles.activeTabText]}>Hết hạn ({stats.expiring})</Text>
          </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredData()}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
        ListEmptyComponent={
          <View style={{alignItems: 'center', marginTop: 50}}>
            <Text style={{color: THEME.textGray}}>Không có dữ liệu phù hợp</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.white, padding: 16, paddingTop: Platform.OS === 'web' ? 20 : 50, borderBottomWidth: 1, borderColor: THEME.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  statBox: { width: '46%', margin: '2%', backgroundColor: THEME.white, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  statLabel: { fontSize: 12, color: THEME.textGray, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: THEME.text },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, backgroundColor: '#e5e7eb' },
  activeTab: { backgroundColor: THEME.text },
  tabText: { fontSize: 13, color: THEME.textGray, fontWeight: '500' },
  activeTabText: { color: 'white' },
  card: { backgroundColor: THEME.white, borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
  medName: { fontSize: 15, fontWeight: '600', color: THEME.text },
  medSub: { fontSize: 13, color: THEME.textGray, marginTop: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});