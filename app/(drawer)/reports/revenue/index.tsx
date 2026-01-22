import { useInvoices } from '@/hooks/useInvoices';
import { Invoice } from '@/types/invoice';
import { PurchaseOrder, getTotalStock } from '@/types/medicine';
import { useMedicineStore } from '@/store/medicineStore';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Modal } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
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

const PURCHASE_ORDERS_KEY = 'purchase_orders';

export default function RevenueScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { invoices: allInvoices, loadInvoices } = useInvoices();
  const medicines = useMedicineStore(state => state.medicines);
  const fetchMedicines = useMedicineStore(state => state.fetchMedicines);
  const [displayInvoices, setDisplayInvoices] = useState<(Invoice | (PurchaseOrder & { type: 'purchase' }))[]>([]);
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, totalOrders: 0 });
  const [chartData, setChartData] = useState<number[]>([0]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartTotal, setChartTotal] = useState(0);
  const [period, setPeriod] = useState<'7days' | '1month' | '1year'>('7days');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantAnswer, setAssistantAnswer] = useState('');

  const getPeriodLabel = () => {
    if (period === '7days') return '7 ngày qua';
    if (period === '1month') return '1 tháng';
    return '1 năm';
  };

  // Reload khi màn hình focus
  useFocusEffect(
    useCallback(() => {
      loadInvoices();
      fetchMedicines();
      loadData();
    }, [loadInvoices, fetchMedicines])
  );

  useEffect(() => {
    loadData();
  }, [allInvoices, period]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const loadData = async () => {
    // Lấy purchase orders từ AsyncStorage
    let purchaseOrders: PurchaseOrder[] = [];
    try {
      const stored = await AsyncStorage.getItem(PURCHASE_ORDERS_KEY);
      if (stored) {
        purchaseOrders = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    }

    // Kết hợp invoices và purchase orders
    const completedInvoices = allInvoices.filter(i => i.status === 'completed');
    const purchaseOrdersWithType = purchaseOrders.map(po => ({
      ...po,
      type: 'purchase' as const,
      createdAt: po.createdAt || new Date().toISOString(),
    }));

    const allTransactions = [...completedInvoices, ...purchaseOrdersWithType];
    
    // 1. Tính toán thống kê cơ bản
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Thứ 2
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    let today = 0, week = 0, month = 0;

    allTransactions.forEach(trans => {
      const transDate = new Date(trans.createdAt);
      let amount = 0;
      
      // Tính toán doanh thu theo loại giao dịch
      if (trans.type === 'retail' || trans.type === 'wholesale') {
        amount = trans.total; // Bán hàng: cộng vào
      } else if (trans.type === 'return' || trans.type === 'purchase') {
        amount = -trans.total; // Trả hàng/Nhập hàng: trừ ra (chi phí)
      }
      
      if (trans.createdAt.startsWith(todayStr)) today += amount;
      if (transDate >= startOfWeek) week += amount;
      if (transDate >= startOfMonth) month += amount;
    });

    setStats({ today, week, month, totalOrders: allTransactions.length });
    setDisplayInvoices(allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    // 2. Chuẩn bị dữ liệu biểu đồ (7 ngày gần nhất)
    // 2. Chuẩn bị dữ liệu biểu đồ giống Dashboard
    const chartPoints: number[] = [];
    const labels: string[] = [];
    let periodTotal = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const getTransAmount = (trans: { type: string; total: number }) => {
      if (trans.type === 'retail' || trans.type === 'wholesale') return trans.total;
      if (trans.type === 'return' || trans.type === 'purchase') return -trans.total;
      return 0;
    };

    if (period === '7days') {
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(startOfToday);
        targetDate.setDate(targetDate.getDate() - i);

        const dayTotal = allTransactions.reduce((sum, trans) => {
          const d = new Date(trans.createdAt);
          d.setHours(0, 0, 0, 0);
          if (d.getTime() === targetDate.getTime()) {
            return sum + getTransAmount(trans);
          }
          return sum;
        }, 0);

        chartPoints.push(Math.round(dayTotal / 1000));
        periodTotal += dayTotal;

        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        labels.push(dayNames[targetDate.getDay()]);
      }
    } else if (period === '1month') {
      for (let weekIdx = 3; weekIdx >= 0; weekIdx--) {
        let weekTotal = 0;

        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const targetDate = new Date(startOfToday);
          targetDate.setDate(targetDate.getDate() - (weekIdx * 7 + dayOffset));
          targetDate.setHours(0, 0, 0, 0);

          const dayTotal = allTransactions.reduce((sum, trans) => {
            const d = new Date(trans.createdAt);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === targetDate.getTime() ? sum + getTransAmount(trans) : sum;
          }, 0);

          weekTotal += dayTotal;
        }

        chartPoints.push(Math.round(weekTotal / 1000));
        periodTotal += weekTotal;
        labels.push(`Tuần ${4 - weekIdx}`);
      }
    } else {
      const currentYear = startOfToday.getFullYear();
      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        const monthStart = new Date(currentYear, monthIdx, 1);
        const monthEnd = new Date(currentYear, monthIdx + 1, 0);

        const monthTotal = allTransactions.reduce((sum, trans) => {
          const d = new Date(trans.createdAt);
          return d >= monthStart && d <= monthEnd ? sum + getTransAmount(trans) : sum;
        }, 0);

        chartPoints.push(Math.round(monthTotal / 1000));
        periodTotal += monthTotal;
        labels.push(`T${monthIdx + 1}`);
      }
    }

    setChartData(chartPoints);
    setChartLabels(labels);
    setChartTotal(periodTotal);
  };

  const renderInvoiceItem = ({ item, index }: { item: (Invoice | (PurchaseOrder & { type: 'purchase' })), index: number }) => {
    const isPurchaseOrder = item.type === 'purchase';
    const isReturn = item.type === 'return';
    const name = isPurchaseOrder ? (item as PurchaseOrder).supplierName || 'Nhà cung cấp' : (item as Invoice).customerName || 'Khách lẻ';
    const typeLabel = isPurchaseOrder ? 'Nhập hàng' : 
                      item.type === 'retail' ? 'Bán lẻ' : 
                      item.type === 'wholesale' ? 'Bán sỉ' : 
                      'Trả hàng';
    const amount = item.total;
    const isExpense = isPurchaseOrder || isReturn;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.iconBox}>
                <MaterialIcons name={isPurchaseOrder ? 'inbox' : 'receipt'} size={20} color={THEME.primary} />
              </View>
              <View>
                <Text style={styles.cardTitle}>{name}</Text>
                <Text style={styles.cardSub}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.amountText, { 
                color: isExpense ? THEME.red : THEME.green 
              }]}>
                {isExpense ? '-' : '+'}{amount.toLocaleString()} đ
              </Text>
              <View style={[styles.badge, { backgroundColor: isPurchaseOrder ? '#fef3c7' : THEME.greenBg }]}>
                <Text style={[styles.badgeText, { color: isPurchaseOrder ? '#b45309' : THEME.green }]}>
                  {typeLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Quick heuristic assistant for revenue insights
  // Quick heuristic assistant for inventory turnover
  const buildSalesMap = (days: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);

    const salesMap = new Map<string, number>();
    displayInvoices.forEach(t => {
      if (t.type !== 'retail' && t.type !== 'wholesale') return;
      const d = new Date(t.createdAt);
      if (d < cutoff) return;
      (t as Invoice).items.forEach(item => {
        const prev = salesMap.get(item.medicineId) || 0;
        salesMap.set(item.medicineId, prev + item.quantity);
      });
    });
    return salesMap;
  };

  const formatSlowMoving = () => {
    if (!medicines || medicines.length === 0) return 'Chưa có dữ liệu thuốc để phân tích.';

    const sales30 = buildSalesMap(30);
    const slowList = medicines
      .map(med => {
        const stock = getTotalStock(med);
        const sold30 = sales30.get(med.id) || 0;
        const daily = sold30 / 30;
        const doh = daily > 0 ? stock / daily : Infinity;
        return { name: med.name, stock, sold30, doh };
      })
      .filter(item => item.stock > 0)
      .sort((a, b) => {
        const va = a.doh === Infinity ? 1e9 : a.doh;
        const vb = b.doh === Infinity ? 1e9 : b.doh;
        return vb - va; // Descending: chậm nhất trước
      })
      .slice(0, 3);

    if (slowList.length === 0) return 'Không có tồn kho để phân tích.';

    const lines = slowList.map(item => {
      const dohText = item.doh === Infinity ? 'chưa bán trong 30 ngày' : `${Math.round(item.doh)} ngày tồn`;
      const hint = item.sold30 === 0 ? 'Đề xuất: chạy khuyến mãi hoặc gom combo.' : 'Đề xuất: xem lại giá bán hoặc trưng bày.';
      return `- ${item.name}: tồn ${item.stock}, bán 30d ${item.sold30}, ${dohText}. ${hint}`;
    });

    return `Top tồn xoay chậm (30 ngày):\n${lines.join('\n')}`;
  };

  const formatDaysOnHand = () => {
    if (!medicines || medicines.length === 0) return 'Chưa có dữ liệu thuốc để phân tích.';
    const sales30 = buildSalesMap(30);

    const withStock = medicines.filter(m => getTotalStock(m) > 0);
    if (withStock.length === 0) return 'Không có tồn kho hiện tại.';

    const totalStock = withStock.reduce((sum, m) => sum + getTotalStock(m), 0);
    const totalSold30 = withStock.reduce((sum, m) => sum + (sales30.get(m.id) || 0), 0);
    const daily = totalSold30 / 30;
    const avgDoh = daily > 0 ? totalStock / daily : Infinity;
    if (avgDoh === Infinity) return '30 ngày qua chưa phát sinh bán ra, khó ước tính days-on-hand.';
    return `Ước tính days-on-hand (bình quân): ${Math.round(avgDoh)} ngày cho toàn kho.`;
  };

  const formatClearance = () => {
    const slow = formatSlowMoving();
    if (slow.startsWith('Chưa') || slow.startsWith('Không')) return slow;
    return `${slow}\nGợi ý hành động: chọn 1-2 mặt hàng trên để giảm giá/flash sale hoặc làm combo với thuốc bán chạy.`;
  };

  const handleAssistantAsk = (intent: 'slow' | 'doh' | 'clearance') => {
    let answer = '';
    if (intent === 'slow') answer = formatSlowMoving();
    else if (intent === 'doh') answer = formatDaysOnHand();
    else answer = formatClearance();
    setAssistantAnswer(answer);
    setShowAssistant(true);
  };

  // Enriched summary metrics (last 30 days)
  const cutoff30 = new Date();
  cutoff30.setDate(cutoff30.getDate() - 29); // include today
  const sales30 = displayInvoices.filter(t => (t.type === 'retail' || t.type === 'wholesale') && new Date(t.createdAt) >= cutoff30);
  const returns30 = displayInvoices.filter(t => t.type === 'return' && new Date(t.createdAt) >= cutoff30);
  const purchases30 = displayInvoices.filter(t => t.type === 'purchase' && new Date(t.createdAt) >= cutoff30);

  const salesTotal30 = sales30.reduce((sum, t) => sum + t.total, 0);
  const purchaseTotal30 = purchases30.reduce((sum, t) => sum + t.total, 0);
  const avgOrderValue30 = sales30.length > 0 ? Math.round(salesTotal30 / sales30.length) : 0;
  const returnRate30 = sales30.length > 0 ? Math.round((returns30.length / sales30.length) * 100) : 0;
  const expenseShare30 = salesTotal30 > 0 ? Math.round((purchaseTotal30 / salesTotal30) * 100) : 0;

  // Top products by quantity in last 30 days
  const topProducts30 = (() => {
    const map = new Map<string, { name: string; qty: number }>();
    sales30.forEach(inv => {
      (inv as Invoice).items.forEach(item => {
        const prev = map.get(item.medicineId) || { name: item.medicineName, qty: 0 };
        prev.qty += item.quantity;
        map.set(item.medicineId, prev);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 3);
  })();

  // Simple 3-day trend
  const trendNote = (() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const dayTotals: number[] = [];
    for (let i = 2; i >= 0; i--) {
      const target = new Date(startOfToday);
      target.setDate(target.getDate() - i);
      const total = sales30.reduce((sum, t) => {
        const d = new Date(t.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === target.getTime() ? sum + t.total : sum;
      }, 0);
      dayTotals.push(total);
    }
    if (dayTotals[2] > dayTotals[1] && dayTotals[1] > dayTotals[0]) return 'Xu hướng: tăng dần 3 ngày.';
    if (dayTotals[2] < dayTotals[1] && dayTotals[1] < dayTotals[0]) return 'Xu hướng: giảm dần 3 ngày.';
    return 'Xu hướng: biến động nhẹ.';
  })();

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => handleAssistantAsk('slow')}>
            <MaterialIcons name="chat" size={24} color={THEME.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { loadInvoices(); }}>
              <MaterialIcons name="refresh" size={24} color={THEME.primary} />
          </TouchableOpacity>
        </View>
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

        {/* Trợ lý tồn kho xoay vòng */}
        <View style={styles.assistantCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="smart-toy" size={20} color={THEME.primary} />
            <Text style={styles.assistantTitle}>Hỏi nhanh AI</Text>
          </View>
          <View style={styles.assistantRow}>
            <TouchableOpacity style={styles.assistantBtn} onPress={() => handleAssistantAsk('slow')}>
              <Text style={styles.assistantBtnText}>Top tồn chậm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.assistantBtn} onPress={() => handleAssistantAsk('doh')}>
              <Text style={styles.assistantBtnText}>Days-on-hand</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.assistantBtn} onPress={() => handleAssistantAsk('clearance')}>
              <Text style={styles.assistantBtnText}>Gợi ý xả hàng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tổng quan nâng cao */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Tổng quan 30 ngày gần đây</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="payments" size={18} color={THEME.textGray} />
            <Text style={styles.infoText}>Giá trị đơn trung bình: <Text style={styles.infoValue}>{avgOrderValue30.toLocaleString()} ₫</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="undo" size={18} color={THEME.textGray} />
            <Text style={styles.infoText}>Tỷ lệ trả hàng: <Text style={styles.infoValue}>{returnRate30}%</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="inventory" size={18} color={THEME.textGray} />
            <Text style={styles.infoText}>Tỷ trọng chi phí nhập: <Text style={styles.infoValue}>{expenseShare30}%</Text></Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="trending-up" size={18} color={THEME.textGray} />
            <Text style={styles.infoText}>{trendNote}</Text>
          </View>
          {topProducts30.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.infoSubTitle}>Top sản phẩm bán chạy</Text>
              {topProducts30.map(p => (
                <View key={p.name} style={styles.infoRow}>
                  <MaterialIcons name="local-pharmacy" size={18} color={THEME.textGray} />
                  <Text style={styles.infoText}>{p.name}: <Text style={styles.infoValue}>{p.qty}</Text> đơn vị</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Biểu đồ doanh thu giống Dashboard */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.sectionTitle}>Doanh thu {getPeriodLabel()}</Text>
              <Text style={styles.chartTotalLabel}>
                Tổng: <Text style={{ fontWeight: '700', color: chartTotal >= 0 ? THEME.green : THEME.red }}>
                  {chartTotal >= 0 ? '' : '-'}{Math.abs(chartTotal).toLocaleString()} đ
                </Text>
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowPeriodMenu(!showPeriodMenu)}
            >
              <Text style={{fontSize: 12, color: THEME.text}}>{getPeriodLabel()}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={16} color={THEME.text} />
            </TouchableOpacity>
            {showPeriodMenu && (
              <View style={styles.periodMenu}>
                <TouchableOpacity 
                  style={[styles.periodMenuItem, period === '7days' && { backgroundColor: THEME.blueBg }]}
                  onPress={() => { setPeriod('7days'); setShowPeriodMenu(false); }}
                >
                  <Text style={[styles.periodMenuText, { color: period === '7days' ? THEME.primary : THEME.text }]}>7 ngày</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.periodMenuItem, period === '1month' && { backgroundColor: THEME.blueBg }]}
                  onPress={() => { setPeriod('1month'); setShowPeriodMenu(false); }}
                >
                  <Text style={[styles.periodMenuText, { color: period === '1month' ? THEME.primary : THEME.text }]}>1 tháng</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.periodMenuItem, period === '1year' && { backgroundColor: THEME.blueBg }]}
                  onPress={() => { setPeriod('1year'); setShowPeriodMenu(false); }}
                >
                  <Text style={[styles.periodMenuText, { color: period === '1year' ? THEME.primary : THEME.text }]}>1 năm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <LineChart
            data={{ labels: chartLabels, datasets: [{ data: chartData.length > 0 ? chartData : [0] }] }}
            width={width > 600 ? (width - 64) * 0.6 : width - 64}
            height={180}
            chartConfig={{
              backgroundColor: THEME.white,
              backgroundGradientFrom: THEME.white,
              backgroundGradientTo: THEME.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(19, 127, 236, ${opacity})`,
              labelColor: () => THEME.textGray,
              style: { borderRadius: 16 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: THEME.primary },
              propsForBackgroundLines: { stroke: '#e3e3e3' }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16, marginLeft: -10 }}
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
          />
        </View>

        {/* Danh sách hóa đơn */}
        <Text style={styles.sectionTitle}>Giao dịch gần đây ({stats.totalOrders})</Text>
        {displayInvoices.map((item, index) => (
            <View key={item.id}>
                {renderInvoiceItem({ item, index })}
            </View>
        ))}
      </ScrollView>

      {/* Assistant modal */}
      <Modal
        visible={showAssistant}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAssistant(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Trợ lý báo cáo</Text>
            <Text style={{ color: THEME.text, marginTop: 12 }}>{assistantAnswer}</Text>
            <View style={[styles.modalActions, { marginTop: 20 }]}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowAssistant(false)}>
                <Text style={styles.cancelBtnText}>Đóng</Text>
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
  header: { backgroundColor: THEME.white, padding: 16, paddingTop: Platform.OS === 'web' ? 20 : 50, borderBottomWidth: 1, borderColor: THEME.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text, letterSpacing: 0.2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: THEME.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  statLabel: { fontSize: 13, color: THEME.textGray, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', letterSpacing: 0.2 },
  chartContainer: { backgroundColor: THEME.white, borderRadius: 12, padding: 16, marginBottom: 20 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, position: 'relative', zIndex: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.text, letterSpacing: 0.2 },
  chartTotalLabel: { fontSize: 13, color: THEME.textGray, marginTop: 2 },
  dropdown: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0f2f4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: THEME.border },
  periodMenu: { position: 'absolute', top: 40, right: 0, backgroundColor: THEME.white, borderRadius: 8, borderWidth: 1, borderColor: THEME.border, width: 140, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, zIndex: 10, elevation: 6 },
  periodMenuItem: { paddingVertical: 10, paddingHorizontal: 12 },
  periodMenuText: { fontSize: 13, fontWeight: '600' },
  // List Item Styles
  card: { backgroundColor: THEME.white, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: THEME.border },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.blueBg, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: THEME.text, letterSpacing: 0.2 },
  cardSub: { fontSize: 12, color: THEME.textGray, lineHeight: 18 },
  amountText: { fontSize: 15, fontWeight: 'bold', color: THEME.primary, letterSpacing: 0.2 },
  badge: { backgroundColor: THEME.greenBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  badgeText: { color: THEME.green, fontSize: 10, fontWeight: '600' },

  // Enriched summary styles
  infoCard: { backgroundColor: THEME.white, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.border },
  infoTitle: { fontSize: 16, fontWeight: '700', color: THEME.text, letterSpacing: 0.2 },
  infoSubTitle: { fontSize: 13, fontWeight: '700', color: THEME.textGray, marginTop: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  infoText: { color: THEME.text, lineHeight: 20, letterSpacing: 0.2 },
  infoValue: { fontWeight: '700', color: THEME.text },

  assistantCard: { marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, backgroundColor: THEME.white, gap: 12 },
  assistantTitle: { fontWeight: '700', color: THEME.text },
  assistantRow: { flexDirection: 'row', gap: 8 },
  assistantBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: THEME.primary },
  assistantBtnText: { color: THEME.white, textAlign: 'center', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { width: '80%', backgroundColor: THEME.white, borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: THEME.text },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: THEME.border },
  cancelBtn: { backgroundColor: THEME.bg },
  cancelBtnText: { color: THEME.text, fontWeight: '600' }
});