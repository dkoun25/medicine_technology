import { useTheme } from '@/context/ThemeContext'; // Import hook
import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  
  // 1. Lấy màu từ Context
  const { colors, isDark } = useTheme();

  // 2. Định nghĩa các màu semantic (màu trạng thái)
  // Các màu này giữ nguyên hue, nhưng background tint sẽ thay đổi theo theme
  const SEMANTIC = {
    red: '#ef4444',
    redBg: isDark ? '#450a0a' : '#fef2f2', // Dark mode dùng màu đỏ đậm làm nền
    orange: '#f97316',
    orangeBg: isDark ? '#431407' : '#fff7ed',
    green: '#22c55e',
    greenBg: isDark ? '#052e16' : '#f0fdf4',
    blueBg: isDark ? '#172554' : '#eff6ff',
    textGray: isDark ? '#9ca3af' : '#617589',
  };

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSku: 0,
    expiring: 0,
    lowStock: 0,
    todayRevenue: 0,
  });
  const [warnings, setWarnings] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const medicines = dataManager.getAllMedicines();
    const lowStockList = dataManager.getLowStockMedicines();
    const expiringList = dataManager.getExpiringMedicines(30);
    const revenue = dataManager.getTodayRevenue();

    setStats({
      totalSku: medicines.length,
      expiring: expiringList.length,
      lowStock: lowStockList.length,
      todayRevenue: revenue,
    });

    const combinedWarnings = [
      ...expiringList.map(m => ({ ...m, type: 'expiring', label: 'Sắp hết hạn', date: m.batches[0]?.expiryDate })),
      ...lowStockList.map(m => ({ ...m, type: 'low_stock', label: 'Sắp hết hàng', stock: m.batches.reduce((s, b) => s + b.quantity, 0) }))
    ].slice(0, 5);
    setWarnings(combinedWarnings);

    setCategoryStats([
      { name: 'Kháng sinh', percent: 70, color: '#137fec' },
      { name: 'Vitamin', percent: 45, color: '#22c55e' },
      { name: 'Giảm đau', percent: 20, color: '#f97316' },
      { name: 'Tiêu hoá', percent: 15, color: '#a855f7' },
    ]);

    setLoading(false);
  };

  // --- Components con ---

  const StatCard = ({ icon, title, value, badge, color, bg, delay }: any) => (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(500)} 
      style={styles.statCardWrapper}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statHeader}>
          <View style={[styles.iconBox, { backgroundColor: bg }]}>
            <MaterialIcons name={icon} size={24} color={color} />
          </View>
          {badge && (
            <View style={[styles.badge, { backgroundColor: bg }]}>
              <Text style={[styles.badgeText, { color: color }]}>{badge}</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={[styles.statTitle, { color: SEMANTIC.textGray }]}>{title}</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        </View>
      </View>
    </Animated.View>
  );

  const ProgressBar = ({ label, percent, color }: any) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <View style={[styles.progressTrack, { backgroundColor: isDark ? '#333' : '#f0f2f4' }]}>
          <View style={[styles.progressBar, { width: `${percent}%`, backgroundColor: color }]} />
        </View>
        <View style={{ minWidth: 70 }}>
           <Text style={[styles.progressLabel, { color: SEMANTIC.textGray }]}>{label}</Text>
           <Text style={[styles.progressValue, { color: colors.text }]}>{percent}%</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity onPress={openDrawer} style={{padding: 4}}>
                <MaterialIcons name="menu" size={28} color={colors.text} />
              </TouchableOpacity>
            )}
            <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
          </View>

          <View style={styles.headerActions}>
             <TouchableOpacity style={styles.iconBtn}>
                <MaterialIcons name="notifications-none" size={24} color={colors.text} />
                <View style={[styles.notiBadge, { backgroundColor: SEMANTIC.red, borderColor: colors.card }]} />
             </TouchableOpacity>
             <View style={[styles.avatar, { borderColor: colors.border }]} />
          </View>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#333' : '#f0f2f4' }]}>
          <MaterialIcons name="search" size={20} color={SEMANTIC.textGray} />
          <TextInput 
            placeholder="Tìm kiếm thuốc, hóa đơn, khách hàng..." 
            placeholderTextColor={SEMANTIC.textGray}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* 1. Summary Cards Grid */}
        <View style={styles.grid}>
          <StatCard 
            icon="inventory" 
            title="Tổng số thuốc" 
            value={stats.totalSku.toLocaleString()} 
            badge="+5 mới" 
            color={colors.primary} 
            bg={SEMANTIC.blueBg} 
            delay={0}
          />
          <StatCard 
            icon="access-alarm" 
            title="Sắp hết hạn" 
            value={stats.expiring} 
            badge="Cấp bách" 
            color={SEMANTIC.red} 
            bg={SEMANTIC.redBg} 
            delay={100}
          />
          <StatCard 
            icon="warning" 
            title="Sắp hết hàng" 
            value={stats.lowStock} 
            badge="Cần nhập" 
            color={SEMANTIC.orange} 
            bg={SEMANTIC.orangeBg} 
            delay={200}
          />
          <StatCard 
            icon="payments" 
            title="Doanh thu" 
            value={`${(stats.todayRevenue / 1000).toFixed(0)}k đ`} 
            badge="+12%" 
            color={SEMANTIC.green} 
            bg={SEMANTIC.greenBg} 
            delay={300}
          />
        </View>

        {/* 2. Charts Section */}
        <View style={styles.chartsRow}>
          {/* Revenue Chart */}
          <Animated.View entering={FadeInDown.delay(400)} style={[styles.card, styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Doanh thu 7 ngày</Text>
                <Text style={[styles.cardSubtitle, { color: SEMANTIC.textGray }]}>Tổng: <Text style={{fontWeight: '700', color: colors.text}}>85tr</Text></Text>
              </View>
              <View style={[styles.dropdown, { backgroundColor: isDark ? '#333' : '#f0f2f4' }]}>
                <Text style={{fontSize: 12, color: colors.text}}>7 ngày</Text>
                <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.text} />
              </View>
            </View>
            
            <LineChart
              data={{
                labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
                datasets: [{ data: [20, 45, 28, 80, 99, 43, 85] }]
              }}
              width={width > 600 ? (width - 64) * 0.6 : width - 64} 
              height={180}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(19, 127, 236, ${opacity})`, // Màu primary
                labelColor: (opacity = 1) => SEMANTIC.textGray,
                style: { borderRadius: 16 },
                propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary },
                propsForBackgroundLines: { stroke: isDark ? '#444' : '#e3e3e3' } 
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16, marginLeft: -10 }}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
            />
          </Animated.View>

          {/* Categories Stock */}
          <Animated.View entering={FadeInDown.delay(500)} style={[styles.card, styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Tồn kho</Text>
                <Text style={[styles.cardSubtitle, { color: SEMANTIC.textGray }]}>Hiện tại</Text>
              </View>
            </View>
            <View style={{gap: 20, marginTop: 10}}>
              {categoryStats.map((cat, idx) => (
                <ProgressBar key={idx} label={cat.name} percent={cat.percent} color={cat.color} />
              ))}
            </View>
          </Animated.View>
        </View>

        {/* 3. Warning Table */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.warningSection}>
          <View style={[styles.cardHeader, { marginBottom: 16 }]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <MaterialIcons name="report" size={24} color={SEMANTIC.red} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cảnh báo cần xử lý</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/medicines?filter=warning' as any)}>
              <Text style={{color: colors.primary, fontWeight: '600'}}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { padding: 0, overflow: 'hidden', backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { backgroundColor: isDark ? '#262626' : '#f8fafc', borderBottomColor: colors.border }]}>
              <Text style={[styles.th, {flex: 2, color: SEMANTIC.textGray}]}>TÊN THUỐC</Text>
              <Text style={[styles.th, {flex: 1, color: SEMANTIC.textGray}]}>SỐ LÔ</Text>
              <Text style={[styles.th, {flex: 1.5, color: SEMANTIC.textGray}]}>TRẠNG THÁI</Text>
              <Text style={[styles.th, {flex: 1, textAlign: 'right', color: SEMANTIC.textGray}]}>HÀNH ĐỘNG</Text>
            </View>

            {/* Table Rows */}
            {warnings.map((item, index) => (
              <Animated.View entering={FadeInRight.delay(700 + index * 100)} key={index} style={[styles.tableRow, { borderBottomColor: isDark ? '#333' : '#f0f2f4' }]}>
                <View style={{flex: 2}}>
                  <Text style={[styles.tdTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.tdSub, { color: SEMANTIC.textGray }]}>{item.unit}</Text>
                </View>
                
                <Text style={[styles.tdText, {flex: 1, color: colors.text }]}>
                  {item.batches[0]?.batchNumber || 'N/A'}
                </Text>

                <View style={{flex: 1.5}}>
                  <View style={[styles.statusBadge, 
                    { backgroundColor: item.type === 'expiring' ? SEMANTIC.redBg : SEMANTIC.orangeBg }
                  ]}>
                    <Text style={[styles.statusText, 
                      { color: item.type === 'expiring' ? SEMANTIC.red : SEMANTIC.orange }
                    ]}>
                      {item.type === 'expiring' ? 'Sắp hết hạn' : 'Sắp hết hàng'}
                    </Text>
                  </View>
                  <Text style={{fontSize: 11, color: SEMANTIC.textGray, marginTop: 2}}>
                    {item.type === 'expiring' 
                      ? `Còn ${Math.floor((new Date(item.date).getTime() - Date.now()) / (1000 * 3600 * 24))} ngày` 
                      : `Tồn: ${item.stock}`}
                  </Text>
                </View>

                <View style={{flex: 1, alignItems: 'flex-end'}}>
                   <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: SEMANTIC.blueBg }]}
                    onPress={() => router.push(`/medicines/${item.id}` as any)}
                   >
                     <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                       {item.type === 'expiring' ? 'Kiểm tra' : 'Nhập'}
                     </Text>
                   </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  header: { 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    paddingTop: Platform.OS === 'web' ? 20 : 50, 
    borderBottomWidth: 1, 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notiBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0', borderWidth: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: 'transparent' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  content: { padding: 16 },

  // Summary Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCardWrapper: { minWidth: 160, flex: 1 }, 
  card: { borderRadius: 12, padding: 16, borderWidth: 1 },
  statCard: { gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconBox: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  statTitle: { fontSize: 12, marginBottom: 4, fontWeight: '500' },
  statValue: { fontSize: 20, fontWeight: 'bold' },

  // Charts
  chartsRow: { gap: 16, marginBottom: 24, flexDirection: 'row', flexWrap: 'wrap' },
  chartCard: { flex: 2, minWidth: 300, paddingRight: 0 }, 
  categoryCard: { flex: 1, minWidth: 250, gap: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 13, marginTop: 2 },
  dropdown: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  
  // Progress Bar
  progressContainer: { gap: 6 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  progressLabel: { fontSize: 12 },
  progressValue: { fontSize: 14, fontWeight: 'bold' },

  // Table
  warningSection: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  tableHeader: { flexDirection: 'row', padding: 12, borderBottomWidth: 1 },
  th: { fontSize: 11, fontWeight: '600' },
  tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, alignItems: 'center' },
  tdTitle: { fontSize: 14, fontWeight: '600' },
  tdSub: { fontSize: 12 },
  tdText: { fontSize: 13 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginBottom: 2 },
  statusText: { fontSize: 11, fontWeight: '600' },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
});