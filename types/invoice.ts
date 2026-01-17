export type InvoiceItem = {
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Giảm giá (%)
  total: number; // Thành tiền sau giảm giá
};

export type Invoice = {
  id: string;
  code: string; // Mã hóa đơn: HD001, HD002...
  type: 'retail' | 'wholesale' | 'return'; // Bán lẻ, bán sỉ, trả hàng
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number; // Tổng tiền trước giảm giá
  discount: number; // Giảm giá tổng (%)
  discountAmount: number; // Số tiền giảm
  total: number; // Tổng tiền phải trả
  paid: number; // Tiền khách đưa
  change: number; // Tiền thối lại
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mixed'; // Tiền mặt, thẻ, chuyển khoản, kết hợp
  status: 'completed' | 'pending' | 'cancelled';
  cashierId: string; // ID nhân viên thu ngân
  cashierName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrder = {
  id: string;
  code: string; // Mã phiếu nhập: PN001, PN002...
  supplierId: string;
  supplierName: string;
  items: {
    medicineId: string;
    medicineName: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    costPrice: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  debt: number; // Công nợ
  status: 'completed' | 'pending' | 'cancelled';
  receivedBy: string; // Người nhận hàng
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Helper functions
export function calculateInvoiceTotal(items: InvoiceItem[], discountPercent: number = 0): {
  subtotal: number;
  discountAmount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;
  
  return { subtotal, discountAmount, total };
}

export function calculateItemTotal(quantity: number, unitPrice: number, discount: number = 0): number {
  const subtotal = quantity * unitPrice;
  const discountAmount = (subtotal * discount) / 100;
  return subtotal - discountAmount;
}