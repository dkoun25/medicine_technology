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
import { useTheme } from '@/context/ThemeContext';

// Lấy chiều rộng màn hình để responsive đơn giản
const { width } = Dimensions.get('window');
const IS_TABLET = width > 768; // Logic đơn giản để check tablet/web

export default function POSScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');

  const SEMANTIC = {
    green: '#22c55e',
    red: '#ef4444',
    blueBg: isDark ? '#172554' : '#eff6ff',
    textGray: isDark ? '#9ca3af' : '#617589',
  };

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
    
    const finalCustomerName = customerName.trim() || 'Khách Vãng Lai';
    
    Alert.alert(
      'Xác nhận thanh toán',
      `Khách hàng: ${finalCustomerName}\nTổng tiền: ${totalAmount.toLocaleString()} ₫\nBạn có chắc chắn muốn xuất hóa đơn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Thanh toán', 
          onPress: () => {
            // Tạo hóa đơn
            const invoice = {
              id: `INV-${Date.now()}`,
              type: 'ban-le',
              customerName: finalCustomerName,
              date: new Date().toISOString(),
              items: cart.map(item => ({
                medicineId: item.id,
                medicineName: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity,
              })),
              totalAmount: totalAmount,
              paymentMethod: 'Tiền mặt',
              status: 'completed',
            };
            
            // Lưu vào localStorage
            const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
            invoices.unshift(invoice);
            localStorage.setItem('invoices', JSON.stringify(invoices));
            
            // Trừ kho
            cart.forEach(item => {
              const medicine = dataManager.getAllMedicines().find(m => m.id === item.id);
              if (medicine && medicine.batches && medicine.batches.length > 0) {
                let remaining = item.quantity;
                const updatedBatches = medicine.batches.map((batch: any) => {
                  if (remaining > 0 && batch.quantity > 0) {
                    const deduct = Math.min(batch.quantity, remaining);
                    remaining -= deduct;
                    return { ...batch, quantity: batch.quantity - deduct };
                  }
                  return batch;
                }).filter((b: any) => b.quantity > 0);
                
                dataManager.updateMedicine(medicine.id, { batches: updatedBatches });
              }
            });
            
            Alert.alert('✅ Thành công', `Hóa đơn ${invoice.id} đã được tạo!\nKhách hàng: ${finalCustomerName}`);
            clearCart();
            setCustomerName('');
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
      <MaterialIcons name="add-circle" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  // Lọc sản phẩm
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.includes(searchQuery)
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    
    // Header
    header: { 
      paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, 
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border 
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
    searchBox: { 
      flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#374151' : '#f0f2f5', 
      borderRadius: 8, paddingHorizontal: 12, height: 44 
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: colors.text },

    // Body Layout
    body: { flex: 1, flexDirection: 'row' },
    leftColumn: { flex: 2, borderRightWidth: 1, borderRightColor: colors.border },
    rightColumn: { flex: 1, backgroundColor: colors.card },

    // Product List
    productList: { padding: 12, gap: 8 },
    productCard: { 
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, 
      borderRadius: 8, padding: 12, gap: 12, borderWidth: 1, borderColor: colors.border 
    },
    productIcon: { 
      width: 40, height: 40, borderRadius: 20, backgroundColor: SEMANTIC.blueBg, 
      alignItems: 'center', justifyContent: 'center' 
    },
    productInitials: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
    productName: { fontSize: 14, fontWeight: '600', color: colors.text },
    productPrice: { fontSize: 13, color: SEMANTIC.textGray, marginTop: 2 },

    // Cart
    cartHeader: { 
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
      padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border 
    },
    cartTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    cartList: { flex: 1, padding: 12 },
    emptyCart: { alignItems: 'center', marginTop: 60 },
    cartItem: { 
      flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8, 
      backgroundColor: isDark ? '#374151' : '#f9fafb', borderRadius: 8 
    },
    cartItemName: { fontSize: 14, fontWeight: '500', color: colors.text },
    cartItemPrice: { fontSize: 12, color: SEMANTIC.textGray, marginTop: 2 },
    qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    qtyBtn: { 
      width: 24, height: 24, borderRadius: 4, backgroundColor: isDark ? '#4b5563' : '#e5e7eb', 
      alignItems: 'center', justifyContent: 'center' 
    },
    qtyText: { fontSize: 14, fontWeight: '600', color: colors.text, minWidth: 20, textAlign: 'center' },

    // Cart Footer
    cartFooter: { 
      padding: 16, borderTopWidth: 1, borderTopColor: colors.border, 
      backgroundColor: isDark ? '#1f2937' : colors.card 
    },
    customerInput: {
      borderWidth: 1, borderColor: colors.border, borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
      color: colors.text, backgroundColor: colors.background, marginBottom: 16
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: SEMANTIC.textGray },
    summaryValue: { fontSize: 14, fontWeight: '500', color: colors.text },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: SEMANTIC.green },
    payButton: { 
      backgroundColor: colors.primary, borderRadius: 8, height: 48, 
      alignItems: 'center', justifyContent: 'center' 
    },
    payButtonText: { color: colors.card, fontSize: 16, fontWeight: 'bold' },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bán hàng (POS)</Text>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={SEMANTIC.textGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên thuốc, mã vạch..."
            placeholderTextColor={SEMANTIC.textGray}
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
               <Text style={{color: SEMANTIC.red, fontSize: 12}}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.cartList}>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <MaterialIcons name="shopping-cart" size={48} color={SEMANTIC.textGray} />
                <Text style={{color: SEMANTIC.textGray, marginTop: 8}}>Chưa có sản phẩm</Text>
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
                      <MaterialIcons name="remove" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                      <MaterialIcons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{marginLeft: 8}}>
                    <MaterialIcons name="close" size={18} color={SEMANTIC.textGray} />
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </ScrollView>

          {/* Footer Thanh toán */}
          <View style={styles.cartFooter}>
            <TextInput
              style={styles.customerInput}
              placeholder="Tên khách hàng (mặc định: Khách Vãng Lai)"
              placeholderTextColor={SEMANTIC.textGray}
              value={customerName}
              onChangeText={setCustomerName}
            />
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