import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
};

export default function LowStockScreen() {
  const router = useRouter();
  const [lowStockList, setLowStockList] = useState<any[]>([]);

  useEffect(() => {
    // Lọc các thuốc có tổng tồn < 10
    const all = dataManager.getAllMedicines();
    const low = all.filter(item => {
      const total = item.batches ? item.batches.reduce((sum:number, b:any) => sum + b.quantity, 0) : 0;
      return total <= 10; 
    });
    setLowStockList(low);
  }, []);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const totalStock = item.batches ? item.batches.reduce((sum:number, b:any) => sum + b.quantity, 0) : 0;
    const isOut = totalStock === 0;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push(`/medicines/${item.id}` as any)}
        >
          <View style={styles.cardLeft}>
            <View style={styles.iconBox}>
               <MaterialIcons name="inventory-2" size={24} color={THEME.orange} />
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
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{padding: 4}}>
           <MaterialIcons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sắp hết hàng</Text>
        <TouchableOpacity onPress={() => router.push('/medicines/add' as any)}>
           <MaterialIcons name="add" size={24} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Có <Text style={{fontWeight: 'bold', color: THEME.orange}}>{lowStockList.length}</Text> thuốc dưới định mức tồn kho (≤ 10).
        </Text>
      </View>

      <FlatList
        data={lowStockList}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => item.id}
      />
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: THEME.white, borderRadius: 12, padding: 16, 
    borderWidth: 1, borderColor: THEME.border 
  },
  cardLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconBox: { 
    width: 48, height: 48, borderRadius: 8, backgroundColor: THEME.orangeBg, 
    alignItems: 'center', justifyContent: 'center' 
  },
  medName: { fontSize: 16, fontWeight: '600', color: THEME.text },
  medUnit: { fontSize: 13, color: THEME.textGray },
  
  cardRight: { alignItems: 'flex-end' },
  stockLabel: { fontSize: 12, color: THEME.textGray },
  stockValue: { fontSize: 24, fontWeight: 'bold' },
});