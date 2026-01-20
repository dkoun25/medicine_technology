import { useEffect } from 'react';
import { useMedicineStore } from '@/store/medicineStore';

/**
 * Hook tùy chỉnh để quản lý dữ liệu thuốc
 * Tự động fetch dữ liệu khi component mount
 */
export const useMedicinesData = () => {
  const {
    medicines,
    isLoading,
    error,
    fetchMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    getMedicineById,
    searchMedicines,
    getMedicinesByCategory,
    getLowStockMedicines,
    getExpiringMedicines,
  } = useMedicineStore();

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  return {
    medicines,
    isLoading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    getMedicineById,
    searchMedicines,
    getMedicinesByCategory,
    getLowStockMedicines,
    getExpiringMedicines,
  };
};

/**
 * Hook để lấy thông tin chi tiết 1 thuốc theo ID
 */
export const useMedicineById = (medicineId: string) => {
  const medicine = useMedicineStore(state => state.getMedicineById(medicineId));
  return medicine;
};

/**
 * Hook để lấy danh sách thuốc sắp hết hạn
 */
export const useExpiringMedicines = (daysThreshold = 30) => {
  const expiringMedicines = useMedicineStore(state => 
    state.getExpiringMedicines(daysThreshold)
  );
  return expiringMedicines;
};

/**
 * Hook để lấy danh sách thuốc sắp hết hàng
 */
export const useLowStockMedicines = () => {
  const lowStockMedicines = useMedicineStore(state => 
    state.getLowStockMedicines()
  );
  return lowStockMedicines;
};
