import { dataManager } from '@/services/DataManager';
import { Invoice } from '@/types/invoice';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const THEME = {
  primary: '#137fec',
  bg: '#f6f7f8',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
  green: '#22c55e',
  greenBg: '#f0fdf4',
  red: '#ef4444',
  blueBg: '#eff6ff',
};

export default function RevenueScreen() {
  const navigation = useNavigation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, totalOrders: 0 });
  const [chartData, setChartData] = useState<{ day: string; value: number; height: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allInvoices = dataManager.getAllInvoices().filter(i => i.status === 'completed');
    
    // 1. Tính toán thống kê cơ bản
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Thứ 2
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    let today = 0, week = 0, month = 0;

    allInvoices.forEach(inv => {
      const invDate = new Date(inv.createdAt);
      if (inv.createdAt.startsWith(todayStr)) today += inv.total;
      if (invDate >= startOfWeek) week += inv.total;
      if (invDate >= startOfMonth) month += inv.total;
    });

    setStats({ today, week, month, totalOrders: allInvoices.length });
    setInvoices(allInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    // 2. Chuẩn bị dữ liệu biểu đồ (7 ngày gần nhất)
    const chart = [];
    const maxVal = Math.max(...allInvoices.map(i => i.total)) || 1000000; // Tránh chia cho 0
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
        
        const dayTotal = allInvoices
            .filter(inv => inv.createdAt.startsWith(dStr))
            .reduce((sum, inv) => sum + inv.total, 0);
            
        // Chiều cao cột (tối đa 100px)
        const height = (dayTotal / (dayTotal > 0 ? dayTotal * 1.5 : 1000000)) * 100 + 20; 
        // Logic đơn giản để demo chiều cao
        const normalizedHeight = dayTotal === 0 ? 5 : Math.min((dayTotal / (week || 1)) * 200, 120);

        chart.push({ day: dayLabel, value: dayTotal, height: normalizedHeight });
    }
    setChartData(chart);
  };

  const renderInvoiceItem = ({ item, index }: { item: Invoice, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.iconBox}>
              <MaterialIcons name="receipt" size={20} color={THEME.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>{item.customerName || 'Khách lẻ'}</Text>
              <Text style={styles.cardSub}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amountText}>+{item.total.toLocaleString()} đ</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Hoàn thành</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <MaterialIcons name="menu" size={28} color={THEME.text} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Báo cáo doanh thu</Text>
        </View>
        <TouchableOpacity onPress={loadData}>
            <MaterialIcons name="refresh" size={24} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Tổng quan Cards */}
        <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: THEME.primary }]}>
                <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>Hôm nay</Text>
                <Text style={[styles.statValue, { color: 'white' }]}>{stats.today.toLocaleString()} ₫</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Tháng này</Text>
                <Text style={[styles.statValue, { color: THEME.text }]}>{stats.month.toLocaleString()} ₫</Text>
            </View>
        </View>

        {/* Biểu đồ đơn giản (CSS Bar Chart) */}
        <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Biểu đồ 7 ngày qua</Text>
            <View style={styles.chartArea}>
                {chartData.map((d, index) => (
                    <View key={index} style={styles.barWrapper}>
                        <Text style={styles.barValue}>{d.value > 0 ? (d.value/1000).toFixed(0) + 'k' : ''}</Text>
                        <View style={[styles.bar, { height: d.height, backgroundColor: d.value > 0 ? THEME.primary : '#e5e7eb' }]} />
                        <Text style={styles.barLabel}>{d.day}</Text>
                    </View>
                ))}
            </View>
        </View>

        {/* Danh sách hóa đơn */}
        <Text style={styles.sectionTitle}>Giao dịch gần đây ({stats.totalOrders})</Text>
        {invoices.map((item, index) => (
            <View key={item.id}>
                {renderInvoiceItem({ item, index })}
            </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { backgroundColor: THEME.white, padding: 16, paddingTop: Platform.OS === 'web' ? 20 : 50, borderBottomWidth: 1, borderColor: THEME.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: THEME.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  statLabel: { fontSize: 13, color: THEME.textGray, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  chartContainer: { backgroundColor: THEME.white, borderRadius: 12, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.text, marginBottom: 12 },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingBottom: 10 },
  barWrapper: { alignItems: 'center', width: 30 },
  bar: { width: 12, borderRadius: 6, marginBottom: 6 },
  barLabel: { fontSize: 10, color: THEME.textGray },
  barValue: { fontSize: 9, color: THEME.textGray, marginBottom: 2 },
  // List Item Styles
  card: { backgroundColor: THEME.white, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: THEME.border },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.blueBg, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: THEME.text },
  cardSub: { fontSize: 12, color: THEME.textGray },
  amountText: { fontSize: 15, fontWeight: 'bold', color: THEME.primary },
  badge: { backgroundColor: THEME.greenBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  badgeText: { color: THEME.green, fontSize: 10, fontWeight: '600' }
});