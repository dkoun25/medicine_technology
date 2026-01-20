import { useCartStore } from '@/store/cartStore';

/**
 * Hook để quản lý giỏ hàng
 */
export const useCart = () => {
  const {
    items,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    customerId,
    customerName,
    paymentMethod,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemCount,
    setDiscount,
    setCustomer,
    setPaymentMethod,
  } = useCartStore();

  return {
    items,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    customerId,
    customerName,
    paymentMethod,
    itemCount: getItemCount(),
    addItem,
    updateItem,
    removeItem,
    clearCart,
    setDiscount,
    setCustomer,
    setPaymentMethod,
  };
};
