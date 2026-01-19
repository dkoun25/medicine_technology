import pharmacyData from '@/data/pharmacy.json';
import { Customer } from '@/types/customer';
import { Invoice, PurchaseOrder } from '@/types/invoice';
import { Medicine } from '@/types/medicine';

type PharmacyData = {
  pharmacyInfo: any;
  categories: any[];
  units: any[];
  medicines: Medicine[];
  suppliers: any[];
  customers: Customer[];
  invoices: Invoice[];
  purchaseOrders?: PurchaseOrder[];
  staff: any[];
};

class DataManager {
  private data: PharmacyData;

  constructor() {
    this.data = pharmacyData as PharmacyData;
    this.loadFromLocalStorage();
  }

  // Load data from localStorage if available
  private loadFromLocalStorage(): void {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('pharmacyData');
      if (savedData) {
        try {
          this.data = JSON.parse(savedData);
        } catch (error) {
          console.error('Error loading data from localStorage:', error);
        }
      }
    }
  }

  // Save data to localStorage
  private saveToLocalStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pharmacyData', JSON.stringify(this.data));
      } catch (error) {
        console.error('Error saving data to localStorage:', error);
      }
    }
  }

  // Generic CRUD operations
  private generateId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
  }

  // MEDICINES
  getAllMedicines(): Medicine[] {
    return this.data.medicines;
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

  deleteMedicine(id: string): boolean {
    const index = this.data.medicines.findIndex((m) => m.id === id);
    if (index === -1) return false;

    this.data.medicines.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  // Get medicines by filters
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
      const totalStock = m.batches.reduce((sum, b) => sum + b.quantity, 0);
      return totalStock <= m.minStock;
    });
  }

  getExpiringMedicines(daysThreshold: number = 30): Medicine[] {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    return this.data.medicines.filter((m) =>
      m.batches.some((batch) => {
        const expiryDate = new Date(batch.expiryDate);
        return expiryDate <= thresholdDate && expiryDate >= now;
      })
    );
  }

  // CUSTOMERS
  getAllCustomers(): Customer[] {
    return this.data.customers;
  }

  getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: this.generateId('cus'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.customers.push(newCustomer);
    this.saveToLocalStorage();
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
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

  searchCustomers(query: string): Customer[] {
    const lowerQuery = query.toLowerCase();
    return this.data.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phone.includes(query) ||
        c.code.toLowerCase().includes(lowerQuery)
    );
  }

  // INVOICES
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

    // Update medicine stock
    invoice.items.forEach((item) => {
      const medicine = this.getMedicineById(item.medicineId);
      if (medicine) {
        const batch = medicine.batches.find((b) => b.id === item.batchId);
        if (batch) {
          batch.quantity -= item.quantity;
        }
      }
    });

    // Update customer info if exists
    if (invoice.customerId) {
      const customer = this.getCustomerById(invoice.customerId);
      if (customer) {
        customer.totalPurchases += invoice.total;
        customer.lastPurchaseDate = new Date().toISOString();
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

  // CATEGORIES & UNITS
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

  // SUPPLIERS
  getAllSuppliers(): any[] {
    return this.data.suppliers;
  }

  getSupplierById(id: string): any {
    return this.data.suppliers.find((s) => s.id === id);
  }

  // PHARMACY INFO
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

  // EXPORT DATA
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  // IMPORT DATA
  importData(jsonData: string): boolean {
    try {
      const parsedData = JSON.parse(jsonData);
      this.data = parsedData;
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // RESET DATA
  resetData(): void {
    this.data = pharmacyData as PharmacyData;
    this.saveToLocalStorage();
  }
}

// Export singleton instance
export const dataManager = new DataManager();