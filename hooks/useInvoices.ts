import { Invoice } from '@/types/invoice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const INVOICES_KEY = 'invoices';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Load invoices from AsyncStorage
  const loadInvoices = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(INVOICES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setInvoices(parsed);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const saveInvoice = useCallback(async (invoice: Invoice) => {
    try {
      const stored = await AsyncStorage.getItem(INVOICES_KEY);
      const existing: Invoice[] = stored ? JSON.parse(stored) : [];
      const updatedInvoices = [invoice, ...existing];
      await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
      return invoice;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error;
    }
  }, []);

  const getInvoiceById = useCallback((id: string) => {
    return invoices.find(inv => inv.id === id);
  }, [invoices]);

  const getRetailInvoices = useCallback(() => {
    return invoices.filter(inv => inv.type === 'retail');
  }, [invoices]);

  const getInvoicesByType = useCallback((type: Invoice['type']) => {
    return invoices.filter(inv => inv.type === type);
  }, [invoices]);

  const updateInvoice = useCallback(async (id: string, updates: Partial<Invoice>) => {
    try {
      const updatedInvoices = invoices.map(inv => inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv);
      await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
      return updatedInvoices.find(inv => inv.id === id) || null;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }, [invoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      const updatedInvoices = invoices.filter(inv => inv.id !== id);
      await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }, [invoices]);

  return {
    invoices,
    loading,
    saveInvoice,
    loadInvoices,
    getInvoiceById,
    getRetailInvoices,
    getInvoicesByType,
    updateInvoice,
    deleteInvoice,
  };
}
