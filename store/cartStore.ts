import { create } from 'zustand';
import { InvoiceItem, calculateItemTotal } from '@/types/invoice';

interface CartState {
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  customerId?: string;
  customerName?: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mixed';

  // Actions
  addItem: (item: InvoiceItem) => void;
  updateItem: (index: number, item: Partial<InvoiceItem>) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  setDiscount: (percent: number) => void;
  setCustomer: (customerId: string | undefined, customerName?: string) => void;
  setPaymentMethod: (method: 'cash' | 'card' | 'transfer' | 'mixed') => void;
}

const calculateTotals = (items: InvoiceItem[], discountPercent: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  return { subtotal, discountAmount, total };
};

export const useCartStore = create<CartState>((set: any, get: any) => ({
  items: [],
  subtotal: 0,
  discountPercent: 0,
  discountAmount: 0,
  total: 0,
  customerId: undefined,
  customerName: undefined,
  paymentMethod: 'cash',

  addItem: (item: InvoiceItem) => {
    const { items, discountPercent } = get();
    
    // Kiểm tra xem thuốc đã có trong giỏi hàng chưa
    const existingIndex = items.findIndex(
      i => i.medicineId === item.medicineId && i.batchId === item.batchId
    );

    let newItems: InvoiceItem[];
    if (existingIndex >= 0) {
      // Cập nhật số lượng
      newItems = [...items];
      const existingItem = newItems[existingIndex];
      newItems[existingIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity,
        total: calculateItemTotal(
          existingItem.quantity + item.quantity,
          existingItem.unitPrice,
          existingItem.discount
        ),
      };
    } else {
      // Thêm item mới
      newItems = [...items, item];
    }

    const { subtotal, discountAmount, total } = calculateTotals(newItems, discountPercent);
    set({ items: newItems, subtotal, discountAmount, total });
  },

  updateItem: (index: number, updates: Partial<InvoiceItem>) => {
    const { items, discountPercent } = get();
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };

    // Tính lại total của item nếu thay đổi quantity hoặc discount
    if (updates.quantity !== undefined || updates.discount !== undefined) {
      const item = newItems[index];
      item.total = calculateItemTotal(item.quantity, item.unitPrice, item.discount);
    }

    const { subtotal, discountAmount, total } = calculateTotals(newItems, discountPercent);
    set({ items: newItems, subtotal, discountAmount, total });
  },

  removeItem: (index: number) => {
    const { items, discountPercent } = get();
    const newItems = items.filter((_, i) => i !== index);
    const { subtotal, discountAmount, total } = calculateTotals(newItems, discountPercent);
    set({ items: newItems, subtotal, discountAmount, total });
  },

  clearCart: () => {
    set({
      items: [],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      total: 0,
      customerId: undefined,
      customerName: undefined,
      paymentMethod: 'cash',
    });
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },

  setDiscount: (percent: number) => {
    const { items } = get();
    const { subtotal, discountAmount, total } = calculateTotals(items, percent);
    set({ discountPercent: percent, subtotal, discountAmount, total });
  },

  setCustomer: (customerId: string | undefined, customerName?: string) => {
    set({ customerId, customerName });
  },

  setPaymentMethod: (method: 'cash' | 'card' | 'transfer' | 'mixed') => {
    set({ paymentMethod: method });
  },
}));
