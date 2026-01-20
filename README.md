# Medicine Technology - Ứng dụng Quản lý Nhà Thuốc

Một ứng dụng web/mobile toàn diện để quản lý bán lẻ thuốc, quản lý tồn kho, báo cáo doanh thu và quản lý nhân sự.

## ✨ Tính năng chính

### 📊 Dashboard
- Thống kê tổng quan: Tổng SKU, thuốc sắp hết hạn, tồn kho thấp, doanh thu
- Biểu đồ doanh thu theo thời gian
- Danh sách cảnh báo (sắp hết hạn, tồn kho thấp)
- Thống kê theo nhóm thuốc

### 💊 Quản lý Thuốc
- Danh sách thuốc với tìm kiếm
- Thêm/chỉnh sửa/xóa thuốc
- Quản lý lô hàng (batch) với ngày hết hạn
- Theo dõi tồn kho
- Mã barcode

### 🛒 Bán hàng (POS)
- Giao diện bán hàng trực quan
- Giỏ hàng real-time
- Tính toán giảm giá
- Nhiều phương thức thanh toán
- Quản lý khách hàng VIP

### 📋 Hóa đơn
- Bán lẻ (Retail)
- Bán sỉ (Wholesale)
- Trả hàng (Return)
- Tìm kiếm và lọc
- Chi tiết hóa đơn

### 📤 Nhập Hàng
- Tạo phiếu nhập hàng
- Quản lý công nợ nhà cung cấp
- Theo dõi lô hàng

### 📊 Báo cáo
- **Báo cáo Doanh thu**: Doanh thu hôm nay, tuần, tháng
- **Báo cáo Tồn kho**: Danh sách thuốc, tồn kho thấp, sắp hết hạn
- Xuất dữ liệu

### 👥 Quản lý
- Nhân viên (Admin, Quản lý, Nhân viên)
- Khách hàng
- Nhà cung cấp
- Cài đặt hệ thống

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Chạy trên web
```bash
npm run web
```

Hoặc chạy trên mobile:
```bash
npm run android  # Android emulator
npm run ios      # iOS simulator
npm run start    # Expo Go
```

## 📱 Kiến trúc Project

### Cấu trúc thư mục
```
app/                    # Expo Router pages
  _layout.tsx          # Root layout
  (drawer)/            # Drawer navigation
    dashboard/         # Dashboard page
    medicines/         # Quản lý thuốc
    hoa-don/           # Hóa đơn (bán lẻ, bán sỉ, trả hàng)
    pos/               # Bán hàng
    reports/           # Báo cáo
    partners/          # Nhà cung cấp & khách hàng
    system/            # Cài đặt hệ thống

components/            # React components
  layout/             # Header, Sidebar
  medicine/           # MedicineForm, MedicineCard, etc.
  pos/                # Cart, ProductGrid, PaymentModal
  ui/                 # Button, Card, Input, Modal, Table, etc.

store/                 # Zustand stores
  medicineStore.ts    # Quản lý thuốc (state + actions)
  authStore.ts        # Quản lý đăng nhập
  cartStore.ts        # Quản lý giỏ hàng

services/              # Business logic
  DataManager.ts      # Quản lý dữ liệu (CRUD)
  ReportService.ts    # Tính toán báo cáo

hooks/                 # Custom React hooks
  useMedicines.ts     # Hook quản lý thuốc
  useAuth.ts          # Hook quản lý auth
  useCart.ts          # Hook quản lý giỏ hàng

types/                 # TypeScript types
  medicine.ts         # Types cho thuốc
  customer.ts         # Types cho khách hàng
  invoice.ts          # Types cho hóa đơn

context/               # React Context
  ThemeContext.tsx    # Dark/Light mode

utils/                 # Utility functions
  formatters.ts       # Format tiền tệ, ngày giờ
  validators.ts       # Kiểm tra dữ liệu
```

## 🔧 Sử dụng State Management

Project sử dụng **Zustand** để quản lý state. Mỗi store (medicine, auth, cart) là một file tách biệt.

### Ví dụ sử dụng trong Component

```typescript
import { useMedicinesData } from '@/hooks/useMedicines';

export default function MedicinesScreen() {
  const { 
    medicines, 
    isLoading, 
    searchMedicines,
    getLowStockMedicines 
  } = useMedicinesData();

  // Tìm kiếm
  const results = searchMedicines('aspirin');

  // Lấy thuốc tồn kho thấp
  const lowStock = getLowStockMedicines();

  return (
    // ... render UI
  );
}
```

### Ví dụ sử dụng cart

```typescript
import { useCart } from '@/hooks/useCart';

export default function CartScreen() {
  const { 
    items, 
    total, 
    itemCount,
    addItem,
    removeItem,
    setDiscount 
  } = useCart();

  return (
    // ... render giỏ hàng
  );
}
```

## 📝 Dữ liệu mặc định

Dữ liệu được lưu trữ trong `localStorage` (web) hoặc AsyncStorage (mobile):

- **Thuốc**: Danh sách thuốc với lô hàng
- **Khách hàng**: Danh sách khách hàng, điểm tích lũy
- **Hóa đơn**: Lịch sử bán hàng
- **Nhân viên**: Danh sách nhân viên, quyền hạn
- **Nhà cung cấp**: Danh sách nhà cung cấp, công nợ

## 🎨 Theme & Styling

Project dùng **React Context** cho Dark/Light mode.

```typescript
import { useTheme } from '@/context/ThemeContext';

export default function MyComponent() {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

## 📖 Các hook custom có sẵn

### `useMedicinesData()`
Quản lý danh sách thuốc với fetch tự động

```typescript
const {
  medicines,           // Danh sách thuốc
  isLoading,          // Trạng thái tải
  error,              // Lỗi nếu có
  addMedicine,        // Thêm thuốc
  updateMedicine,     // Chỉnh sửa thuốc
  deleteMedicine,     // Xóa thuốc
  searchMedicines,    // Tìm kiếm
  getLowStockMedicines,  // Lấy thuốc tồn kho thấp
  getExpiringMedicines,  // Lấy thuốc sắp hết hạn
} = useMedicinesData();
```

### `useAuth()`
Quản lý đăng nhập và quyền hạn

```typescript
const {
  user,               // User hiện tại
  isAuthenticated,    // Đã đăng nhập?
  login,              // Hàm đăng nhập
  logout,             // Hàm đăng xuất
  isUserAdmin,        // Là admin?
  isUserManager,      // Là quản lý?
} = useAuth();
```

### `useCart()`
Quản lý giỏ hàng

```typescript
const {
  items,              // Các item trong giỏ
  total,              // Tổng tiền
  itemCount,          // Số lượng item
  addItem,            // Thêm item
  removeItem,         // Xóa item
  setDiscount,        // Đặt giảm giá
} = useCart();
```

## 🔄 Workflow Quản lý Dữ liệu

```
Component ──> Hook (useMedicinesData) ──> Store (Zustand) ──> localStorage
```

1. **Component** gọi hook (VD: `useMedicinesData()`)
2. **Hook** kết nối với **Store** (Zustand)
3. **Store** cập nhật state và lưu vào **localStorage**
4. Component re-render khi state thay đổi

## 🛠️ Lộ trình phát triển tiếp theo

### Ưu tiên 1: Hoàn thiện features
- [ ] Quản lý khách hàng VIP (điểm, tích lũy)
- [ ] Báo cáo chi tiết (doanh thu theo nhóm, top 10 thuốc)
- [ ] Import/Export dữ liệu (Excel, PDF)

### Ưu tiên 2: Cải thiện UX
- [ ] Scanner barcode
- [ ] Offline-first (sync khi online)
- [ ] Notifications (thuốc sắp hết hạn)
- [ ] Print hóa đơn

### Ưu tiên 3: Backend integration
- [ ] API server (Node.js/Express)
- [ ] Database (PostgreSQL)
- [ ] Authentication (JWT)
- [ ] Cloud sync

## 📚 Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Expo Router](https://docs.expo.dev/router/introduction/)

## 📄 License

MIT

## 👥 Tác giả

Phát triển cho dự án Quản lý Nhà Thuốc
