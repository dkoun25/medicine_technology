# Hooks Directory

Custom React hooks for managing application state and side effects.

## 📚 Available Hooks

### `useMedicines.ts`
Quản lý dữ liệu thuốc (medicines).

```typescript
const {
  medicines,                    // Danh sách thuốc
  isLoading,                    // Trạng thái tải
  error,                        // Lỗi nếu có
  addMedicine,                  // Thêm thuốc
  updateMedicine,               // Chỉnh sửa thuốc
  deleteMedicine,               // Xóa thuốc
  getMedicineById,              // Lấy 1 thuốc
  searchMedicines,              // Tìm kiếm
  getMedicinesByCategory,       // Lọc theo nhóm
  getLowStockMedicines,         // Thuốc sắp hết
  getExpiringMedicines,         // Thuốc sắp hết hạn
} = useMedicinesData();
```

### `useAuth.ts`
Quản lý authentication và quyền hạn.

```typescript
const {
  user,                         // User hiện tại
  isAuthenticated,              // Đã đăng nhập?
  isLoading,                    // Trạng thái tải
  error,                        // Lỗi nếu có
  login,                        // Hàm đăng nhập
  logout,                       // Hàm đăng xuất
  getCurrentUser,               // Lấy user hiện tại
  isUserAdmin,                  // Là admin?
  isUserManager,                // Là quản lý?
} = useAuth();
```

### `useCart.ts`
Quản lý giỏ hàng và tính toán thanh toán.

```typescript
const {
  items,                        // Các item trong giỏ
  subtotal,                     // Tổng trước giảm giá
  discountPercent,              // % giảm giá
  discountAmount,               // Số tiền giảm
  total,                        // Tổng tiền
  customerId,                   // ID khách hàng
  customerName,                 // Tên khách hàng
  paymentMethod,                // Phương thức thanh toán
  itemCount,                    // Số lượng item
  addItem,                      // Thêm vào giỏ
  updateItem,                   // Chỉnh sửa item
  removeItem,                   // Xóa khỏi giỏ
  clearCart,                    // Xóa tất cả
  setDiscount,                  // Đặt giảm giá
  setCustomer,                  // Chọn khách hàng
  setPaymentMethod,             // Chọn phương thức
} = useCart();
```

## 🎯 Usage Examples

### Ví dụ 1: Hiển thị danh sách thuốc
```typescript
import { useMedicinesData } from '@/hooks/useMedicines';

export default function MedicinesScreen() {
  const { medicines, isLoading, searchMedicines } = useMedicinesData();
  
  const [query, setQuery] = useState('');
  const results = query ? searchMedicines(query) : medicines;
  
  if (isLoading) return <ActivityIndicator />;
  
  return (
    <FlatList
      data={results}
      renderItem={({ item }) => <MedicineCard medicine={item} />}
    />
  );
}
```

### Ví dụ 2: Xử lý giỏ hàng
```typescript
import { useCart } from '@/hooks/useCart';

export default function CartScreen() {
  const { items, total, addItem, removeItem, setDiscount } = useCart();
  
  const handleAddToCart = (medicine) => {
    addItem({
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity: 1,
      unitPrice: medicine.batches[0]?.sellingPrice,
      discount: 0,
      total: medicine.batches[0]?.sellingPrice,
    });
  };
  
  return (
    <View>
      {items.map((item, idx) => (
        <CartItem
          key={idx}
          item={item}
          onRemove={() => removeItem(idx)}
        />
      ))}
      <Text>Total: {total} ₫</Text>
    </View>
  );
}
```

### Ví dụ 3: Kiểm tra quyền truy cập
```typescript
import { useAuth } from '@/hooks/useAuth';

export default function AdminPanel() {
  const { isUserAdmin, user } = useAuth();
  
  if (!isUserAdmin()) {
    return <Text>You don't have permission</Text>;
  }
  
  return <AdminContent />;
}
```

## 📖 Best Practices

1. **Gọi hook ở top của component**
   ```typescript
   // ✅ Good
   const { medicines } = useMedicinesData();
   const { user } = useAuth();
   
   // ❌ Bad
   if (condition) {
     const { medicines } = useMedicinesData();
   }
   ```

2. **Không gọi hook có điều kiện**
   ```typescript
   // ✅ Good
   const { medicines } = useMedicinesData();
   const filtered = medicines.filter(...);
   
   // ❌ Bad
   if (type === 'medicine') {
     const { medicines } = useMedicinesData();
   }
   ```

3. **Tận dụng computed values**
   ```typescript
   const { medicines, getLowStockMedicines } = useMedicinesData();
   const lowStock = getLowStockMedicines(); // Use selector
   ```

## 🔄 Hook Lifecycle

```
Component Mount
     ↓
Hook invoked
     ↓
Store fetches/initializes data
     ↓
Component receives data via hook return
     ↓
User calls action (addMedicine, etc.)
     ↓
Store updates state
     ↓
Component re-renders with new data
```

## ⚠️ Common Issues

### Issue: Hook not returning updated data
**Solution**: Make sure you're calling the hook at top level of component

### Issue: Data not persisting
**Solution**: Actions in hooks automatically save to localStorage

### Issue: Race conditions in async
**Solution**: Use the async actions provided by hooks

## 📚 Related Files
- Store logic: `/store/`
- Usage examples: `/app/`
- Type definitions: `/types/`
