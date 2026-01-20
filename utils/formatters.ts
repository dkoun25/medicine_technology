/**
 * Formatter utilities cho tiền tệ, ngày giờ, và các định dạng khác
 */

// ===== TIỀN TỆ =====
/**
 * Format số thành định dạng tiền VND
 * @param amount Số tiền
 * @param showCurrency Có hiển thị ký hiệu ₫?
 */
export const formatCurrency = (amount: number, showCurrency = true): string => {
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: showCurrency ? 'currency' : 'decimal',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return formatted;
};

/**
 * Format số thành định dạng hiển thị đơn giản (không ₫)
 * VD: 1000000 → "1.000.000"
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN');
};

// ===== NGÀY GIỜ =====
/**
 * Format ngày thành dạng "DD/MM/YYYY"
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format ngày và giờ thành "DD/MM/YYYY HH:MM"
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format giờ thành "HH:MM"
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Lấy ngày hôm nay ở định dạng ISO (YYYY-MM-DD)
 */
export const getTodayISO = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Tính số ngày còn lại đến ngày hết hạn
 */
export const getDaysUntilExpiry = (expiryDateString: string): number => {
  const expiryDate = new Date(expiryDateString);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Kiểm tra xem ngày đã hết hạn chưa
 */
export const isExpired = (expiryDateString: string): boolean => {
  const daysLeft = getDaysUntilExpiry(expiryDateString);
  return daysLeft < 0;
};

// ===== PHẦN TRĂM & TỶ LỆ =====
/**
 * Tính phần trăm thay đổi giữa 2 số
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Format phần trăm
 */
export const formatPercent = (percent: number, decimals = 1): string => {
  return `${percent.toFixed(decimals)}%`;
};

// ===== KHÁC =====
/**
 * Format barcode (thêm dấu gạch ngang)
 * VD: 123456789012 → "123456-789012"
 */
export const formatBarcode = (barcode: string): string => {
  if (barcode.length <= 6) return barcode;
  return barcode.slice(0, 6) + '-' + barcode.slice(6);
};

/**
 * Viết hoa chữ cái đầu
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Cắt text quá dài
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Format số lượng với đơn vị
 * VD: 1000 → "1K", 1000000 → "1M"
 */
export const formatQuantity = (quantity: number): string => {
  if (quantity >= 1000000) {
    return (quantity / 1000000).toFixed(1) + 'M';
  }
  if (quantity >= 1000) {
    return (quantity / 1000).toFixed(1) + 'K';
  }
  return quantity.toString();
};

/**
 * Format mã hóa đơn/phiếu
 */
export const formatInvoiceCode = (code: string): string => {
  // VD: "inv_1234567890" → "INV-1234567890"
  const parts = code.split('_');
  if (parts.length === 2) {
    return parts[0].toUpperCase() + '-' + parts[1];
  }
  return code.toUpperCase();
};

/**
 * Tạo mã ID tự động
 * @param prefix VD: "MED", "INV", "CUS"
 * @param number Số thứ tự
 */
export const generateCode = (prefix: string, number: number): string => {
  const paddedNumber = String(number).padStart(4, '0');
  return `${prefix}${paddedNumber}`;
};

// ===== PHÂN LOẠI TRẠNG THÁI =====
/**
 * Lấy nhãn trạng thái hóa đơn
 */
export const getInvoiceStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    completed: 'Hoàn thành',
    pending: 'Chờ xử lý',
    cancelled: 'Đã hủy',
  };
  return labels[status] || status;
};

/**
 * Lấy nhãn loại hóa đơn
 */
export const getInvoiceTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    retail: 'Bán lẻ',
    wholesale: 'Bán sỉ',
    return: 'Trả hàng',
  };
  return labels[type] || type;
};

/**
 * Lấy nhãn quyền nhân viên
 */
export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    admin: 'Quản trị',
    manager: 'Quản lý',
    staff: 'Nhân viên',
  };
  return labels[role] || role;
};
