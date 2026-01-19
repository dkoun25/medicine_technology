import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
// 1. IMPORT HOOK THEME
import { useTheme } from '@/context/ThemeContext';

// Dữ liệu giả lập
const MOCK_RETURNS = [
  { id: 'TH005', originalInvoice: 'HD00012', customer: 'Nguyễn Văn A', date: '2024-05-21', amount: 50000, reason: 'Khách đổi ý' },
  { id: 'TH006', originalInvoice: 'HD00015', customer: 'Trần Thị B', date: '2024-05-20', amount: 120000, reason: 'Thuốc bị móp hộp' },
];

export default function ReturnsScreen() {
  const router = useRouter();
  // 2. LẤY MÀU TỪ CONTEXT
  const { colors, isDark } = useTheme();
  
  const [returns, setReturns] = useState(MOCK_RETURNS);

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity 
        // Card đổi màu theo theme
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View>
            {/* Mã phiếu: màu text động */}
            <Text style={[styles.code, { color: colors.text }]}>{item.id}</Text>
            <Text style={styles.ref}>Từ hóa đơn: {item.originalInvoice}</Text>
          </View>
          
          {/* Badge Hoàn tiền:
              - Chữ: Luôn đỏ (#ef4444)
              - Nền: Sáng thì đỏ nhạt (#fef2f2), Tối thì đỏ thẫm (#450a0a) 
          */}
          <View style={[styles.refundBadge, { backgroundColor: isDark ? '#450a0a' : '#fef2f2' }]}>
            <Text style={styles.refundText}>- {item.amount.toLocaleString()} ₫</Text>
          </View>
        </View>

        {/* Divider đổi màu theo theme */}
        <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#f0f2f5' }]} />

        <View style={styles.cardBody}>
          <View>
             <Text style={styles.label}>Khách hàng</Text>
             <Text style={[styles.value, { color: colors.text }]}>{item.customer}</Text>
          </View>
          <View style={{alignItems: 'flex-end', flex: 1}}>
             <Text style={styles.label}>Lý do</Text>
             <Text style={[styles.reason, { color: colors.text }]} numberOfLines={1}>{item.reason}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    // Container đổi màu nền
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header đổi màu */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Trả hàng - Hoàn tiền</Text>
          
          {/* Nút Tạo phiếu: Giữ màu đỏ đặc trưng (#ef4444) */}
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: '#ef4444' }]} 
            onPress={() => router.push('/medicines/export-cancel' as any)}
          >
            <MaterialIcons name="keyboard-return" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Tạo phiếu trả</Text>
          </TouchableOpacity>
        </View>

        {/* Search Box đổi màu */}
        <View style={[styles.searchBox, { backgroundColor: isDark ? '#1f2937' : '#f0f2f5' }]}>
          <MaterialIcons name="search" size={20} color="#617589" />
          <TextInput 
            style={[styles.input, { color: colors.text }]} 
            placeholder="Tìm phiếu trả, tên khách..." 
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <FlatList
        data={returns}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, // Xóa bg cứng
  header: { padding: 16, paddingTop: 50, borderBottomWidth: 1 }, // Xóa màu nền cứng
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', gap: 4 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  searchBox: { flexDirection: 'row', borderRadius: 8, paddingHorizontal: 12, height: 40, alignItems: 'center' },
  input: { flex: 1, marginLeft: 8, fontSize: 14 },
  
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#dbe0e6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { fontSize: 16, fontWeight: 'bold' },
  ref: { fontSize: 12, color: '#617589' },
  refundBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  refundText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
  divider: { height: 1, marginVertical: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 10, color: '#617589' },
  value: { fontSize: 14, fontWeight: '500' },
  reason: { fontSize: 14, fontStyle: 'italic' },
});