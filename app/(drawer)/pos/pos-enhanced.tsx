import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { useMedicinesData } from '@/hooks/useMedicines';
import { formatCurrency } from '@/utils/formatters';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Modal, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';

interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface PaymentInfo {
  subtotal: number;
  discount: number;
  discountPercent: number;
  tax: number;
  total: number;
}

export default function POSScreen() {
  const colorScheme = useColorScheme();
  const { medicines } = useMedicinesData();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('0');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [note, setNote] = useState('');

  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const router = useRouter();
  const { width } = Dimensions.get('window');
  const isTablet = width > 768;

  // Filter medicines based on search - calculate total stock from batches
  const filteredMedicines = medicines.filter(med => {
    const totalStock = med.batches?.reduce((sum, b) => sum + b.quantity, 0) || 0;
    return med.name.toLowerCase().includes(searchQuery.toLowerCase()) && totalStock > 0;
  });

  // Add to cart
  const addToCart = (medicine: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item =>
          item.id === medicine.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: medicine.id,
          name: medicine.name,
          unitPrice: medicine.batches?.[0]?.sellingPrice || 0,
          quantity: 1,
          total: medicine.batches?.[0]?.sellingPrice || 0,
        },
      ];
    });
    setShowProductModal(false);
  };

  // Update quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.unitPrice,
            }
          : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculate payment info
  const calculatePayment = (): PaymentInfo => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discountValue = subtotal * (parseFloat(discountPercent) / 100);
    const afterDiscount = subtotal - discountValue;
    const tax = afterDiscount * 0.1; // 10% tax
    const total = afterDiscount + tax;

    return {
      subtotal,
      discount: discountValue,
      discountPercent: parseFloat(discountPercent),
      tax,
      total,
    };
  };

  const payment = calculatePayment();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('❌ Giỏ hàng trống');
      return;
    }

    const receipt = {
      id: `HĐ${Date.now()}`,
      customer: customerName || 'Khách lẻ',
      items: cart,
      subtotal: payment.subtotal,
      discount: payment.discount,
      tax: payment.tax,
      total: payment.total,
      paymentMethod,
      note,
      timestamp: new Date().toISOString(),
    };

    console.log('Receipt:', receipt);
    alert(`✅ Bán hàng thành công!\nHoá đơn: ${receipt.id}\nTổng tiền: ${formatCurrency(payment.total)}`);
    
    // Reset
    setCart([]);
    setCustomerName('');
    setDiscountPercent('0');
    setNote('');
    setShowPaymentModal(false);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.mainContent}>
        {/* Left: Product List */}
        <View style={styles.productPanel}>
          <ScrollView contentContainerStyle={styles.productContent}>
            <View style={styles.header}>
              <ThemedText style={styles.title}>🛒 Bán Hàng POS</ThemedText>
              <TouchableOpacity
                onPress={() => router.push('/medicines' as any)}
                style={styles.navButton}
              >
                <ThemedText style={styles.navButtonText}>📦 Kho thuốc</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Input
                placeholder="🔍 Tìm kiếm thuốc..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
              <Button
                title="+ Thêm"
                onPress={() => setShowProductModal(true)}
                style={styles.addButton}
              />
            </View>

            {/* Products Grid */}
            <View style={styles.productsGrid}>
              {filteredMedicines.map(medicine => {
                const totalStock = medicine.batches?.reduce((sum, b) => sum + b.quantity, 0) || 0;
                const price = medicine.batches?.[0]?.sellingPrice || 0;
                return (
                <TouchableOpacity
                  key={medicine.id}
                  onPress={() => addToCart(medicine)}
                  style={[styles.productCard, { borderColor: colors.border, width: isTablet ? '31%' : '48%' }]}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.productName} numberOfLines={2}>
                    {medicine.name}
                  </ThemedText>
                  <ThemedText style={styles.productPrice}>
                    {formatCurrency(price)}
                  </ThemedText>
                  <ThemedText style={styles.productStock}>
                    Còn: {totalStock}
                  </ThemedText>
                  <View style={styles.addToCartBtn}>
                    <ThemedText style={{ fontWeight: '600', color: '#fff' }}>Chọn</ThemedText>
                  </View>
                </TouchableOpacity>
              );})}
            </View>
          </ScrollView>
        </View>

        {/* Right: Cart */}
        <View style={styles.cartPanel}>
          <View style={styles.cartHeader}>
            <ThemedText style={styles.cartTitle}>🧾 Hoá Đơn</ThemedText>
            {cart.length > 0 && (
              <TouchableOpacity onPress={() => setCart([])}>
                <ThemedText style={{ color: '#ef4444', fontWeight: '600' }}>Xóa All</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.cartItems}>
            {cart.length > 0 ? (
              cart.map(item => (
                <Card key={item.id} style={styles.cartItem}>
                  <View style={styles.itemHeader}>
                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                      <ThemedText>🗑️</ThemedText>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemDetails}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        style={styles.quantityBtn}
                      >
                        <ThemedText style={{ fontWeight: 'bold' }}>−</ThemedText>
                      </TouchableOpacity>
                      <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        style={styles.quantityBtn}
                      >
                        <ThemedText style={{ fontWeight: 'bold' }}>+</ThemedText>
                      </TouchableOpacity>
                    </View>
                    <ThemedText style={styles.itemPrice}>
                      {formatCurrency(item.total)}
                    </ThemedText>
                  </View>
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCart}>
                <ThemedText style={styles.emptyText}>Giỏ hàng trống</ThemedText>
              </Card>
            )}
          </ScrollView>

          {/* Payment Summary */}
          {cart.length > 0 && (
            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <ThemedText>Tạm tính:</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {formatCurrency(payment.subtotal)}
                </ThemedText>
              </View>

              <View style={styles.summaryRow}>
                <ThemedText>Giảm giá ({discountPercent}%):</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#ef4444' }]}>
                  -{formatCurrency(payment.discount)}
                </ThemedText>
              </View>

              <View style={styles.summaryRow}>
                <ThemedText>Thuế (10%):</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  +{formatCurrency(payment.tax)}
                </ThemedText>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <ThemedText style={styles.totalLabel}>TỔNG CỘNG:</ThemedText>
                <ThemedText style={styles.totalValue}>
                  {formatCurrency(payment.total)}
                </ThemedText>
              </View>

              <Button
                title={`Thanh Toán (${totalItems} sản phẩm)`}
                onPress={() => setShowPaymentModal(true)}
                style={styles.checkoutBtn}
              />
            </View>
          )}
        </View>
      </View>

      {/* Product Modal */}
      <Modal
        visible={showProductModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <ThemedView style={styles.modal}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Chọn Thuốc</ThemedText>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <ThemedText style={styles.closeBtn}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearch}>
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredMedicines}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const totalStock = item.batches?.reduce((sum, b) => sum + b.quantity, 0) || 0;
              const price = item.batches?.[0]?.sellingPrice || 0;
              return (
              <TouchableOpacity
                onPress={() => {
                  addToCart(item);
                  setShowProductModal(false);
                }}
                style={styles.modalItem}
              >
                <View>
                  <ThemedText style={styles.modalItemName}>{item.name}</ThemedText>
                  <ThemedText style={styles.modalItemPrice}>
                    {formatCurrency(price)}
                  </ThemedText>
                </View>
                <ThemedText style={styles.modalItemStock}>Còn: {totalStock}</ThemedText>
              </TouchableOpacity>
            );}
            }
          />
        </ThemedView>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <ThemedView style={styles.modal}>
          <ScrollView contentContainerStyle={styles.paymentModalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Thanh Toán</ThemedText>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <ThemedText style={styles.closeBtn}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Customer Info */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Tên Khách Hàng</ThemedText>
              <Input
                placeholder="Tên khách (tùy chọn)"
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            {/* Discount */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Giảm Giá (%)</ThemedText>
              <Input
                placeholder="0"
                value={discountPercent}
                onChangeText={setDiscountPercent}
                keyboardType="number-pad"
              />
            </View>

            {/* Payment Method */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Phương Thức Thanh Toán</ThemedText>
              <View style={styles.paymentMethods}>
                {(['cash', 'card', 'transfer'] as const).map(method => (
                  <TouchableOpacity
                    key={method}
                    onPress={() => setPaymentMethod(method)}
                    style={[
                      styles.methodBtn,
                      paymentMethod === method && styles.methodBtnActive,
                    ]}
                  >
                    <ThemedText
                      style={[
                        paymentMethod === method && { fontWeight: '700' },
                      ]}
                    >
                      {method === 'cash' ? '💰 Tiền Mặt' : method === 'card' ? '💳 Thẻ' : '📱 Chuyển Khoản'}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Note */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Ghi Chú</ThemedText>
              <Input
                placeholder="Ghi chú đơn hàng..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Payment Summary */}
            <Card style={styles.paymentCard}>
              <View style={styles.summaryRow}>
                <ThemedText>Tạm tính:</ThemedText>
                <ThemedText>{formatCurrency(payment.subtotal)}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText>Giảm giá:</ThemedText>
                <ThemedText>-{formatCurrency(payment.discount)}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText>Thuế:</ThemedText>
                <ThemedText>+{formatCurrency(payment.tax)}</ThemedText>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <ThemedText style={styles.totalLabel}>TỔNG:</ThemedText>
                <ThemedText style={styles.totalValue}>
                  {formatCurrency(payment.total)}
                </ThemedText>
              </View>
            </Card>

            {/* Buttons */}
            <Button
              title="✅ Xác Nhận Thanh Toán"
              onPress={handleCheckout}
              style={styles.payBtn}
            />
            <Button
              title="Quay Lại"
              onPress={() => setShowPaymentModal(false)}
              style={styles.cancelBtn}
            />
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');
const isTablet = width > 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: isTablet ? 'row' : 'column',
  },
  productPanel: {
    flex: isTablet ? 2 : 1,
    borderRightWidth: isTablet ? 1 : 0,
    borderRightColor: '#e5e7eb',
    borderBottomWidth: isTablet ? 0 : 1,
    borderBottomColor: '#e5e7eb',
  },
  productContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  navButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#3b82f6',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  addToCartBtn: {
    backgroundColor: '#3b82f6',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  cartPanel: {
    flex: isTablet ? 1 : 0,
    minHeight: isTablet ? 0 : 400,
    padding: 16,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartItems: {
    flex: 1,
    marginBottom: 12,
  },
  cartItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontWeight: '600',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  itemPrice: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyCart: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.6,
  },
  paymentSummary: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 14,
  },
  summaryValue: {
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#10b981',
  },
  checkoutBtn: {
    marginTop: 8,
    backgroundColor: '#10b981',
  },
  modal: {
    flex: 1,
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalSearch: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalItemName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  modalItemPrice: {
    color: '#10b981',
    fontWeight: '500',
  },
  modalItemStock: {
    fontSize: 12,
    opacity: 0.7,
  },
  paymentModalContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  methodBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  paymentCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  payBtn: {
    marginBottom: 12,
    backgroundColor: '#10b981',
  },
  cancelBtn: {
    marginBottom: 12,
    backgroundColor: '#6b7280',
  },
});
