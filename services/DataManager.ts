import AsyncStorage from '@react-native-async-storage/async-storage';
import pharmacyData from '@/data/pharmacy.json';
import { Customer } from '@/types/customer';
import { Invoice, PurchaseOrder } from '@/types/invoice';
import { Medicine } from '@/types/medicine';

const STORAGE_KEY = 'pharmacy_data_v1';

// 1. Định nghĩa Interface
export interface Employee {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  phone: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  biometricLogin: boolean;
  autoBackup: boolean;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  debt: number;
}

interface ExtendedCustomer extends Customer {
  isVip?: boolean;
  points?: number;
  lastVisit?: string;
}

// Cấu trúc dữ liệu chính
type PharmacyData = {
  pharmacyInfo: any;
  categories: any[];
  units: any[];
  medicines: Medicine[];
  suppliers: Supplier[];
  customers: ExtendedCustomer[];
  invoices: Invoice[];
  purchaseOrders?: PurchaseOrder[];
  employees: Employee[]; 
  settings: AppSettings;
};

class DataManager {
  private data: PharmacyData;

  // Dữ liệu mặc định cho Settings
  private defaultSettings: AppSettings = {
    theme: 'light',
    notifications: true,
    biometricLogin: false,
    autoBackup: true,
    shopName: 'Pharmacy Pro',
    shopAddress: '123 Đường Sức Khỏe, TP.HCM',
    shopPhone: '1900 1000'
  };

  // Dữ liệu mặc định cho Employees
  private defaultEmployees: Employee[] = [
    { id: '1', name: 'Nguyễn Văn Quản Lý', username: 'admin', email: 'admin@pharmacy.com', role: 'admin', phone: '0909123456', status: 'active', lastLogin: '2025-06-15 08:30' },
    { id: '2', name: 'Trần Thị Thu Ngân', username: 'staff1', email: 'staff1@pharmacy.com', role: 'staff', phone: '0909111222', status: 'active', lastLogin: '2025-06-14 14:00' },
    { id: '3', name: 'Lê Văn Kho', username: 'kho1', email: 'kho1@pharmacy.com', role: 'manager', phone: '0909333444', status: 'inactive' },
  ];

  constructor() {
    // Load dữ liệu ban đầu từ pharmacy.json (sẽ override bởi AsyncStorage khi initialize)
    this.data = pharmacyData as unknown as PharmacyData;
    this.initializeMissingData(); 
  }

  // Async initialization: gọi này khi app khởi động
  async initialize(): Promise<void> {
    try {
      // Ưu tiên load từ AsyncStorage (mobile)
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.medicines && parsed.medicines.length > 0) {
          this.data = parsed;
          console.log('Loaded data from AsyncStorage');
          return;
        }
      }
    } catch (error) {
      console.warn('Error loading from AsyncStorage:', error);
    }

    // Fallback: dùng pharmacy.json và save lại
    this.data = pharmacyData as unknown as PharmacyData;
    this.initializeMissingData();
    await this.saveToAsyncStorage();
    console.log('Initialized with pharmacy.json and saved to AsyncStorage');
  }

  // --- STORAGE HANDLERS ---
  private async saveToAsyncStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    // Web only
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('pharmacyData', JSON.stringify(this.data));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  // Khởi tạo dữ liệu nếu thiếu
  private initializeMissingData(): void {
    // 1. Init Suppliers
    if (!this.data.suppliers || this.data.suppliers.length === 0) {
      this.data.suppliers = [
        { id: '1', name: 'Dược Hậu Giang (DHG)', phone: '0292 389 1433', address: '288 Bis Nguyễn Văn Cừ, Cần Thơ', debt: 15000000, email: 'dhgpharma@dhg.com.vn' },
        { id: '2', name: 'Traphaco', phone: '1800 6612', address: '75 Yên Ninh, Ba Đình, Hà Nội', debt: 0, email: 'info@traphaco.com.vn' },
        { id: '3', name: 'Sanofi Việt Nam', phone: '028 3829 8526', address: 'Q.1, TP. Hồ Chí Minh', debt: 5600000, email: 'contact@sanofi.vn' },
      ];
    }
    
    // 2. Init Customers
    if (!this.data.customers) {
        this.data.customers = [];
    }

    // 3. Init Settings (Đảm bảo settings luôn tồn tại)
    if (!this.data.settings) {
        this.data.settings = { ...this.defaultSettings };
    }

    // 4. Init Employees (Đảm bảo employees luôn tồn tại)
    if (!this.data.employees) {
        this.data.employees = [...this.defaultEmployees];
    }
    
    // Lưu lại ngay để đồng bộ cấu trúc mới
    this.saveToLocalStorage();
  }

  private generateId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
  }

  // --- SETTINGS ---
  getSettings() { 
      // Fallback về default nếu chưa có để an toàn
      return this.data.settings || this.defaultSettings; 
  }

  updateSettings(newSettings: Partial<AppSettings>) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveToLocalStorage();
  }

  // --- EMPLOYEES ---
  getEmployees() {
    return this.data.employees || [];
  }

  getAllEmployees() { 
      return this.data.employees || []; 
  }

  addEmployee(emp: Omit<Employee, 'id' | 'lastLogin'>) {
    const newEmp: Employee = {
      ...emp,
      id: Date.now().toString(),
      status: 'active'
    };
    this.data.employees.unshift(newEmp);
    this.saveToLocalStorage();
  }

  updateEmployee(id: string, updates: Partial<Employee>) {
    const index = this.data.employees.findIndex(e => e.id === id);
    if (index !== -1) {
      this.data.employees[index] = { ...this.data.employees[index], ...updates };
      this.saveToLocalStorage();
    }
  }

  deleteEmployee(id: string) {
    this.data.employees = this.data.employees.filter(e => e.id !== id);
    this.saveToLocalStorage();
  }

  // --- MEDICINES ---
  getMedicines(): Medicine[] {
    return this.enrichMedicines(this.data.medicines);
  }

  getAllMedicines(): Medicine[] {
    return this.enrichMedicines(this.data.medicines);
  }

  // Helper: Thêm price và unitName vào medicine
  private enrichMedicines(medicines: Medicine[]): any[] {
    return medicines.map(med => {
      // Lấy giá từ batch đầu tiên
      const price = med.batches && med.batches.length > 0 
        ? med.batches[0].sellingPrice 
        : 0;
      
      // Lấy tên đơn vị từ units
      const unitObj = this.data.units?.find((u: any) => u.id === med.unit);
      const unitName = unitObj ? unitObj.name : med.unit;
      
      return {
        ...med,
        price,
        unit: unitName
      };
    });
  }

  saveMedicines(medicines: Medicine[]): void {
    this.data.medicines = medicines;
    this.saveToLocalStorage();
  }

  async saveMedicinesAsync(medicines: Medicine[]): Promise<void> {
    this.data.medicines = medicines;
    await this.saveToAsyncStorage();
    this.saveToLocalStorage();
  }

  getMedicineById(id: string): Medicine | undefined {
    return this.data.medicines.find((m) => m.id === id);
  }

  addMedicine(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Medicine {
    const newMedicine: Medicine = {
      ...medicine,
      id: this.generateId('med'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.medicines.push(newMedicine);
    this.saveToLocalStorage();
    return newMedicine;
  }

  async addMedicineAsync(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine> {
    const newMedicine: Medicine = {
      ...medicine,
      id: this.generateId('med'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.medicines.push(newMedicine);
    await this.saveToAsyncStorage();
    this.saveToLocalStorage();
    return newMedicine;
  }

  updateMedicine(id: string, updates: Partial<Medicine>): Medicine | null {
    const index = this.data.medicines.findIndex((m) => m.id === id);
    if (index === -1) return null;

    this.data.medicines[index] = {
      ...this.data.medicines[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    return this.data.medicines[index];
  }

  async updateMedicineAsync(id: string, updates: Partial<Medicine>): Promise<Medicine | null> {
    const index = this.data.medicines.findIndex((m) => m.id === id);
    if (index === -1) return null;

    this.data.medicines[index] = {
      ...this.data.medicines[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.saveToAsyncStorage();
    this.saveToLocalStorage();
    return this.data.medicines[index];
  }

  deleteMedicine(id: string): boolean {
    const index = this.data.medicines.findIndex((m) => m.id === id);
    if (index === -1) return false;

    this.data.medicines.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  async deleteMedicineAsync(id: string): Promise<boolean> {
    const index = this.data.medicines.findIndex((m) => m.id === id);
    if (index === -1) return false;

    this.data.medicines.splice(index, 1);
    await this.saveToAsyncStorage();
    this.saveToLocalStorage();
    return true;
  }

  getMedicinesByCategory(categoryId: string): Medicine[] {
    return this.data.medicines.filter((m) => m.category === categoryId);
  }

  searchMedicines(query: string): Medicine[] {
    const lowerQuery = query.toLowerCase();
    return this.data.medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.activeIngredient.toLowerCase().includes(lowerQuery) ||
        m.barcode?.includes(query)
    );
  }

  getLowStockMedicines(): Medicine[] {
    return this.data.medicines.filter((m) => {
      const batches = m.batches || [];
      const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
      return totalStock <= (m.minStock || 10);
    });
  }

  getExpiringMedicines(daysThreshold: number = 30): Medicine[] {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    return this.data.medicines.filter((m) => {
      const batches = m.batches || [];
      return batches.some((batch) => {
        const expiryDate = new Date(batch.expiryDate);
        return expiryDate <= thresholdDate && expiryDate >= now;
      });
    });
  }

  // --- CUSTOMERS ---
  getAllCustomers(): ExtendedCustomer[] {
    return this.data.customers;
  }

  getCustomerById(id: string): ExtendedCustomer | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  addCustomer(customer: Omit<ExtendedCustomer, 'id' | 'createdAt' | 'updatedAt'>): ExtendedCustomer {
    const newCustomer: ExtendedCustomer = {
      ...customer,
      id: this.generateId('cus'),
      totalPurchases: 0,
      points: 0,
      isVip: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.customers.unshift(newCustomer);
    this.saveToLocalStorage();
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<ExtendedCustomer>): ExtendedCustomer | null {
    const index = this.data.customers.findIndex((c) => c.id === id);
    if (index === -1) return null;

    this.data.customers[index] = {
      ...this.data.customers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    return this.data.customers[index];
  }

  searchCustomers(query: string): ExtendedCustomer[] {
    const lowerQuery = query.toLowerCase();
    return this.data.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phone.includes(query) ||
        (c.code && c.code.toLowerCase().includes(lowerQuery))
    );
  }

  // --- SUPPLIERS ---
  getAllSuppliers(): Supplier[] {
    return this.data.suppliers || [];
  }

  getSupplierById(id: string): Supplier | undefined {
    return this.data.suppliers?.find((s) => s.id === id);
  }

  addSupplier(supplier: Omit<Supplier, 'id' | 'debt'>): Supplier {
    const newSupplier: Supplier = {
      ...supplier,
      id: this.generateId('sup'),
      debt: 0,
    };
    
    if (!this.data.suppliers) this.data.suppliers = [];
    this.data.suppliers.unshift(newSupplier);
    this.saveToLocalStorage();
    return newSupplier;
  }

  updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    if (!this.data.suppliers) return null;
    const index = this.data.suppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;

    this.data.suppliers[index] = {
      ...this.data.suppliers[index],
      ...updates,
    };
    this.saveToLocalStorage();
    return this.data.suppliers[index];
  }

  // --- INVOICES ---
  getAllInvoices(): Invoice[] {
    return this.data.invoices;
  }

  getInvoiceById(id: string): Invoice | undefined {
    return this.data.invoices.find((i) => i.id === id);
  }

  addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice {
    const newInvoice: Invoice = {
      ...invoice,
      id: this.generateId('inv'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.invoices.push(newInvoice);

    // Update stock
    invoice.items.forEach((item) => {
      const medicine = this.getMedicineById(item.medicineId);
      if (medicine) {
        const batch = medicine.batches.find((b) => b.id === item.batchId);
        if (batch) {
          batch.quantity -= item.quantity;
        }
      }
    });

    // Update customer stats
    if (invoice.customerId) {
      const customer = this.getCustomerById(invoice.customerId);
      if (customer) {
        customer.totalPurchases += invoice.total;
        customer.lastPurchaseDate = new Date().toISOString();
        
        if (!customer.points) customer.points = 0;
        customer.points += Math.floor(invoice.total / 10000);
        
        if (customer.totalPurchases > 5000000 || customer.points > 500) {
            customer.isVip = true;
        }

        this.updateCustomer(customer.id, customer);
      }
    }

    this.saveToLocalStorage();
    return newInvoice;
  }

  getInvoicesByDateRange(startDate: string, endDate: string): Invoice[] {
    return this.data.invoices.filter((i) => {
      const invoiceDate = new Date(i.createdAt);
      return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
    });
  }

  getTodayRevenue(): number {
    const today = new Date().toISOString().split('T')[0];
    const todayInvoices = this.data.invoices.filter(
      (i) => i.createdAt.startsWith(today) && i.status === 'completed'
    );
    return todayInvoices.reduce((sum, i) => sum + i.total, 0);
  }

  // --- CATEGORIES & UNITS ---
  getAllCategories(): any[] {
    return this.data.categories;
  }

  getAllUnits(): any[] {
    return this.data.units;
  }

  addCategory(category: { name: string; icon?: string; description?: string }): any {
    const newCategory = {
      id: this.generateId('cat'),
      ...category,
    };
    this.data.categories.push(newCategory);
    this.saveToLocalStorage();
    return newCategory;
  }

  addUnit(unit: { name: string; shortName: string }): any {
    const newUnit = {
      id: this.generateId('unit'),
      ...unit,
    };
    this.data.units.push(newUnit);
    this.saveToLocalStorage();
    return newUnit;
  }

  // --- PHARMACY INFO ---
  getPharmacyInfo(): any {
    return this.data.pharmacyInfo;
  }

  updatePharmacyInfo(updates: Partial<any>): void {
    this.data.pharmacyInfo = {
      ...this.data.pharmacyInfo,
      ...updates,
    };
    this.saveToLocalStorage();
  }

  // --- UTILS ---
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const parsedData = JSON.parse(jsonData);
      this.data = parsedData;
      this.initializeMissingData(); 
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  resetData(): void {
    // --- SỬA LỖI TẠI ĐÂY NỮA ---
    this.data = pharmacyData as unknown as PharmacyData;
    
    // Clear trường employees và settings để nó tự init lại mặc định
    (this.data as any).employees = undefined; 
    (this.data as any).settings = undefined;
    
    this.initializeMissingData();
    this.saveToLocalStorage();
  }
}

export const dataManager = new DataManager();