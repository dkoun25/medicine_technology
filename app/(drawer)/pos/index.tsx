import { dataManager } from '@/services/DataManager';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// --- THEME ---
const THEME = {
  primary: '#137fec',
  bg: '#f0f2f5',
  white: '#ffffff',
  text: '#111418',
  textGray: '#617589',
  border: '#dbe0e6',
  green: '#22c55e',
  red: '#ef4444',
  blueBg: '#eff6ff',
};

// Lấy chiều rộng màn hình để responsive đơn giản
const { width } = Dimensions.get('window');
const IS_TABLET = width > 768; // Logic đơn giản để check tablet/web

export default function POSScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);

  // 1. Load dữ liệu thuốc
  useEffect(() => {
    const allMedicines = dataManager.getAllMedicines();
    setProducts(allMedicines);
  }, []);

  // 2. Logic Giỏ hàng
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // 3. Tính toán tiền
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return Alert.alert('Lỗi', 'Giỏ hàng đang trống');
    Alert.alert(
      'Xác nhận thanh toán',
      `Tổng tiền: ${totalAmount.toLocaleString()} ₫\nBạn có chắc chắn muốn xuất hóa đơn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Thanh toán', 
          onPress: () => {
            // Tại đây bạn sẽ gọi API lưu hóa đơn
            // dataManager.createInvoice(cart, totalAmount...);
            Alert.alert('Thành công', 'Đã in hóa đơn và trừ kho!');
            clearCart();
          } 
        }
      ]
    );
  };

  // 4. Render Item (Sản phẩm bên trái)
  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => addToCart(item)}
      activeOpacity={0.7}
    >
      <View style={styles.productIcon}>
        <Text style={styles.productInitials}>{item.name.charAt(0)}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price?.toLocaleString()} ₫</Text>
      </View>
      <MaterialIcons name="add-circle" size={24} color={THEME.primary} />
    </TouchableOpacity>
  );

  // Lọc sản phẩm
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      {/* Header Mobile Only (nếu cần) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bán hàng (POS)</Text>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={THEME.textGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên thuốc, mã vạch..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.body}>
        {/* --- CỘT TRÁI: DANH SÁCH THUỐC --- */}
        <View style={styles.leftColumn}>
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productList}
            numColumns={1} 
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* --- CỘT PHẢI: GIỎ HÀNG (Cart) --- */}
        <View style={styles.rightColumn}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Hóa đơn hiện tại</Text>
            <TouchableOpacity onPress={clearCart}>
               <Text style={{color: THEME.red, fontSize: 12}}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.cartList}>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <MaterialIcons name="shopping-cart" size={48} color="#ddd" />
                <Text style={{color: '#999', marginTop: 8}}>Chưa có sản phẩm</Text>
              </View>
            ) : (
              cart.map((item, index) => (
                <Animated.View 
                  key={item.id} 
                  entering={FadeInDown.delay(index * 50)}
                  style={styles.cartItem}
                >
                  <View style={{flex: 1}}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>{item.price?.toLocaleString()} ₫</Text>
                  </View>
                  
                  <View style={styles.qtyControl}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                      <MaterialIcons name="remove" size={16} color={THEME.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                      <MaterialIcons name="add" size={16} color={THEME.text} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{marginLeft: 8}}>
                    <MaterialIcons name="close" size={18} color={THEME.textGray} />
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </ScrollView>

          {/* Footer Thanh toán */}
          <View style={styles.cartFooter}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>{totalAmount.toLocaleString()} ₫</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Chiết khấu:</Text>
              <Text style={styles.summaryValue}>0 ₫</Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.summaryRow, {marginBottom: 16}]}>
              <Text style={styles.totalLabel}>TỔNG TIỀN:</Text>
              <Text style={styles.totalValue}>{totalAmount.toLocaleString()} ₫</Text>
            </View>
            
            <TouchableOpacity style={styles.payButton} onPress={handleCheckout}>
              <Text style={styles.payButtonText}>THANH TOÁN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  
  // Header
  header: { 
    paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, 
    backgroundColor: THEME.white, borderBottomWidth: 1, borderBottomColor: THEME.border 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.text, marginBottom: 12 },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f2f5', 
    borderRadius: 8, paddingHorizontal: 12, height: 44 
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  // Body Layout
  body: { flex: 1, flexDirection: 'column' }, // Mobile mặc định column, Tablet thì row (bạn có thể chỉnh flex-direction theo Dimensions)
  
  leftColumn: { flex: 1, padding: 12 },
  rightColumn: { 
    flex: 1, backgroundColor: THEME.white, borderTopLeftRadius: 16, borderTopRightRadius: 16,
    shadowColor: '#000', shadowOffset: {width: 0, height: -2}, shadowOpacity: 0.1, elevation: 5 
  },

  // Product List Styles
  productList: { paddingBottom: 20 },
  productCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.white,
    padding: 12, borderRadius: 8, marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: THEME.border
  },
  productIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.blueBg,
    alignItems: 'center', justifyContent: 'center'
  },
  productInitials: { color: THEME.primary, fontWeight: 'bold' },
  productName: { fontSize: 14, fontWeight: '600', color: THEME.text },
  productPrice: { fontSize: 13, color: THEME.primary, fontWeight: '500' },

  // Cart Styles
  cartHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: THEME.border 
  },
  cartTitle: { fontWeight: 'bold', fontSize: 16 },
  cartList: { flex: 1, padding: 16 },
  emptyCart: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  
  cartItem: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16, 
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 12
  },
  cartItemName: { fontWeight: '500', fontSize: 14, marginBottom: 4 },
  cartItemPrice: { color: THEME.textGray, fontSize: 12 },
  qtyControl: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f2f5', 
    borderRadius: 4, padding: 2 
  },
  qtyBtn: { padding: 4 },
  qtyText: { paddingHorizontal: 8, fontWeight: '600', minWidth: 24, textAlign: 'center' },

  // Footer Payment
  cartFooter: { padding: 16, backgroundColor: '#f8f9fa', borderTopWidth: 1, borderTopColor: THEME.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: THEME.textGray },
  summaryValue: { fontWeight: '600' },
  divider: { height: 1, backgroundColor: THEME.border, marginVertical: 8 },
  totalLabel: { fontWeight: 'bold', fontSize: 16 },
  totalValue: { fontWeight: 'bold', fontSize: 18, color: THEME.primary },
  
  payButton: { 
    backgroundColor: THEME.primary, borderRadius: 8, height: 48, 
    alignItems: 'center', justifyContent: 'center', marginTop: 8 
  },
  payButtonText: { color: THEME.white, fontWeight: 'bold', fontSize: 16 },
});