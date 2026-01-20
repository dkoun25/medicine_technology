<!-- prettier-ignore -->
# 🚀 Hướng dẫn Setup & Phát triển

## 📋 Yêu cầu trước tiên

- **Node.js**: v18.0.0 hoặc cao hơn
- **npm** hoặc **yarn**
- **Git** (để quản lý version control)

Kiểm tra phiên bản:
```bash
node --version
npm --version
```

## 🔧 Setup Lần đầu

### 1. Clone hoặc tải project
```bash
cd medicine_technology
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cài đặt Zustand (State Management)
```bash
npm install zustand
```

### 4. Chạy app

**Web (Recommended)**:
```bash
npm run web
```
Sau đó truy cập `http://localhost:19000` (hoặc cổng được gợi ý)

**Android Emulator**:
```bash
npm run android
```

**iOS Simulator** (macOS only):
```bash
npm run ios
```

**Expo Go** (test trên điện thoại):
```bash
npm run start
```

## 📁 Cấu trúc thư mục

```
medicine_technology/
├── app/                      # Tất cả pages (Expo Router)
│   ├── _layout.tsx          # Root layout
│   ├── modal.tsx            # Modal template
│   └── (drawer)/            # Drawer layout
│       ├── dashboard/       # Trang chủ
│       ├── medicines/       # Quản lý thuốc
│       ├── hoa-don/         # Hóa đơn (retail, wholesale, return)
│       ├── pos/             # Bán hàng
│       ├── reports/         # Báo cáo (revenue, inventory)
│       ├── partners/        # Nhà cung cấp & khách hàng
│       └── system/          # Cài đặt & nhân sự
│
├── components/              # React components
│   ├── layout/             # Header.tsx, Sidebar.tsx
│   ├── medicine/           # MedicineForm, MedicineCard, BatchInfo
│   ├── pos/                # Cart, PaymentModal, ProductGrid
│   └── ui/                 # Reusable UI (Button, Card, Input, Modal, Table...)
│
├── store/                   # Zustand stores (State Management)
│   ├── medicineStore.ts    # Quản lý state & actions cho thuốc
│   ├── authStore.ts        # Quản lý đăng nhập
│   └── cartStore.ts        # Quản lý giỏ hàng
│
├── hooks/                   # Custom React hooks
│   ├── useMedicines.ts     # Hook cho medicines store
│   ├── useAuth.ts          # Hook cho auth store
│   └── useCart.ts          # Hook cho cart store
│
├── services/                # Business logic
│   ├── DataManager.ts      # CRUD operations cho toàn bộ dữ liệu
│   └── ReportService.ts    # Tính toán báo cáo
│
├── types/                   # TypeScript interfaces/types
│   ├── medicine.ts         # Medicine, MedicineBatch types
│   ├── customer.ts         # Customer types
│   └── invoice.ts          # Invoice, PurchaseOrder types
│
├── context/                 # React Context
│   └── ThemeContext.tsx    # Dark/Light mode context
│
├── utils/                   # Utility functions
│   ├── formatters.ts       # Format tiền tệ, ngày giờ
│   └── validators.ts       # Kiểm tra dữ liệu
│
├── constants/               # Hằng số
│   ├── Colors.ts           # Định nghĩa màu
│   └── theme.ts            # Theme constants
│
├── data/                    # Mock data
│   └── pharmacy.json       # Dữ liệu mẫu
│
└── assets/                  # Hình ảnh, icons
    └── images/
```

## 💾 Hiểu về Data Flow

### State Management (Zustand)
```
┌─────────────────────┐
│   React Component   │
└──────────┬──────────┘
           │ (gọi hook)
           ↓
┌──────────────────────────┐
│    Custom Hook           │
│  (useMedicines, etc.)    │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│   Zustand Store          │
│ (state + actions)        │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│   localStorage           │
│ (Data persistence)       │
└──────────────────────────┘
```

### Ví dụ: Thêm thuốc mới

```typescript
// 1. Component gọi hook
const { addMedicine } = useMedicinesData();

// 2. Gọi action từ hook
addMedicine({
  id: '123',
  name: 'Aspirin 500mg',
  // ... other fields
});

// 3. Store cập nhật state
// 4. State tự động lưu vào localStorage
// 5. Component re-render với dữ liệu mới
```

## 🎯 Workflow Phát triển

### Khi muốn thêm feature mới:

1. **Xác định đó là feature gì** (page, component, hay logic?)

2. **Nếu là page mới**:
   - Tạo file trong `app/(drawer)/feature-name/index.tsx`
   - Import hooks & components cần thiết
   - Render UI

3. **Nếu là component mới**:
   - Tạo file trong `components/feature-name/ComponentName.tsx`
   - Viết logic & styling
   - Export component

4. **Nếu là state mới**:
   - Thêm vào store (VD: `store/customStore.ts`)
   - Tạo hook tương ứng (VD: `hooks/useCustom.ts`)
   - Sử dụng trong component

5. **Test trên trình duyệt**:
   - Mở web version: `npm run web`
   - Kiểm tra logic & UI

### Coding conventions

- **Naming**: camelCase cho functions/variables, PascalCase cho components/types
- **Props typing**: Luôn dùng TypeScript interfaces
- **Styling**: Dùng `StyleSheet.create()` hoặc inline styles với `colors` từ context
- **Comments**: Thêm comment cho logic phức tạp

## 🐛 Debugging

### Browser DevTools
Khi chạy `npm run web`, bạn có thể sử dụng:
- F12 hoặc Right-click → Inspect
- Console tab để xem logs
- Network tab để debug API calls

### React DevTools
Cài extension:
- Chrome: [React DevTools](https://chrome.google.com/webstore)
- Firefox: [React DevTools](https://addons.mozilla.org/firefox)

Dùng để inspect components, props, hooks state

### Logs
```typescript
console.log('Debug:', data);
console.error('Error:', error);
console.warn('Warning:', message);
```

## 🔐 Best Practices

### 1. Sử dụng TypeScript
```typescript
// ✅ Tốt
interface Props {
  name: string;
  age: number;
  onPress: (id: string) => void;
}

// ❌ Tránh
const MyComponent = ({ name, age, onPress }) => { }
```

### 2. Tách logic khỏi UI
```typescript
// ✅ Tốt: Logic ở hook
const { medicines, addMedicine } = useMedicinesData();

// ❌ Tránh: Logic ở component
const [medicines, setMedicines] = useState([]);
// ... 100 dòng code
```

### 3. Memoization cho performance
```typescript
// ✅ Memoize callback
const handlePress = useCallback(() => {
  addMedicine(data);
}, [addMedicine]);

// ✅ Memoize component
const MedicineCard = memo(({ medicine }) => {...});
```

### 4. Error handling
```typescript
// ✅ Luôn handle error
try {
  await login(username, password);
} catch (error) {
  alert('Đăng nhập thất bại: ' + error.message);
}
```

## 📱 Testing

### Chạy lint
```bash
npm run lint
```

### Test trên devices khác nhau

**Web responsive**:
- F12 → Toggle device toolbar
- Chọn iPad, iPhone, hoặc kích thước custom

**Mobile thực tế**:
- Cài Expo Go trên điện thoại
- Chạy `npm run start`
- Quét QR code

## 🚀 Deployment

### Web
```bash
# Build web version
npm run web -- --production

# Deploy to Vercel, Netlify, etc.
# (Follow provider-specific instructions)
```

### Mobile
```bash
# Build Android
eas build --platform android

# Build iOS
eas build --platform ios
```

## 📚 Tài liệu hữu ích

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ Câu hỏi thường gặp

**Q: Làm sao để thêm page mới?**
A: Tạo file trong `app/(drawer)/feature-name/index.tsx`

**Q: Làm sao để thêm store mới?**
A: Tạo file trong `store/customStore.ts`, rồi tạo hook tương ứng

**Q: Dữ liệu được lưu ở đâu?**
A: localStorage (web) hoặc AsyncStorage (mobile) thông qua `DataManager`

**Q: Làm sao để dark/light mode?**
A: Dùng `useTheme()` hook từ `ThemeContext`

**Q: Làm sao để gọi API backend?**
A: Thêm fetch call trong `DataManager` hoặc service mới

---

Happy coding! 🎉
