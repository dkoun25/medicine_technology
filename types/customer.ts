export type Customer = {
  id: string;
  code: string; // Mã khách hàng
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string; // ISO format
  gender?: 'male' | 'female' | 'other';
  identityCard?: string; // CMND/CCCD
  notes?: string;
  loyaltyPoints: number;
  totalPurchases: number; // Tổng tiền đã mua
  lastPurchaseDate?: string; // ISO format
  createdAt: string;
  updatedAt: string;
};

export type CustomerGroup = {
  id: string;
  name: string;
  description?: string;
  discount: number; // Phần trăm giảm giá
};