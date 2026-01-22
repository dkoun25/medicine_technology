/**
 * Validator utilities để kiểm tra và validate dữ liệu
 */

// ===== EMAIL & PHONE =====
/**
 * Kiểm tra email hợp lệ
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra số điện thoại Việt Nam (10 chữ số)
 */
export const isValidPhoneVN = (phone: string): boolean => {
  const phoneRegex = /^0\d{9}$/; // VD: 0912345678
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

// Backward-compatible aliases used in some screens
export const validateEmail = (email: string): boolean => isValidEmail(email);
export const validatePhoneVN = (phone: string): boolean => isValidPhoneVN(phone);

/**
 * Kiểm tra số điện thoại quốc tế
 */
export const isValidPhoneInternational = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

// ===== SỐ & GIÁ TRỊ =====
/**
 * Kiểm tra số dương
 */
export const isPositiveNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Kiểm tra số không âm
 */
export const isNonNegativeNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Kiểm tra số nguyên
 */
export const isInteger = (value: any): boolean => {
  return Number.isInteger(Number(value));
};

/**
 * Kiểm tra giá trị nằm trong range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Kiểm tra phần trăm hợp lệ (0-100)
 */
export const isValidPercent = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num >= 0 && num <= 100;
};

// ===== NGÀY GIỜ =====
/**
 * Kiểm tra ngày hợp lệ (ISO format)
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Kiểm tra ngày hết hạn chưa
 */
export const isExpired = (expiryDateString: string): boolean => {
  const expiryDate = new Date(expiryDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);
  return expiryDate < today;
};

/**
 * Kiểm tra ngày được phép trong tương lai (>0 ngày)
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date > today;
};

// ===== TEXT & STRING =====
/**
 * Kiểm tra chuỗi không rỗng
 */
export const isNotEmpty = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Kiểm tra độ dài chuỗi
 */
export const isValidLength = (
  value: string,
  minLength: number,
  maxLength: number
): boolean => {
  return value.length >= minLength && value.length <= maxLength;
};

/**
 * Kiểm tra chuỗi chỉ chứa chữ và số
 */
export const isAlphanumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

/**
 * Kiểm tra chuỗi chứa khoảng trắng
 */
export const hasSpaces = (value: string): boolean => {
  return /\s/.test(value);
};

// ===== BARCODE & MÃ =====
/**
 * Kiểm tra barcode hợp lệ (12-13 chữ số)
 */
export const isValidBarcode = (barcode: string): boolean => {
  const barcodeRegex = /^\d{12,13}$/;
  return barcodeRegex.test(barcode.replace(/[\s-]/g, ''));
};

/**
 * Kiểm tra mã hóa đơn định dạng
 */
export const isValidInvoiceCode = (code: string): boolean => {
  // VD: "HD001", "INV2024001"
  return /^[A-Z]+\d+$/.test(code);
};

/**
 * Kiểm tra CMND/CCCD Việt Nam
 */
export const isValidIdentityCardVN = (idCard: string): boolean => {
  const cleaned = idCard.replace(/[\s-]/g, '');
  // CMND: 9 chữ số, CCCD: 12 chữ số
  return /^\d{9}$/.test(cleaned) || /^\d{12}$/.test(cleaned);
};

// ===== BUSINESS LOGIC =====
/**
 * Kiểm tra tên thuốc hợp lệ
 */
export const isValidMedicineName = (name: string): boolean => {
  return isNotEmpty(name) && name.length >= 3 && name.length <= 100;
};

/**
 * Kiểm tra dữ liệu thuốc cơ bản
 */
export const validateMedicineBasic = (medicine: any): string[] => {
  const errors: string[] = [];

  if (!isValidMedicineName(medicine.name)) {
    errors.push('Tên thuốc phải từ 3-100 ký tự');
  }

  if (!isNotEmpty(medicine.activeIngredient)) {
    errors.push('Hoạt chất không được để trống');
  }

  if (!isNotEmpty(medicine.manufacturer)) {
    errors.push('Nhà sản xuất không được để trống');
  }

  if (!isNonNegativeNumber(medicine.minStock)) {
    errors.push('Tồn kho tối thiểu phải là số không âm');
  }

  return errors;
};

/**
 * Kiểm tra dữ liệu khách hàng cơ bản
 */
export const validateCustomerBasic = (customer: any): string[] => {
  const errors: string[] = [];

  if (!isNotEmpty(customer.name)) {
    errors.push('Tên khách hàng không được để trống');
  }

  if (customer.phone && !isValidPhoneVN(customer.phone) && !isValidPhoneInternational(customer.phone)) {
    errors.push('Số điện thoại không hợp lệ');
  }

  if (customer.email && !isValidEmail(customer.email)) {
    errors.push('Email không hợp lệ');
  }

  if (customer.identityCard && !isValidIdentityCardVN(customer.identityCard)) {
    errors.push('CMND/CCCD không hợp lệ');
  }

  return errors;
};

/**
 * Kiểm tra dữ liệu hóa đơn cơ bản
 */
export const validateInvoiceBasic = (invoice: any): string[] => {
  const errors: string[] = [];

  if (!invoice.items || invoice.items.length === 0) {
    errors.push('Hóa đơn phải có ít nhất 1 sản phẩm');
  }

  if (!isNonNegativeNumber(invoice.total)) {
    errors.push('Tổng tiền phải là số không âm');
  }

  if (!isValidPercent(invoice.discount)) {
    errors.push('Chiết khấu phải từ 0-100%');
  }

  if (!isNotEmpty(invoice.paymentMethod)) {
    errors.push('Phương thức thanh toán không được để trống');
  }

  return errors;
};

/**
 * Kiểm tra dữ liệu lô hàng
 */
export const validateBatchBasic = (batch: any): string[] => {
  const errors: string[] = [];

  if (!isNotEmpty(batch.batchNumber)) {
    errors.push('Số lô không được để trống');
  }

  if (!isValidDate(batch.expiryDate)) {
    errors.push('Ngày hết hạn không hợp lệ');
  }

  if (isExpired(batch.expiryDate)) {
    errors.push('Ngày hết hạn đã qua');
  }

  if (!isPositiveNumber(batch.quantity)) {
    errors.push('Số lượng phải lớn hơn 0');
  }

  if (!isNonNegativeNumber(batch.costPrice)) {
    errors.push('Giá vốn phải là số không âm');
  }

  if (!isNonNegativeNumber(batch.sellingPrice)) {
    errors.push('Giá bán phải là số không âm');
  }

  return errors;
};

// ===== VALIDATE FORM =====
/**
 * Gom lại tất cả errors từ multiple validators
 */
export const validateForm = (
  data: any,
  validators: Array<(data: any) => string[]>
): string[] => {
  const allErrors: string[] = [];

  validators.forEach(validator => {
    const errors = validator(data);
    allErrors.push(...errors);
  });

  return [...new Set(allErrors)]; // Remove duplicates
};

/**
 * Check xem có lỗi nào không
 */
export const hasErrors = (errors: string[]): boolean => {
  return errors && errors.length > 0;
};

/**
 * Get error message dễ đọc
 */
export const getErrorMessage = (errors: string[]): string => {
  if (!hasErrors(errors)) return '';
  return errors.join('\n');
};
