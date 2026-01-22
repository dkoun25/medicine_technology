import { useTheme } from '@/context/ThemeContext';
import { useInvoices } from '@/hooks/useInvoices';
import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const PURCHASE_ORDERS_KEY = 'purchase_orders';

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { invoices } = useInvoices();
  
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
    revenueChange: 0,
  });
  const [warnings, setWarnings] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [chartLabels, setChartLabels] = useState<string[]>(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
  const [chartTotal, setChartTotal] = useState(0);
  const [period, setPeriod] = useState<'7days' | '1month' | '1year'>('7days');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // Reload khi màn hình focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [invoices, period])
  );

  useEffect(() => {
    loadDashboardData();
  }, [invoices, period]);

  const loadDashboardData = async () => {
    // Lấy purchase orders từ AsyncStorage
    let purchaseOrders: any[] = [];
    try {
      const stored = await AsyncStorage.getItem(PURCHASE_ORDERS_KEY);
      if (stored) {
        purchaseOrders = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    }

    const medicines = dataManager.getAllMedicines();
    const lowStockList = dataManager.getLowStockMedicines();
    
    // Tính toán thuốc sắp hết hạn (≤ 90 ngày) - khớp với expiring screen
    const now = new Date();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const expiringList = medicines.filter(med => {
      const isExpiring = (med.batches || []).some((batch: any) => {
        if (!batch.expiryDate) return false;
        const exp = new Date(batch.expiryDate).getTime();
        const nowTime = now.getTime();
        // Logic: Đã qua ngày hết hạn OR (Chưa hết hạn nhưng còn < 90 ngày)
        return exp < nowTime || (exp - nowTime < ninetyDays && exp > nowTime);
      });
      return isExpiring;
    });
    
    // Tính toán doanh thu chính xác từ database
    let totalRevenue = 0;
    
    // Lọc hóa đơn hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      invDate.setHours(0, 0, 0, 0);
      return invDate.getTime() === today.getTime();
    });
    
    todayInvoices.forEach(invoice => {
      if (invoice.status === 'completed') {
        if (invoice.type === 'retail' || invoice.type === 'wholesale') {
          // Bán lẻ và bán sỉ: Cộng vào doanh thu
          totalRevenue += invoice.total;
        } else if (invoice.type === 'return') {
          // Trả hàng: Trừ ra (hoàn tiền)
          totalRevenue -= invoice.total;
        }
      }
    });

    // Tính purchase orders hôm nay
    const todayPurchaseOrders = purchaseOrders.filter(po => {
      const poDate = new Date(po.createdAt || '');
      poDate.setHours(0, 0, 0, 0);
      return poDate.getTime() === today.getTime();
    });

    todayPurchaseOrders.forEach(po => {
      // Nhập hàng: Trừ ra (chi phí)
      totalRevenue -= po.total;
    });
    
    // Tính phần trăm thay đổi (giả lập so với hôm qua)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      invDate.setHours(0, 0, 0, 0);
      return invDate.getTime() === yesterday.getTime();
    });
    
    let yesterdayRevenue = 0;
    yesterdayInvoices.forEach(invoice => {
      if (invoice.status === 'completed') {
        if (invoice.type === 'retail' || invoice.type === 'wholesale') {
          yesterdayRevenue += invoice.total;
        } else if (invoice.type === 'return') {
          yesterdayRevenue -= invoice.total;
        }
      }
    });

    // Tính purchase orders hôm qua
    const yesterdayPurchaseOrders = purchaseOrders.filter(po => {
      const poDate = new Date(po.createdAt || '');
      poDate.setHours(0, 0, 0, 0);
      return poDate.getTime() === yesterday.getTime();
    });

    yesterdayPurchaseOrders.forEach(po => {
      yesterdayRevenue -= po.total;
    });
    
    const revenueChange = yesterdayRevenue > 0 
      ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0;

    setStats({
      totalSku: medicines.length,
      expiring: expiringList.length,
      lowStock: lowStockList.length,
      todayRevenue: totalRevenue,
      revenueChange: revenueChange,
    });

    // Tính toán doanh thu theo period
    let chartDataPoints: number[] = [];
    let labels: string[] = [];
    let periodTotal = 0;
    
    if (period === '7days') {
      // 7 ngày gần nhất
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() - i);
        targetDate.setHours(0, 0, 0, 0);
        
        const dayInvoices = invoices.filter(inv => {
          const invDate = new Date(inv.createdAt);
          invDate.setHours(0, 0, 0, 0);
          return invDate.getTime() === targetDate.getTime();
        });
        
        let dayRevenue = 0;
        dayInvoices.forEach(invoice => {
          if (invoice.status === 'completed') {
            if (invoice.type === 'retail' || invoice.type === 'wholesale') {
              dayRevenue += invoice.total;
            } else if (invoice.type === 'return') {
              dayRevenue -= invoice.total;
            }
          }
        });

        // Tính purchase orders cho ngày này
        const dayPurchaseOrders = purchaseOrders.filter(po => {
          const poDate = new Date(po.createdAt || '');
          poDate.setHours(0, 0, 0, 0);
          return poDate.getTime() === targetDate.getTime();
        });

        dayPurchaseOrders.forEach(po => {
          dayRevenue -= po.total;
        });
        
        chartDataPoints.push(Math.round(dayRevenue / 1000));
        periodTotal += dayRevenue;
        
        // Label: T2, T3, ...
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        labels.push(dayNames[targetDate.getDay()]);
      }
    } else if (period === '1month') {
      // 30 ngày gần nhất, nhóm theo tuần (4 tuần)
      for (let weekIdx = 3; weekIdx >= 0; weekIdx--) {
        let weekRevenue = 0;
        
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() - (weekIdx * 7 + dayOffset));
          targetDate.setHours(0, 0, 0, 0);
          
          const dayInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.createdAt);
            invDate.setHours(0, 0, 0, 0);
            return invDate.getTime() === targetDate.getTime();
          });
          
          dayInvoices.forEach(invoice => {
            if (invoice.status === 'completed') {
              if (invoice.type === 'retail' || invoice.type === 'wholesale') {
                weekRevenue += invoice.total;
              } else if (invoice.type === 'return') {
                weekRevenue -= invoice.total;
              }
            }
          });

          // Tính purchase orders cho ngày này
          const dayPurchaseOrders = purchaseOrders.filter(po => {
            const poDate = new Date(po.createdAt || '');
            poDate.setHours(0, 0, 0, 0);
            return poDate.getTime() === targetDate.getTime();
          });

          dayPurchaseOrders.forEach(po => {
            weekRevenue -= po.total;
          });
        }
        
        chartDataPoints.push(Math.round(weekRevenue / 1000));
        periodTotal += weekRevenue;
        labels.push(`T${4 - weekIdx}`);
      }
    } else if (period === '1year') {
      // 12 tháng gần nhất
      for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
        const targetMonth = new Date(today);
        targetMonth.setMonth(targetMonth.getMonth() - monthOffset);
        const year = targetMonth.getFullYear();
        const month = targetMonth.getMonth();
        
        let monthRevenue = 0;
        
        invoices.forEach(invoice => {
          const invDate = new Date(invoice.createdAt);
          if (invDate.getFullYear() === year && invDate.getMonth() === month) {
            if (invoice.status === 'completed') {
              if (invoice.type === 'retail' || invoice.type === 'wholesale') {
                monthRevenue += invoice.total;
              } else if (invoice.type === 'return') {
                monthRevenue -= invoice.total;
              }
            }
          }
        });

        // Tính purchase orders cho tháng này
        purchaseOrders.forEach(po => {
          const poDate = new Date(po.createdAt || '');
          if (poDate.getFullYear() === year && poDate.getMonth() === month) {
            monthRevenue -= po.total;
          }
        });
        
        chartDataPoints.push(Math.round(monthRevenue / 1000));
        periodTotal += monthRevenue;
        labels.push(`T${month + 1}`);
      }
    }
    
    setChartData(chartDataPoints.length > 0 ? chartDataPoints : [0]);
    setChartLabels(labels.length > 0 ? labels : ['']);
    setChartTotal(periodTotal);

    const combinedWarnings = [
      ...expiringList.map(m => {
        const earliestBatch = (m.batches || []).reduce((earliest: any, batch: any) => {
          if (!earliest || !batch.expiryDate) return earliest;
          const expEarliest = new Date(earliest.expiryDate).getTime();
          const expBatch = new Date(batch.expiryDate).getTime();
          return expBatch < expEarliest ? batch : earliest;
        }, m.batches?.[0]);
        
        let expiryStatus = 'normal';
        if (earliestBatch?.expiryDate) {
          const exp = new Date(earliestBatch.expiryDate).getTime();
          const nowTime = now.getTime();
          if (exp < nowTime) {
            expiryStatus = 'expired';
          } else if (exp - nowTime < 60 * 24 * 60 * 60 * 1000) {
            expiryStatus = 'urgent';
          } else if (exp - nowTime < 90 * 24 * 60 * 60 * 1000) {
            expiryStatus = 'warning';
          }
        }
        
        return { ...m, type: 'expiring', expiryStatus, label: 'Sắp hết hạn', date: earliestBatch?.expiryDate };
      }),
      ...lowStockList.map(m => ({ ...m, type: 'low_stock', label: 'Sắp hết hàng', stock: (m.batches || []).reduce((s: number, b: any) => s + b.quantity, 0) }))
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

  const StatCard = ({ icon, title, value, badge, color, bg, delay, onPress }: any) => (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(500)} 
      style={styles.statCardWrapper}
    >
      <TouchableOpacity 
        onPress={onPress}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
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
      </TouchableOpacity>
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

  const getPeriodLabel = () => {
    if (period === '7days') return '7 ngày';
    if (period === '1month') return '1 tháng';
    return '1 năm';
  };

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
          </View>
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
            onPress={() => router.push('/(drawer)/medicines' as any)}
          />
          <StatCard 
            icon="access-alarm" 
            title="Sắp hết hạn" 
            value={stats.expiring} 
            badge="Cấp bách" 
            color={SEMANTIC.red} 
            bg={SEMANTIC.redBg} 
            delay={100}
            onPress={() => router.push('/(drawer)/medicines/expiring' as any)}
          />
          <StatCard 
            icon="warning" 
            title="Sắp hết hàng" 
            value={stats.lowStock} 
            badge="Cần nhập" 
            color={SEMANTIC.orange} 
            bg={SEMANTIC.orangeBg} 
            delay={200}
            onPress={() => router.push('/(drawer)/medicines/low-stock' as any)}
          />
          <StatCard 
            icon="payments" 
            title="Doanh thu hôm nay" 
            value={`${stats.todayRevenue >= 0 ? '' : '-'}${Math.abs(stats.todayRevenue).toLocaleString()} đ`} 
            badge={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%`}
            color={stats.todayRevenue >= 0 ? SEMANTIC.green : SEMANTIC.red} 
            bg={stats.todayRevenue >= 0 ? SEMANTIC.greenBg : SEMANTIC.redBg} 
            delay={300}
            onPress={() => router.push('/(drawer)/reports/revenue' as any)}
          />
        </View>

        {/* 2. Charts Section */}
        <Animated.View 
          entering={FadeInDown.delay(400)}
          style={[styles.card, styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <TouchableOpacity 
            onPress={() => router.push('/(drawer)/reports/revenue' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Doanh thu {getPeriodLabel()}</Text>
                <Text style={[styles.cardSubtitle, { color: SEMANTIC.textGray }]}>
                  Tổng: <Text style={{fontWeight: '700', color: chartTotal >= 0 ? SEMANTIC.green : SEMANTIC.red}}>
                    {chartTotal >= 0 ? '' : '-'}{Math.abs(chartTotal).toLocaleString()} đ
                  </Text>
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.dropdown, { backgroundColor: isDark ? '#333' : '#f0f2f4' }]}
                onPress={() => setShowPeriodMenu(!showPeriodMenu)}
              >
                <Text style={{fontSize: 12, color: colors.text}}>{getPeriodLabel()}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.text} />
              </TouchableOpacity>
              {showPeriodMenu && (
                <View style={[styles.periodMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TouchableOpacity 
                    style={[styles.periodMenuItem, period === '7days' && { backgroundColor: SEMANTIC.blueBg }]}
                    onPress={() => { setPeriod('7days'); setShowPeriodMenu(false); }}
                  >
                    <Text style={[styles.periodMenuText, { color: period === '7days' ? colors.primary : colors.text }]}>7 ngày</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodMenuItem, period === '1month' && { backgroundColor: SEMANTIC.blueBg }]}
                    onPress={() => { setPeriod('1month'); setShowPeriodMenu(false); }}
                  >
                    <Text style={[styles.periodMenuText, { color: period === '1month' ? colors.primary : colors.text }]}>1 tháng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodMenuItem, period === '1year' && { backgroundColor: SEMANTIC.blueBg }]}
                    onPress={() => { setPeriod('1year'); setShowPeriodMenu(false); }}
                  >
                    <Text style={[styles.periodMenuText, { color: period === '1year' ? colors.primary : colors.text }]}>1 năm</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <LineChart
              data={{
                labels: chartLabels,
                datasets: [{ data: chartData.length > 0 ? chartData : [0] }]
              }}
              width={width > 600 ? (width - 64) * 0.6 : width - 64} 
              height={180}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(19, 127, 236, ${opacity})`,
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
          </TouchableOpacity>
        </Animated.View>

        {/* 3. Warning Table */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.warningSection}>
          <View style={[styles.cardHeader, { marginBottom: 16 }]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <MaterialIcons name="report" size={24} color={SEMANTIC.red} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cảnh báo cần xử lý</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/medicines/low-stock?filter=warning' as any)}>
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
                  {item.batches?.[0]?.batchNumber || 'N/A'}
                </Text>

                <View style={{flex: 1.5}}>
                  <View style={[styles.statusBadge, 
                    { backgroundColor: 
                        item.type === 'expiring' 
                          ? (item.expiryStatus === 'expired' || item.expiryStatus === 'urgent' ? SEMANTIC.redBg : '#fff7ed')
                          : SEMANTIC.orangeBg
                    }
                  ]}>
                    <Text style={[styles.statusText, 
                      { color: 
                          item.type === 'expiring'
                            ? (item.expiryStatus === 'expired' || item.expiryStatus === 'urgent' ? SEMANTIC.red : SEMANTIC.orange)
                            : SEMANTIC.orange
                      }
                    ]}>
                      {item.type === 'expiring' 
                        ? (item.expiryStatus === 'expired' ? 'Đã hết hạn' : item.expiryStatus === 'urgent' ? 'Sắp hết hạn' : 'Gần hết hạn')
                        : 'Sắp hết hàng'}
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notiBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0', borderWidth: 1 },

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
  periodMenu: { position: 'absolute', top: 40, right: 16, borderRadius: 8, borderWidth: 1, overflow: 'hidden', zIndex: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  periodMenuItem: { paddingHorizontal: 16, paddingVertical: 10, minWidth: 100 },
  periodMenuText: { fontSize: 13, fontWeight: '500' },
  
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