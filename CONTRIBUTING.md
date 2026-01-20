<!-- prettier-ignore -->
# 🤝 Contributing Guide

Cảm ơn bạn quan tâm đến dự án Medicine Technology! Dưới đây là hướng dẫn để đóng góp vào project.

## 📋 Trước khi bắt đầu

1. Fork repository
2. Clone về máy: `git clone https://github.com/your-username/medicine_technology.git`
3. Tạo branch feature mới: `git checkout -b feature/your-feature-name`
4. Cài đặt dependencies: `npm install`

## 🎯 Quy trình phát triển

### 1. Chọn task
- Chọn task từ `TASKS.md`
- Hoặc tạo issue mới nếu phát hiện bug
- Assign cho chính mình trong GitHub

### 2. Tạo branch
```bash
# Feature
git checkout -b feature/barcode-scanning

# Bug fix
git checkout -b bugfix/cart-calculation

# Documentation
git checkout -b docs/api-guide

# Chore (dependencies, etc)
git checkout -b chore/update-dependencies
```

### 3. Code & Commit

#### Quy tắc Code
- ✅ Dùng **TypeScript** cho tất cả files
- ✅ Tuân thủ **ESLint** rules
- ✅ Format code với **Prettier**
- ✅ Viết **descriptive names** cho variables/functions
- ✅ Thêm **comments** cho logic phức tạp

#### Commit Messages
```bash
# Format: [type]: [description]

# Examples:
git commit -m "feat: Add barcode scanning feature"
git commit -m "fix: Correct cart total calculation"
git commit -m "docs: Update README with examples"
git commit -m "refactor: Simplify medicine search logic"
git commit -m "chore: Update dependencies"
git commit -m "test: Add medicine store tests"

# Types:
# feat:     New feature
# fix:      Bug fix
# docs:     Documentation
# refactor: Code refactoring
# test:     Adding tests
# chore:    Dependencies, build, etc
# style:    Code style (formatting)
# perf:     Performance improvement
```

### 4. Testing

```bash
# Test web version
npm run web

# Test Android emulator
npm run android

# Test iOS simulator
npm run ios

# Lint check
npm run lint
```

### 5. Push & Create PR

```bash
# Push branch
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Fill in the PR template with:
# - Description of changes
# - Why this change is needed
# - Screenshots (if UI change)
# - Related issues
```

## 📐 Code Structure

### File Organization
```
Tên file harus descriptive:
❌ index.js, func.ts, helper.tsx
✅ useAuth.ts, MedicineForm.tsx, formatters.ts
```

### Component Structure
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  title: string;
  onPress: () => void;
  isDark?: boolean;
}

export const MyComponent: React.FC<Props> = ({ title, onPress, isDark = false }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
});
```

### Hook Structure
```typescript
import { useEffect } from 'react';
import { useMedicineStore } from '@/store/medicineStore';

export const useMedicinesData = () => {
  const store = useMedicineStore();

  useEffect(() => {
    // Initialize if needed
  }, []);

  return {
    // Expose methods and data
  };
};
```

## ✅ Code Review Checklist

Trước khi tạo PR, kiểm tra:

- [ ] Code tuân thủ TypeScript types
- [ ] Không có console.log() dư thừa
- [ ] Xử lý error cases
- [ ] Loading states
- [ ] Mobile responsive
- [ ] Dark mode compatible
- [ ] Commented code removed
- [ ] No breaking changes

## 🧪 Testing Guidelines

### Unit Testing
```typescript
describe('formatCurrency', () => {
  it('should format number with currency symbol', () => {
    const result = formatCurrency(1000000);
    expect(result).toBe('1.000.000 ₫');
  });
});
```

### Integration Testing
```typescript
describe('useMedicinesData', () => {
  it('should fetch medicines on mount', async () => {
    const { result } = renderHook(() => useMedicinesData());
    await waitFor(() => {
      expect(result.current.medicines.length).toBeGreaterThan(0);
    });
  });
});
```

## 📚 Documentation Standards

### Code Comments
```typescript
// ❌ Bad
// Get user
const user = getUser(id);

// ✅ Good
// Fetch user by ID with caching strategy
// Returns null if user not found or cache expired
const user = getUser(id);
```

### Function Documentation
```typescript
/**
 * Format số thành tiền VND
 * @param amount - Số tiền
 * @param showCurrency - Có hiển thị ký hiệu ₫? (default: true)
 * @returns Chuỗi định dạng VND
 * @example
 * formatCurrency(1000000) // "1.000.000 ₫"
 */
export const formatCurrency = (amount: number, showCurrency = true): string => {
  // implementation
};
```

## 🚨 Common Mistakes

### ❌ DON'T
```typescript
// 1. Không dùng any
const data: any = fetchData();

// 2. Không dùng try-catch mà không handle
try {
  await someAsyncAction();
} catch (e) {}

// 3. Không xóa console.log trước commit
console.log('debug:', data);

// 4. Không hardcode values
const COLORS = { primary: '#137fec' };

// 5. Không nested callbacks (callback hell)
getData((data) => {
  processData(data, (result) => {
    saveData(result, (saved) => {
      // ...
    });
  });
});
```

### ✅ DO
```typescript
// 1. Dùng TypeScript types
interface UserData {
  id: string;
  name: string;
}
const data: UserData = fetchData();

// 2. Proper error handling
try {
  await someAsyncAction();
} catch (error) {
  console.error('Action failed:', error);
  showErrorToast(error.message);
}

// 3. Xóa debug code trước commit
// console.log('debug:', data); // Uncomment if needed

// 4. Dùng constants
const COLORS = THEME.colors;

// 5. Dùng async/await
const data = await getData();
const result = await processData(data);
const saved = await saveData(result);
```

## 🔒 Security Guidelines

1. **Input Validation**
   - Luôn validate user input
   - Dùng validators từ `utils/validators.ts`

2. **No Secrets in Code**
   - Dùng environment variables (`.env`)
   - Không commit API keys, passwords

3. **Data Privacy**
   - Xóa localStorage khi logout
   - Hash sensitive data

4. **Error Messages**
   - Không leak sensitive info
   - Generic messages để users

## 🎨 Style Guide

### Naming Conventions
```typescript
// Variables & Functions: camelCase
const userName = 'John';
function getUserData() {}

// Components & Classes: PascalCase
const MedicineCard = () => {};
class DataManager {}

// Constants: UPPER_SNAKE_CASE
const MAX_STOCK = 1000;
const API_URL = 'https://api.example.com';

// Boolean: is/has prefix
const isLoading = true;
const hasError = false;
```

### Import Organization
```typescript
// 1. React & React Native
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. External libraries
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// 3. Project files
import { useTheme } from '@/context/ThemeContext';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
```

## 📤 PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Screenshots
(if applicable)

## Testing
- [ ] Tested on web
- [ ] Tested on Android
- [ ] Tested on iOS
- [ ] No console errors

## Checklist
- [ ] Code follows style guide
- [ ] Self-reviewed
- [ ] Commented complex code
- [ ] No breaking changes
```

## 🎯 Useful Commands

```bash
# Install dependencies
npm install

# Run web version
npm run web

# Run linter
npm run lint

# Format code
npm run format

# Build production
npm run build

# Run tests
npm test

# Create new component
# (Create file in components/your-component/)

# Create new page
# (Create folder in app/(drawer)/your-page/)
```

## 🏆 Best Contributors

Contributors with most merged PRs dan high quality code get:
- Recognition in README
- Admin access (if interested)
- Priority for code reviews

## 📞 Need Help?

- Check documentation first (README, DEVELOPMENT.md)
- Search existing issues
- Ask in GitHub discussions
- Reach out to maintainers

## 📜 License

By contributing, you agree your code will be under MIT License

---

**Thank you for contributing! 🙏**

Your work helps make Medicine Technology better for everyone!
