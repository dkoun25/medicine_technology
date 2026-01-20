import { create } from 'zustand';
import { dataManager, Employee } from '@/services/DataManager';

interface AuthState {
  user: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: any) => Promise<boolean>;
  getCurrentUser: () => Employee | null;
  isUserAdmin: () => boolean;
  isUserManager: () => boolean;
  restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set: any, get: any) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Demo tài khoản
        const demoAccounts: Record<string, any> = {
        'admin@pharmacy.com': {
          id: '1',
          name: 'Admin System',
          email: 'admin@pharmacy.com',
          phone: '0900000001',
          role: 'admin',
          department: 'Management',
          status: 'active',
          joinDate: '2024-01-01',
          username: 'admin',
          lastLogin: new Date().toISOString(),
        },
        'manager@pharmacy.com': {
          id: '2',
          name: 'Quản Lý Cửa Hàng',
          email: 'manager@pharmacy.com',
          phone: '0900000002',
          role: 'manager',
          department: 'Sales',
          status: 'active',
          joinDate: '2024-01-01',
          username: 'manager',
          lastLogin: new Date().toISOString(),
        },
        'staff@pharmacy.com': {
          id: '3',
          name: 'Nhân Viên Bán Hàng',
          email: 'staff@pharmacy.com',
          phone: '0900000003',
          role: 'staff',
          department: 'Sales',
          status: 'active',
          joinDate: '2024-01-01',
          username: 'staff',
          lastLogin: new Date().toISOString(),
        },
      };

      // Kiểm tra demo account (password: 123456 hoặc email + 123)
      const user = demoAccounts[email];
      
      if (user && (password === 'admin123' || password === 'manager123' || password === 'staff123')) {
        set({ user, isAuthenticated: true, isLoading: false });
        
        // Lưu vào localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        return true;
      }

      // Kiểm tra user từ localStorage (test users)
      if (typeof window !== 'undefined') {
        const savedUsers = localStorage.getItem('registeredUsers');
        if (savedUsers) {
          const users = JSON.parse(savedUsers);
          const foundUser = users.find((u: any) => u.email === email && u.password === password);
          if (foundUser) {
            const userData: Employee = {
              id: foundUser.id,
              name: foundUser.fullName || foundUser.name || foundUser.username || foundUser.email,
              email: foundUser.email,
              phone: foundUser.phone || '',
              role: foundUser.role || 'staff',
              status: foundUser.status || 'active',
              username: foundUser.username || foundUser.email,
              lastLogin: new Date().toISOString(),
            };
            set({ user: userData, isAuthenticated: true, isLoading: false });
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return true;
          }
        }
      }

      set({ error: 'Email hoặc mật khẩu không đúng', isLoading: false });
      return false;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const newUser = {
        id: Math.random().toString(),
        name: data.fullName || data.name || data.username || data.email,
        email: data.email,
        phone: data.phone || '',
        role: data.role || 'staff',
        status: 'active',
        username: data.username || data.email,
        lastLogin: new Date().toISOString(),
        password: data.password, // Không nên lưu password plain text!
      };

      if (typeof window !== 'undefined') {
        const savedUsers = localStorage.getItem('registeredUsers');
        const users = savedUsers ? JSON.parse(savedUsers) : [];
        
        // Kiểm tra email đã tồn tại
        if (users.find((u: any) => u.email === data.email)) {
          set({ error: 'Email này đã được đăng ký', isLoading: false });
          return false;
        }

        users.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
      }

      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  },

  getCurrentUser: () => {
    return get().user;
  },

  isUserAdmin: () => {
    return get().user?.role === 'admin';
  },

  isUserManager: () => {
    const role = get().user?.role;
    return role === 'admin' || role === 'manager';
  },

  restoreSession: () => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          set({ user, isAuthenticated: true });
        } catch (error) {
          console.error('Error restoring auth state:', error);
        }
      }
    }
  },
}));
