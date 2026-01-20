import { create } from 'zustand';
import { Medicine, MedicineBatch } from '@/types/medicine';
import { dataManager } from '@/services/DataManager';

interface MedicineState {
  medicines: Medicine[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMedicines: () => Promise<void>;
  addMedicine: (medicine: Medicine) => void;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  getMedicineById: (id: string) => Medicine | undefined;
  
  // Batch management
  addBatch: (medicineId: string, batch: MedicineBatch) => void;
  updateBatch: (medicineId: string, batchId: string, batch: Partial<MedicineBatch>) => void;
  removeBatch: (medicineId: string, batchId: string) => void;
  
  // Search & Filter
  searchMedicines: (query: string) => Medicine[];
  getMedicinesByCategory: (category: string) => Medicine[];
  getLowStockMedicines: () => Medicine[];
  getExpiringMedicines: (daysThreshold?: number) => Medicine[];
}

// Use imported singleton dataManager

export const useMedicineStore = create<MedicineState>((set: any, get: any) => ({
  medicines: [],
  isLoading: false,
  error: null,

  fetchMedicines: async () => {
    set({ isLoading: true, error: null });
    try {
      const medicines = dataManager.getMedicines();
      set({ medicines, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addMedicine: (medicine: Medicine) => {
    const { medicines } = get();
    const newMedicines = [...medicines, medicine];
    set({ medicines: newMedicines });
    dataManager.saveMedicines(newMedicines);
  },

  updateMedicine: (id: string, updates: Partial<Medicine>) => {
    const { medicines } = get();
    const newMedicines = medicines.map((m: Medicine) =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    );
    set({ medicines: newMedicines });
    dataManager.saveMedicines(newMedicines);
  },

  deleteMedicine: (id: string) => {
    const { medicines } = get();
    const newMedicines = medicines.filter((m: Medicine) => m.id !== id);
    set({ medicines: newMedicines });
    dataManager.saveMedicines(newMedicines);
  },

  getMedicineById: (id: string) => {
    const { medicines } = get();
    return medicines.find((m: Medicine) => m.id === id);
  },

  addBatch: (medicineId: string, batch: MedicineBatch) => {
    const { medicines } = get();
    const newMedicines = medicines.map((m: Medicine) =>
      m.id === medicineId
        ? { ...m, batches: Array.isArray(m.batches) ? [...m.batches, batch] : [batch], updatedAt: new Date().toISOString() }
        : m
    );
    set({ medicines: newMedicines });
    dataManager.saveMedicines(newMedicines);
  },

  updateBatch: (medicineId: string, batchId: string, updates: Partial<MedicineBatch>) => {
    const { medicines } = get();
    const newMedicines = medicines.map((m: Medicine) =>
      m.id === medicineId && Array.isArray(m.batches)
        ? {
            ...m,
            batches: m.batches.map((b: MedicineBatch) =>
              b.id === batchId ? { ...b, ...updates } : b
            ),
            updatedAt: new Date().toISOString()
          }
        : m
    );
    set({ medicines: newMedicines });
    dataManager.saveMedicines(newMedicines);
  },

  removeBatch: (medicineId: string, batchId: string) => {
    const { medicines } = get();
    const newMedicines = medicines.map((m: Medicine) =>
      m.id === medicineId && Array.isArray(m.batches)
        ? { ...m, batches: m.batches.filter((b: MedicineBatch) => b.id !== batchId) }
        : m
    );
    set({ medicines: newMedicines });
    dataManager.saveMedicines(newMedicines);
  },

  searchMedicines: (query: string) => {
    const { medicines } = get();
    const lowerQuery = query.toLowerCase();
    return medicines.filter((m: Medicine) => {
      const nameMatch = m.name?.toLowerCase().includes(lowerQuery);
      const ingredientMatch = m.activeIngredient ? m.activeIngredient.toLowerCase().includes(lowerQuery) : false;
      const barcodeMatch = m.barcode ? m.barcode.includes(query) : false;
      return nameMatch || ingredientMatch || barcodeMatch;
    });
  },

  getMedicinesByCategory: (category: string) => {
    const { medicines } = get();
    return medicines.filter((m: Medicine) => m.category === category);
  },

  getLowStockMedicines: () => {
    const { medicines } = get();
    return medicines.filter((m: Medicine) =>
      m.batches.reduce((total: number, b: MedicineBatch) => total + b.quantity, 0) <= m.minStock
    );
  },

  getExpiringMedicines: (daysThreshold = 30) => {
    const { medicines } = get();
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    return medicines.filter((m: Medicine) =>
      m.batches.some((b: MedicineBatch) => {
        const expiryDate = new Date(b.expiryDate);
        return expiryDate <= thresholdDate && expiryDate >= now;
      })
    );
  },
}));
