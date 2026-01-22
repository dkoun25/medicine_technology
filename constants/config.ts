/**
 * Configuration file cho ứng dụng
 * Tất cả các hằng số và config có thể tùy chỉnh được
 */

// ===== APP INFO =====
export const APP_CONFIG = {
  name: 'Medicine Technology',
  version: '1.0.0',
  description: 'Ứng dụng quản lý nhà thuốc',
};

// ===== API CONFIGURATION =====
export const API_CONFIG = {
  // Change this to your deployed API URL in production
  BASE_URL: __DEV__ 
    ? 'http://192.168.1.109:3001'  // Local development
    : 'https://your-project.vercel.app', // Production (update after deploy)
  
  ENDPOINTS: {
    SEND_VERIFICATION: '/api/send-verification',
  },
  
  TIMEOUT: 10000, // 10 seconds
};

// ===== DEFAULTS =====
export const DEFAULTS = {
  CURRENCY: 'VND',
  CURRENCY_SYMBOL: '₫',
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:MM',
  TIMEZONE: 'Asia/Ho_Chi_Minh',

  // Thời gian
  MIN_STOCK_WARNING_DAYS: 30, // Cảnh báo thuốc sắp hết hạn (số ngày)
  MIN_STOCK_THRESHOLD: 0.2, // Tính theo % của tồn kho tối thiểu
  SESSION_TIMEOUT_MINUTES: 30,

  // Hóa đơn
  DEFAULT_DISCOUNT_PERCENT: 0,
  DEFAULT_PAYMENT_METHOD: 'cash' as const,
  INVOICE_DECIMAL_PLACES: 0,

  // Thuốc
  DEFAULT_MIN_STOCK: 10,
  BARCODE_LENGTH: 12,

  // Khách hàng
  VIP_PURCHASE_THRESHOLD: 5000000, // Tổng tiền mua để trở thành VIP
  VIP_POINTS_THRESHOLD: 500,
  POINTS_PER_PURCHASE: 10000, // Cứ 10k tiền mua được 1 điểm

  // Nhân viên
  DEFAULT_ROLE: 'staff' as const,
};

// ===== VALIDATION RULES =====
export const VALIDATION = {
  MEDICINE_NAME: {
    MIN: 3,
    MAX: 100,
  },
  MEDICINE_DESCRIPTION: {
    MAX: 500,
  },
  CUSTOMER_NAME: {
    MIN: 2,
    MAX: 50,
  },
  CUSTOMER_PHONE: {
    MIN: 10,
    MAX: 15,
  },
  PASSWORD: {
    MIN: 6,
    MAX: 50,
  },
  USERNAME: {
    MIN: 4,
    MAX: 30,
  },
  NOTES: {
    MAX: 1000,
  },
};

// ===== INVOICE SETTINGS =====
export const INVOICE_CONFIG = {
  TYPES: ['retail', 'wholesale', 'return'] as const,
  STATUSES: ['pending', 'completed', 'cancelled'] as const,
  PAYMENT_METHODS: ['cash', 'card', 'transfer', 'mixed'] as const,

  // Tiền tố mã hóa đơn
  CODE_PREFIX: {
    retail: 'HD',      // Hóa đơn bán lẻ
    wholesale: 'HDS',  // Hóa đơn bán sỉ
    return: 'HDT',     // Hóa đơn trả hàng
  },

  STARTING_CODE_NUMBER: 1,
};

// ===== EMPLOYEE ROLES =====
export const EMPLOYEE_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;

export const ROLE_PERMISSIONS = {
  admin: ['read', 'create', 'update', 'delete', 'manage_employees', 'view_reports', 'settings'],
  manager: ['read', 'create', 'update', 'view_reports'],
  staff: ['read', 'create'],
};

// ===== CATEGORIES =====
export const MEDICINE_CATEGORIES = [
  'Kháng sinh',
  'Vitamin',
  'Giảm đau',
  'Tiêu hoá',
  'Tim mạch',
  'Hô hấp',
  'Da liễu',
  'Khác',
];

// ===== UNITS =====
export const MEDICINE_UNITS = [
  { id: '1', name: 'Viên', shortName: 'v' },
  { id: '2', name: 'Hộp', shortName: 'hộp' },
  { id: '3', name: 'Lọ', shortName: 'lọ' },
  { id: '4', name: 'Vỉ', shortName: 'vỉ' },
  { id: '5', name: 'Tuýp', shortName: 'tuýp' },
  { id: '6', name: 'Gói', shortName: 'gói' },
  { id: '7', name: 'Lít', shortName: 'L' },
  { id: '8', name: 'Gam', shortName: 'g' },
];

// ===== PAGINATION =====
export const PAGINATION = {
  ITEMS_PER_PAGE: 20,
  ITEMS_PER_PAGE_MOBILE: 10,
};

// ===== CACHE =====
export const CACHE = {
  DURATION_MS: 5 * 60 * 1000, // 5 minutes
  STORE_CACHE_KEY: 'medicine_store_cache',
};

// ===== API ENDPOINTS (nếu có backend) =====
export const API_ENDPOINTS = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  MEDICINES: '/medicines',
  INVOICES: '/invoices',
  CUSTOMERS: '/customers',
  EMPLOYEES: '/employees',
  SUPPLIERS: '/suppliers',
  AUTH: '/auth',
};

// ===== FIREBASE/EXTERNAL SERVICES (nếu dùng) =====
export const EXTERNAL_SERVICES = {
  FIREBASE_ENABLED: false,
  ANALYTICS_ENABLED: false,
  CRASH_REPORTING_ENABLED: false,
};

// ===== FEATURES FLAGS =====
export const FEATURES = {
  ENABLE_BARCODE_SCANNING: false, // Chờ thêm library
  ENABLE_OFFLINE_MODE: false, // Chờ setup offline-first
  ENABLE_PDF_EXPORT: false, // Chờ thêm PDF library
  ENABLE_NOTIFICATIONS: false, // Chờ setup notifications
  ENABLE_DARK_MODE: true,
  ENABLE_ANALYTICS: false,
};

// ===== REPORT SETTINGS =====
export const REPORT_CONFIG = {
  DEFAULT_DATE_RANGE: 'month' as const, // 'day' | 'week' | 'month' | 'year'
  CHART_COLORS: ['#137fec', '#22c55e', '#f97316', '#a855f7', '#ec4899'],
  DECIMAL_PLACES: 0,
};

// ===== EXPORT FORMATS =====
export const EXPORT_FORMATS = {
  SUPPORTED: ['json', 'csv'] as const,
  DEFAULT: 'json' as const,
};

// ===== SIZE BREAKPOINTS =====
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1440,
};

// ===== ANIMATION DURATIONS =====
export const ANIMATION = {
  QUICK: 200,
  NORMAL: 300,
  SLOW: 500,
};

// ===== ERROR MESSAGES =====
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Trường này không được để trống',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  INVALID_DATE: 'Ngày tháng không hợp lệ',
  INVALID_AMOUNT: 'Số tiền không hợp lệ',
  DUPLICATE_ENTRY: 'Dữ liệu đã tồn tại',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  UNAUTHORIZED: 'Bạn không có quyền thực hiện thao tác này',
  SERVER_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại',
  NETWORK_ERROR: 'Lỗi kết nối. Kiểm tra Internet của bạn',
  INSUFFICIENT_STOCK: 'Không đủ hàng trong kho',
  EXPIRED_PRODUCT: 'Sản phẩm đã hết hạn',
};

// ===== SUCCESS MESSAGES =====
export const SUCCESS_MESSAGES = {
  CREATE_SUCCESS: 'Tạo thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  DELETE_SUCCESS: 'Xóa thành công',
  SAVE_SUCCESS: 'Lưu thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  EXPORT_SUCCESS: 'Xuất dữ liệu thành công',
};

// ===== LOG LEVELS =====
export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

// Hàm helper để kiểm tra feature có bật không
export const isFeatureEnabled = (featureName: keyof typeof FEATURES): boolean => {
  return FEATURES[featureName] === true;
};

// Hàm helper để kiểm tra role có quyền không
export const hasPermission = (role: string, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
  return permissions.includes(permission);
};

// Hàm helper để lấy breakpoint
export const getBreakpoint = (width: number): keyof typeof BREAKPOINTS => {
  if (width >= BREAKPOINTS.LARGE) return 'LARGE';
  if (width >= BREAKPOINTS.DESKTOP) return 'DESKTOP';
  if (width >= BREAKPOINTS.TABLET) return 'TABLET';
  return 'MOBILE';
};
