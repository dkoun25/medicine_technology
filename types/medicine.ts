export type MedicineBatch = {
  id: string;
  batchNumber: string;
  expiryDate: string; // ISO format
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
  importDate: string; // ISO format
  location?: string; // Vị trí trong kho
};

export type PurchaseOrder = {
  id?: string;
  code: string;
  supplierName: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
};

export type Medicine = {
  id: string;
  name: string;
  activeIngredient: string; // Hoạt chất
  category: string; // Nhóm thuốc: Kháng sinh, Vitamin, Giảm đau...
  unit: string; // Đơn vị: Viên, Hộp, Lọ, Vỉ...
  manufacturer: string; // Nhà sản xuất
  country: string; // Nước sản xuất
  registrationNumber?: string; // Số đăng ký
  description?: string;
  usage?: string; // Cách dùng
  dosage?: string; // Liều lượng
  sideEffects?: string; // Tác dụng phụ
  contraindications?: string; // Chống chỉ định
  image?: string;
  barcode?: string;
  minStock: number; // Tồn kho tối thiểu
  batches: MedicineBatch[]; // Các lô thuốc
  createdAt: string;
  updatedAt: string;
};

export type MedicineCategory = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

export type MedicineUnit = {
  id: string;
  name: string;
  shortName: string;
};

// Helper functions
export function getTotalStock(medicine: Medicine): number {
  return medicine.batches.reduce((total, batch) => total + batch.quantity, 0);
}

export function getAveragePrice(medicine: Medicine): number {
  const total = medicine.batches.reduce((sum, batch) => sum + batch.sellingPrice * batch.quantity, 0);
  const quantity = getTotalStock(medicine);
  return quantity > 0 ? total / quantity : 0;
}

export function getExpiringBatches(medicine: Medicine, daysThreshold: number = 30): MedicineBatch[] {
  const now = new Date();
  const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
  
  return medicine.batches.filter(batch => {
    const expiryDate = new Date(batch.expiryDate);
    return expiryDate <= thresholdDate && expiryDate >= now;
  });
}

export function isLowStock(medicine: Medicine): boolean {
  return getTotalStock(medicine) <= medicine.minStock;
}