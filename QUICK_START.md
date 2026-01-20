<!-- prettier-ignore -->
# 🚀 Quick Start Guide

Hướng dẫn bắt đầu nhanh để phát triển ứng dụng Medicine Technology.

## ⚡ 5 Phút Setup

### 1. Cài đặt Dependencies
```bash
cd medicine_technology
npm install
npm install zustand  # State Management
```

### 2. Chạy Web Version
```bash
npm run web
```

Truy cập `http://localhost:19000` (hoặc cổng được gợi ý)

### 3. Thử Features
- Nhấn vào Dashboard để xem trang chủ
- Vào Medicines để xem danh sách thuốc
- Vào POS để thử bán hàng

**Xong! 🎉**

---

## 📚 Cấu trúc chính

```
app/               # Các trang (Page)
components/        # Các component (Card, Button, Form)
store/             # State Management (Zustand)
hooks/             # Custom hooks
utils/             # Utility functions
types/             # TypeScript types
```

---

## 💻 Sử dụng Hooks (Cách dùng dữ liệu)

### Quản lý Thuốc
```typescript
import { useMedicinesData } from '@/hooks/useMedicines';

export default function MyScreen() {
  const { medicines, addMedicine, searchMedicines } = useMedicinesData();
  
  // Tìm kiếm
  const results = searchMedicines('aspirin');
  
  // Thêm thuốc
  addMedicine({
    id: 'med_1',
    name: 'Aspirin 500mg',
    activeIngredient: 'Acetylsalicylic Acid',
    // ... other fields
  });
}
```

### Quản lý Giỏ Hàng
```typescript
import { useCart } from '@/hooks/useCart';

export default function CartScreen() {
  const { items, total, addItem, removeItem } = useCart();
  
  // Thêm vào giỏ
  addItem({
    medicineId: 'med_1',
    medicineName: 'Aspirin',
    quantity: 2,
    unitPrice: 50000,
    // ... other fields
  });
  
  // Xem tổng tiền
  console.log('Total:', total);
}
```

### Quản lý Đăng Nhập
```typescript
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { login, logout, isAuthenticated, user } = useAuth();
  
  // Đăng nhập
  const success = await login('admin', 'password');
  
  // Kiểm tra quyền
  if (user?.role === 'admin') {
    // Hiển thị admin panel
  }
}
```

---

## 🎨 Dark/Light Mode

```typescript
import { useTheme } from '@/context/ThemeContext';

export default function MyComponent() {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
}
```

---

## 🛠️ Utility Functions

### Format Tiền Tệ
```typescript
import { formatCurrency, formatNumber } from '@/utils/formatters';

formatCurrency(1000000);   // "1.000.000 ₫"
formatNumber(1000000);     // "1.000.000"
```

### Format Ngày
```typescript
import { formatDate, formatDateTime } from '@/utils/formatters';

formatDate('2024-01-20');         // "20/01/2024"
formatDateTime('2024-01-20T10:30') // "20/01/2024 10:30"
```

### Validate Dữ Liệu
```typescript
import { isValidEmail, isValidPhoneVN, validateMedicineBasic } from '@/utils/validators';

if (isValidEmail('user@example.com')) {
  // Email hợp lệ
}

const errors = validateMedicineBasic(medicine);
if (errors.length > 0) {
  console.error(errors);
}
```

---

## 📝 Tạo Page Mới

### 1. Tạo file page
```bash
# File: app/(drawer)/feature-name/index.tsx
```

### 2. Code cơ bản
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function FeatureScreen() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>My Feature</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
});
```

### 3. Thêm vào Sidebar
```typescript
// File: components/layout/Sidebar.tsx
// Thêm link vào menu drawer
```

---

## 🔄 Data Flow (Luồng Dữ Liệu)

```
┌─────────────────────────┐
│  React Component        │
│  (Page hoặc Screen)     │
└────────┬────────────────┘
         │ Gọi hook
         ↓
┌─────────────────────────┐
│  Custom Hook            │
│  (useMedicines, etc.)   │
└────────┬────────────────┘
         │ Gọi store action
         ↓
┌─────────────────────────┐
│  Zustand Store          │
│  (medicineStore, etc.)  │
└────────┬────────────────┘
         │ Lưu state
         ↓
┌─────────────────────────┐
│  localStorage           │
│  (Data Persistence)     │
└─────────────────────────┘
```

---

## 📊 Config & Hằng số

```typescript
import { DEFAULTS, INVOICE_CONFIG, MEDICINE_CATEGORIES } from '@/constants/config';

console.log(DEFAULTS.CURRENCY);           // "VND"
console.log(INVOICE_CONFIG.TYPES);        // ['retail', 'wholesale', 'return']
console.log(MEDICINE_CATEGORIES);         // ['Kháng sinh', 'Vitamin', ...]
```

---

## 🐛 Debugging Tips

### 1. Console Logs
```typescript
console.log('Data:', medicines);
console.error('Error:', error);
```

### 2. React DevTools (Browser)
- F12 → Components tab
- Xem component tree, props, hooks state

### 3. Zustand DevTools
```typescript
// Inspect store state
const state = useMedicineStore.getState();
console.log(state);
```

---

## ❓ Câu hỏi thường gặp

**Q: Làm sao để thêm field mới vào Medicine?**
A: Sửa `types/medicine.ts`, thêm field vào interface

**Q: Làm sao để lưu dữ liệu?**
A: Dùng hook action (VD: `addMedicine()`) - tự động lưu vào localStorage

**Q: Làm sao để call API?**
A: Thêm fetch vào `services/DataManager.ts` hoặc tạo service mới

**Q: Làm sao để thay đổi màu?**
A: Sửa `context/ThemeContext.tsx`

**Q: Làm sao để test?**
A: Chạy `npm run web`, dùng browser DevTools

---

## 🎯 Bước tiếp theo

1. **Hiểu architecture** - Đọc DEVELOPMENT.md
2. **Tạo page mới** - Thêm feature theo quy trình trên
3. **Connect API** - Thêm backend integration
4. **Deploy** - Build cho production

---

## 📞 Cần giúp?

- Đọc README.md cho tổng quan
- Đọc DEVELOPMENT.md cho chi tiết
- Xem code examples trong `app/` folder
- Check TypeScript types trong `types/` folder

Happy coding! 🚀
