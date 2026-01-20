import { Invoice } from '@/types/invoice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const INVOICES_KEY = 'invoices';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Load invoices from AsyncStorage
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
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
  };

  const saveInvoice = async (invoice: Invoice) => {
    try {
      const updatedInvoices = [invoice, ...invoices];
      await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
      return invoice;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error;
    }
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  const getRetailInvoices = () => {
    return invoices.filter(inv => inv.type === 'retail');
  };

  const getInvoicesByType = (type: Invoice['type']) => {
    return invoices.filter(inv => inv.type === type);
  };

  const deleteInvoice = async (id: string) => {
    try {
      const updatedInvoices = invoices.filter(inv => inv.id !== id);
      await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  };

  return {
    invoices,
    loading,
    saveInvoice,
    loadInvoices,
    getInvoiceById,
    getRetailInvoices,
    getInvoicesByType,
    deleteInvoice,
  };
}
