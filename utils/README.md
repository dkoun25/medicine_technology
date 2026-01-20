# Utils Directory

Utility functions cho formatting, validation, và helper functions.

## 📚 Available Utilities

### `formatters.ts` (15+ functions)
Functions để format dữ liệu hiển thị.

**Tiền tệ:**
- `formatCurrency(amount, showCurrency)` - Format VND
- `formatNumber(num)` - Format số

**Ngày giờ:**
- `formatDate(dateString)` - Format "DD/MM/YYYY"
- `formatDateTime(dateString)` - Format "DD/MM/YYYY HH:MM"
- `formatTime(dateString)` - Format "HH:MM"
- `getTodayISO()` - Lấy ngày hôm nay
- `getDaysUntilExpiry(expiryDate)` - Số ngày còn lại
- `isExpired(expiryDate)` - Đã hết hạn?

**Phần trăm:**
- `calculatePercentageChange(old, new)` - % thay đổi
- `formatPercent(percent, decimals)` - Format %

**Khác:**
- `formatBarcode(barcode)` - Format mã barcode
- `capitalizeFirstLetter(str)` - Viết hoa chữ cái đầu
- `truncateText(text, maxLength)` - Cắt text dài
- `formatQuantity(qty)` - Format số lượng
- `generateCode(prefix, number)` - Tạo mã

**Status:**
- `getInvoiceStatusLabel(status)` - Nhãn trạng thái
- `getInvoiceTypeLabel(type)` - Nhãn loại hóa đơn
- `getRoleLabel(role)` - Nhãn quyền hạn

### `validators.ts` (20+ functions)
Functions để validate dữ liệu.

**Email & Phone:**
- `isValidEmail(email)` - Kiểm tra email
- `isValidPhoneVN(phone)` - Kiểm tra SĐT VN
- `isValidPhoneInternational(phone)` - SĐT quốc tế

**Số & Giá trị:**
- `isPositiveNumber(value)` - Là số dương?
- `isNonNegativeNumber(value)` - Là số ≥ 0?
- `isInteger(value)` - Là số nguyên?
- `isInRange(value, min, max)` - Trong range?
- `isValidPercent(value)` - % hợp lệ (0-100)?

**Ngày giờ:**
- `isValidDate(dateString)` - Ngày hợp lệ?
- `isExpired(expiryDate)` - Đã hết hạn?
- `isFutureDate(dateString)` - Là ngày tương lai?

**Text:**
- `isNotEmpty(value)` - Không rỗng?
- `isValidLength(value, min, max)` - Độ dài ok?
- `isAlphanumeric(value)` - Chỉ chữ số?
- `hasSpaces(value)` - Có khoảng trắng?

**Barcode & Mã:**
- `isValidBarcode(barcode)` - Barcode hợp lệ?
- `isValidInvoiceCode(code)` - Mã HĐ ok?
- `isValidIdentityCardVN(idCard)` - CMND/CCCD ok?

**Business Logic:**
- `validateMedicineBasic(medicine)` - Validate thuốc
- `validateCustomerBasic(customer)` - Validate KH
- `validateInvoiceBasic(invoice)` - Validate HĐ
- `validateBatchBasic(batch)` - Validate lô
- `validateForm(data, validators)` - Gom lại errors
- `hasErrors(errors)` - Có error?
- `getErrorMessage(errors)` - Lấy error string

## 🎯 Usage Examples

### Ví dụ 1: Format tiền tệ
```typescript
import { formatCurrency, formatNumber } from '@/utils/formatters';

// Format VND
const price = formatCurrency(1000000);
console.log(price); // "1.000.000 ₫"

// Chỉ format số
const num = formatNumber(1000000);
console.log(num); // "1.000.000"
```

### Ví dụ 2: Format ngày
```typescript
import { formatDate, formatDateTime, getDaysUntilExpiry } from '@/utils/formatters';

const date = '2024-01-20T10:30:00';
console.log(formatDate(date));     // "20/01/2024"
console.log(formatDateTime(date)); // "20/01/2024 10:30"

const expiryDate = '2024-02-20';
const daysLeft = getDaysUntilExpiry(expiryDate);
console.log(daysLeft); // Số ngày còn lại
```

### Ví dụ 3: Validate dữ liệu
```typescript
import { isValidEmail, validateMedicineBasic } from '@/utils/validators';

// Kiểm tra email
if (!isValidEmail(email)) {
  alert('Email không hợp lệ');
}

// Validate thuốc
const medicine = { name: 'Aspirin', ... };
const errors = validateMedicineBasic(medicine);

if (errors.length > 0) {
  console.log('Errors:', errors);
  // ['Tên thuốc phải từ 3-100 ký tự', ...]
}
```

### Ví dụ 4: Validate form
```typescript
import { validateForm, hasErrors, getErrorMessage } from '@/utils/validators';

const data = { name: 'John', email: 'invalid' };

const errors = validateForm(data, [
  validateMedicineBasic,
  validateCustomerBasic
]);

if (hasErrors(errors)) {
  alert(getErrorMessage(errors));
  // Hiển thị tất cả errors
}
```

### Ví dụ 5: Dùng trong component
```typescript
import { formatCurrency, isValidPhone } from '@/utils';
import { TextInput, Text } from 'react-native';

export default function PriceDisplay() {
  const [phone, setPhone] = useState('');
  const price = 1000000;

  return (
    <>
      <Text>Price: {formatCurrency(price)}</Text>
      
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone"
      />
      {phone && !isValidPhoneVN(phone) && (
        <Text style={{ color: 'red' }}>Invalid phone</Text>
      )}
    </>
  );
}
```

## 🔧 Configuration

Các constants được tập trung trong `config.ts`:

```typescript
import { DEFAULTS, VALIDATION } from '@/constants/config';

// Dùng defaults
const minStock = DEFAULTS.DEFAULT_MIN_STOCK; // 10

// Validation rules
const maxLength = VALIDATION.CUSTOMER_NAME.MAX; // 50
```

## 🎓 Best Practices

### 1. Luôn kiểm tra dữ liệu trước validate
```typescript
// ✅ Good
if (!data) return;
const errors = validateForm(data, [validator]);

// ❌ Bad
const errors = validateForm(null, [validator]);
```

### 2. Sử dụng compose validators
```typescript
// ✅ Good
const errors = validateForm(data, [
  validateMedicineBasic,
  validateCustomFields
]);

// Có thể thêm custom validator
const customValidator = (data) => {
  const errors = [];
  if (data.price < 0) errors.push('Price must be positive');
  return errors;
};
```

### 3. Humanize error messages
```typescript
// ✅ Good
const errors = validateMedicineBasic(medicine);
if (errors.length > 0) {
  showErrorAlert(errors.join('\n'));
}

// ❌ Bad
if (errors.length > 0) {
  console.log(errors); // Users won't see
}
```

## 📖 Adding New Formatter

```typescript
// File: utils/formatters.ts

/**
 * Format custom value
 * @param value - Input value
 * @returns Formatted string
 */
export const formatCustom = (value: any): string => {
  // Implementation
  return formatted;
};
```

## 📖 Adding New Validator

```typescript
// File: utils/validators.ts

/**
 * Validate something
 * @param value - Value to validate
 * @returns true if valid, false otherwise
 */
export const isValidCustom = (value: any): boolean => {
  // Implementation
  return valid;
};

// Or return errors array
export const validateCustom = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.field) {
    errors.push('Field is required');
  }
  
  return errors;
};
```

## 🧪 Testing Utilities

```typescript
describe('formatCurrency', () => {
  it('should format number with currency', () => {
    expect(formatCurrency(1000000)).toBe('1.000.000 ₫');
    expect(formatCurrency(0)).toBe('0 ₫');
  });
});

describe('isValidEmail', () => {
  it('should validate email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

## 📚 Related Files
- Configuration: `/constants/config.ts`
- Type definitions: `/types/`
- Usage in components: `/app/`, `/components/`
