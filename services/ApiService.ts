/**
 * API Service - Để kết nối với backend
 * Hiện tại dùng localStorage (mock), sau có thể thay thế bằng API thực
 */

import { API_ENDPOINTS } from '@/constants/config';
import { Customer } from '@/types/customer';
import { Invoice } from '@/types/invoice';
import { Medicine } from '@/types/medicine';

// ===== API CLIENT =====
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_ENDPOINTS.BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(body),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(body),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Get auth headers (JWT token, etc.)
   */
  private getAuthHeaders(): Record<string, string> {
    const hasStorage = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    const token = hasStorage ? localStorage.getItem('auth_token') : null;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Set auth token
   */
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Clear auth token
   */
  clearAuthToken(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
}

// ===== API SERVICE INSTANCE =====
export const apiClient = new ApiClient();

// ===== MEDICINE API =====
export const medicineApi = {
  /**
   * Lấy danh sách tất cả thuốc
   */
  getAll: async (): Promise<Medicine[]> => {
    try {
      return await apiClient.get<Medicine[]>(API_ENDPOINTS.MEDICINES);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một thuốc
   */
  getById: async (id: string): Promise<Medicine> => {
    return apiClient.get<Medicine>(`${API_ENDPOINTS.MEDICINES}/${id}`);
  },

  /**
   * Thêm thuốc mới
   */
  create: async (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> => {
    return apiClient.post<Medicine>(API_ENDPOINTS.MEDICINES, medicine);
  },

  /**
   * Cập nhật thuốc
   */
  update: async (id: string, updates: Partial<Medicine>): Promise<Medicine> => {
    return apiClient.put<Medicine>(`${API_ENDPOINTS.MEDICINES}/${id}`, updates);
  },

  /**
   * Xóa thuốc
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${API_ENDPOINTS.MEDICINES}/${id}`);
  },

  /**
   * Tìm kiếm thuốc
   */
  search: async (query: string): Promise<Medicine[]> => {
    return apiClient.get<Medicine[]>(`${API_ENDPOINTS.MEDICINES}?search=${encodeURIComponent(query)}`);
  },
};

// ===== INVOICE API =====
export const invoiceApi = {
  /**
   * Lấy danh sách hóa đơn
   */
  getAll: async (): Promise<Invoice[]> => {
    return apiClient.get<Invoice[]>(API_ENDPOINTS.INVOICES);
  },

  /**
   * Lấy chi tiết hóa đơn
   */
  getById: async (id: string): Promise<Invoice> => {
    return apiClient.get<Invoice>(`${API_ENDPOINTS.INVOICES}/${id}`);
  },

  /**
   * Tạo hóa đơn mới
   */
  create: async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> => {
    return apiClient.post<Invoice>(API_ENDPOINTS.INVOICES, invoice);
  },

  /**
   * Cập nhật hóa đơn
   */
  update: async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
    return apiClient.put<Invoice>(`${API_ENDPOINTS.INVOICES}/${id}`, updates);
  },

  /**
   * Xóa hóa đơn
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${API_ENDPOINTS.INVOICES}/${id}`);
  },

  /**
   * Lấy hóa đơn theo ngày
   */
  getByDateRange: async (startDate: string, endDate: string): Promise<Invoice[]> => {
    return apiClient.get<Invoice[]>(
      `${API_ENDPOINTS.INVOICES}?startDate=${startDate}&endDate=${endDate}`
    );
  },
};

// ===== CUSTOMER API =====
export const customerApi = {
  /**
   * Lấy danh sách khách hàng
   */
  getAll: async (): Promise<Customer[]> => {
    return apiClient.get<Customer[]>(API_ENDPOINTS.CUSTOMERS);
  },

  /**
   * Lấy chi tiết khách hàng
   */
  getById: async (id: string): Promise<Customer> => {
    return apiClient.get<Customer>(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
  },

  /**
   * Tạo khách hàng
   */
  create: async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    return apiClient.post<Customer>(API_ENDPOINTS.CUSTOMERS, customer);
  },

  /**
   * Cập nhật khách hàng
   */
  update: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    return apiClient.put<Customer>(`${API_ENDPOINTS.CUSTOMERS}/${id}`, updates);
  },

  /**
   * Xóa khách hàng
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
  },

  /**
   * Tìm kiếm khách hàng
   */
  search: async (query: string): Promise<Customer[]> => {
    return apiClient.get<Customer[]>(`${API_ENDPOINTS.CUSTOMERS}?search=${encodeURIComponent(query)}`);
  },
};

// ===== AUTH API =====
export const authApi = {
  /**
   * Đăng nhập
   */
  login: async (username: string, password: string): Promise<{ token: string; user: any }> => {
    const response = await apiClient.post<{ token: string; user: any }>(
      `${API_ENDPOINTS.AUTH}/login`,
      { username, password }
    );
    apiClient.setAuthToken(response.token);
    return response;
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    apiClient.clearAuthToken();
    return apiClient.post<void>(`${API_ENDPOINTS.AUTH}/logout`, {});
  },

  /**
   * Kiểm tra token
   */
  verify: async (): Promise<{ valid: boolean; user: any }> => {
    return apiClient.get<{ valid: boolean; user: any }>(`${API_ENDPOINTS.AUTH}/verify`);
  },
};

// ===== REPORT API =====
export const reportApi = {
  /**
   * Lấy doanh thu theo khoảng thời gian
   */
  getRevenue: async (startDate: string, endDate: string): Promise<{ total: number; byDay: any[] }> => {
    return apiClient.get(`/reports/revenue?startDate=${startDate}&endDate=${endDate}`);
  },

  /**
   * Lấy tồn kho
   */
  getInventory: async (): Promise<any> => {
    return apiClient.get('/reports/inventory');
  },

  /**
   * Lấy top sản phẩm
   */
  getTopProducts: async (limit: number = 10): Promise<any> => {
    return apiClient.get(`/reports/top-products?limit=${limit}`);
  },
};

// ===== EXPORT IMPORT =====
export const dataApi = {
  /**
   * Xuất dữ liệu
   */
  export: async (type: 'json' | 'csv' = 'json'): Promise<Blob> => {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/data/export?format=${type}`, {
      method: 'GET',
      headers: {
        ...apiClient.getAuthHeaders(),
      },
    });
    return response.blob();
  },

  /**
   * Nhập dữ liệu
   */
  import: async (file: File): Promise<{ success: boolean; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/data/import`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  },
};

// ===== ERROR HANDLING =====
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

export default {
  apiClient,
  medicineApi,
  invoiceApi,
  customerApi,
  authApi,
  reportApi,
  dataApi,
};
