import { Invoice } from '@/types/invoice';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const THEME = {
  primary: '#137fec',
  bg: '#f6f7f8',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
  green: '#22c55e',
  red: '#ef4444',
};

export default function DebugCleanScreen() {
  const router = useRouter();
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const invoicesData = await AsyncStorage.getItem('invoices');
      const invoices = invoicesData ? JSON.parse(invoicesData) : [];

      let report = '=== KIỂM TRA DATABASE ===\n\n';

      // Phân tích
      const returnInvoices = invoices.filter((inv: Invoice) => inv.type === 'return');
      const retailInvoices = invoices.filter((inv: Invoice) => inv.type === 'retail');

      report += `📊 TỔNG HỢP:\n`;
      report += `• Hóa đơn bán lẻ: ${retailInvoices.length}\n`;
      report += `• Phiếu trả hàng: ${returnInvoices.length}\n\n`;

      // Tính stats
      const customerStats = new Map();

      retailInvoices.forEach((inv: Invoice) => {
        const customer = inv.customerName || 'Khách Vãng Lai';
        const qty = inv.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        if (!customerStats.has(customer)) {
          customerStats.set(customer, { purchased: 0, returned: 0 });
        }
        customerStats.get(customer).purchased += qty;
      });

      returnInvoices.forEach((inv: Invoice) => {
        const customer = inv.customerName || 'Khách Vãng Lai';
        const qty = inv.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        if (!customerStats.has(customer)) {
          customerStats.set(customer, { purchased: 0, returned: 0 });
        }
        customerStats.get(customer).returned += qty;
      });

      report += '📋 THỐNG KÊ KHÁCH HÀNG:\n';
      let willRemove = 0;
      let willKeep = 0;

      Array.from(customerStats.entries()).forEach(([customer, stats]) => {
        const remaining = stats.purchased - stats.returned;
        const status = remaining === 0 ? '✅ Trả hết' : `⚠️ Còn ${remaining}`;

        report += `\n${customer}:\n`;
        report += `  Mua: ${stats.purchased} | Trả: ${stats.returned} | ${status}\n`;

        if (remaining === 0) {
          willRemove++;
          report += `  🗑️ SẼ XÓA hóa đơn bán của khách này\n`;
        } else {
          willKeep++;
          report += `  ✅ GIỮ LẠI hóa đơn bán của khách này\n`;
        }
      });

      report += `\n\n🧹 DỌN SÁCH:\n`;
      report += `• Xóa: ${willRemove} khách hàng đã trả hết\n`;
      report += `• Giữ: ${willKeep} khách hàng còn chưa trả hết\n`;

      setReport(report);
    } catch (error) {
      setReport(`❌ Lỗi: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const cleanDatabase = async () => {
    Alert.alert(
      'Xác nhận dọn dữ liệu?',
      'Sẽ xóa hóa đơn test của khách đã trả hết hàng',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Dọn dữ liệu',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const invoicesData = await AsyncStorage.getItem('invoices');
              const invoices = invoicesData ? JSON.parse(invoicesData) : [];

              const returnInvoices = invoices.filter((inv: Invoice) => inv.type === 'return');
              const retailInvoices = invoices.filter((inv: Invoice) => inv.type === 'retail');

              const customerStats = new Map();
              retailInvoices.forEach((inv: Invoice) => {
                const customer = inv.customerName || 'Khách Vãng Lai';
                const qty = inv.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                if (!customerStats.has(customer)) {
                  customerStats.set(customer, { purchased: 0, returned: 0 });
                }
                customerStats.get(customer).purchased += qty;
              });

              returnInvoices.forEach((inv: Invoice) => {
                const customer = inv.customerName || 'Khách Vãng Lai';
                const qty = inv.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                if (!customerStats.has(customer)) {
                  customerStats.set(customer, { purchased: 0, returned: 0 });
                }
                customerStats.get(customer).returned += qty;
              });

              // Xóa hóa đơn bán của khách đã trả hết
              const keptInvoices = invoices.filter((inv: Invoice) => {
                if (inv.type === 'retail') {
                  const customer = inv.customerName || 'Khách Vãng Lai';
                  const stats = customerStats.get(customer);
                  return stats && stats.purchased > stats.returned;
                }
                return true;
              });

              const removed = invoices.length - keptInvoices.length;
              await AsyncStorage.setItem('invoices', JSON.stringify(keptInvoices));

              setReport((prev) => prev + `\n\n✨ DỌN XONG!\n• Xóa: ${removed} hóa đơn\n• Giữ: ${keptInvoices.length} hóa đơn`);

              setTimeout(() => {
                Alert.alert('✅ Thành công', `Đã xóa ${removed} hóa đơn test`, [
                  { text: 'Quay lại', onPress: () => router.back() },
                ]);
              }, 1000);
            } catch (error) {
              Alert.alert('❌ Lỗi', `${error}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <MaterialIcons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔧 Debug - Dọn Dữ Liệu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.reportText}>{report}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={checkDatabase}
          disabled={loading}
        >
          <MaterialIcons name="refresh" size={20} color={THEME.primary} />
          <Text style={styles.btnSecondaryText}>Kiểm tra lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={cleanDatabase}
          disabled={loading}
        >
          <MaterialIcons name="delete-sweep" size={20} color="white" />
          <Text style={styles.btnPrimaryText}>Dọn dữ liệu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.text },
  content: { flex: 1, padding: 16 },
  reportText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: THEME.text,
    lineHeight: 20,
    backgroundColor: THEME.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: THEME.white,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 8,
  },
  btnPrimary: { backgroundColor: THEME.red },
  btnPrimaryText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  btnSecondary: { backgroundColor: THEME.white, borderWidth: 1, borderColor: THEME.border },
  btnSecondaryText: { color: THEME.primary, fontWeight: 'bold', fontSize: 14 },
});
