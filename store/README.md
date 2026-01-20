# Store Directory

Zustand state management stores for global application state.

## 📦 Available Stores

### `medicineStore.ts`
Quản lý state cho thuốc và các phương thức CRUD.

**State:**
- `medicines` - Danh sách tất cả thuốc
- `isLoading` - Trạng thái tải dữ liệu
- `error` - Error message nếu có

**Actions:**
- `fetchMedicines()` - Tải danh sách thuốc
- `addMedicine(medicine)` - Thêm thuốc mới
- `updateMedicine(id, updates)` - Chỉnh sửa thuốc
- `deleteMedicine(id)` - Xóa thuốc
- `getMedicineById(id)` - Tìm 1 thuốc
- `addBatch(medicineId, batch)` - Thêm lô hàng
- `updateBatch(medicineId, batchId, updates)` - Cập nhật lô
- `removeBatch(medicineId, batchId)` - Xóa lô
- `searchMedicines(query)` - Tìm kiếm thuốc
- `getMedicinesByCategory(category)` - Lọc theo nhóm
- `getLowStockMedicines()` - Thuốc sắp hết
- `getExpiringMedicines(daysThreshold)` - Thuốc sắp hết hạn

### `authStore.ts`
Quản lý authentication và user information.

**State:**
- `user` - Thông tin user hiện tại
- `isAuthenticated` - Đã đăng nhập?
- `isLoading` - Trạng thái tải
- `error` - Error message

**Actions:**
- `login(username, password)` - Đăng nhập
- `logout()` - Đăng xuất
- `getCurrentUser()` - Lấy user hiện tại
- `isUserAdmin()` - Kiểm tra admin
- `isUserManager()` - Kiểm tra quản lý

**Helpers:**
- `restoreAuthState()` - Khôi phục session từ localStorage

### `cartStore.ts`
Quản lý giỏ hàng cho bán hàng.

**State:**
- `items` - Danh sách sản phẩm trong giỏ
- `subtotal` - Tổng trước giảm giá
- `discountPercent` - % giảm giá
- `discountAmount` - Số tiền giảm
- `total` - Tổng tiền thanh toán
- `customerId` - ID khách hàng
- `customerName` - Tên khách hàng
- `paymentMethod` - Phương thức thanh toán

**Actions:**
- `addItem(item)` - Thêm vào giỏ
- `updateItem(index, updates)` - Cập nhật item
- `removeItem(index)` - Xóa khỏi giỏ
- `clearCart()` - Xóa tất cả
- `getItemCount()` - Đếm số item
- `setDiscount(percent)` - Đặt % giảm giá
- `setCustomer(id, name)` - Chọn khách hàng
- `setPaymentMethod(method)` - Chọn phương thức

## 🔗 Direct Store Usage

Thường dùng qua **hooks**, nhưng có thể access store trực tiếp:

```typescript
import { useMedicineStore } from '@/store/medicineStore';

// Trong component
const medicines = useMedicineStore(state => state.medicines);
const { addMedicine } = useMedicineStore();

// Ngoài component (ít dùng)
const state = useMedicineStore.getState();
state.addMedicine(newMedicine);
```

## 📊 Data Persistence

Tất cả stores **tự động lưu** state vào localStorage:
- Khi data thay đổi → tự động save
- Khi page reload → tự động load

Không cần code thêm!

## 🎯 Best Practices

### 1. Dùng hooks thay vì direct store
```typescript
// ✅ Good - Clean & easy to test
const { medicines } = useMedicinesData();

// ❌ Less clean - Direct store access
const medicines = useMedicineStore(state => state.medicines);
```

### 2. Dùng selectors để optimize
```typescript
// ✅ Good - Only re-render khi medicines thay đổi
const medicines = useMedicineStore(state => state.medicines);

// ⚠️ Watch out - Re-render on any store change
const { medicines, isLoading, error } = useMedicineStore();
```

### 3. Handle loading & error states
```typescript
const { medicines, isLoading, error } = useMedicinesData();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage msg={error} />;

return <MedicinesList medicines={medicines} />;
```

## 🔄 Store Architecture

```
┌─────────────────────────────┐
│   Component (Page/Screen)   │
└──────────────┬──────────────┘
               │ calls hook
               ↓
┌─────────────────────────────┐
│   Custom Hook              │
│   (useMedicinesData, etc.)  │
└──────────────┬──────────────┘
               │ calls store action
               ↓
┌─────────────────────────────┐
│   Zustand Store            │
│   (medicineStore, etc.)    │
└──────────────┬──────────────┘
               │ updates state
               ↓
┌─────────────────────────────┐
│   localStorage             │
│   (Automatic persistence)  │
└─────────────────────────────┘
```

## 📝 Creating New Store

Muốn thêm store mới? Làm theo pattern:

```typescript
// File: store/myStore.ts
import { create } from 'zustand';

interface MyState {
  data: any[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addData: (item: any) => void;
  removeData: (id: string) => void;
}

export const useMyStore = create<MyState>((set, get) => ({
  data: [],
  isLoading: false,
  error: null,

  addData: (item) => {
    const { data } = get();
    set({ data: [...data, item] });
  },

  removeData: (id) => {
    const { data } = get();
    set({ data: data.filter(item => item.id !== id) });
  },
}));
```

Rồi tạo hook:
```typescript
// File: hooks/useMyHook.ts
import { useEffect } from 'react';
import { useMyStore } from '@/store/myStore';

export const useMyData = () => {
  const { data, addData, removeData, isLoading, error } = useMyStore();

  useEffect(() => {
    // Initialize if needed
  }, []);

  return { data, addData, removeData, isLoading, error };
};
```

## 🧪 Testing Stores

```typescript
describe('medicineStore', () => {
  it('should add medicine', () => {
    const { result } = renderHook(() => useMedicineStore());
    
    const medicine = { id: '1', name: 'Test', ... };
    result.current.addMedicine(medicine);
    
    expect(result.current.medicines).toContain(medicine);
  });
});
```

## 📚 Related Files
- Hook wrappers: `/hooks/`
- Type definitions: `/types/`
- Usage examples: `/app/`
