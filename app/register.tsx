import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { 
  validateEmail, 
  validatePhoneVN, 
  validateMedicineBasic 
} from '@/utils/validators';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthStore();
  const colorScheme = useColorScheme();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    pharmacyName: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    // Validate Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Tên không được để trống';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Tên phải có ít nhất 3 ký tự';
    }

    // Validate Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate Phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!validatePhoneVN(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (Việt Nam)';
    }

    // Validate Pharmacy Name
    if (!formData.pharmacyName.trim()) {
      newErrors.pharmacyName = 'Tên nhà thuốc không được để trống';
    } else if (formData.pharmacyName.trim().length < 3) {
      newErrors.pharmacyName = 'Tên nhà thuốc phải có ít nhất 3 ký tự';
    }

    // Validate Address
    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ không được để trống';
    }

    // Validate Password
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Validate Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Gọi hàm register từ store
        const success = await register(formData);
        if (success) {
          alert('✅ Đăng ký thành công! Vui lòng đăng nhập');
          router.replace('/login');
        } else {
          setErrors({ email: 'Email này đã được đăng ký' });
        }
      } catch (error) {
        setErrors({ email: 'Lỗi đăng ký, vui lòng thử lại' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>← Quay lại</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.title}>Đăng Ký Tài Khoản</ThemedText>
          <ThemedText style={styles.subtitle}>
            Quản lý cửa hàng bán thuốc của bạn
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Họ và tên</ThemedText>
            <Input
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              editable={!isLoading}
              style={[
                styles.input,
                errors.fullName && styles.inputError,
                { borderColor: errors.fullName ? '#ef4444' : colors.border },
              ]}
            />
            {errors.fullName && (
              <ThemedText style={styles.errorText}>{errors.fullName}</ThemedText>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <Input
              placeholder="nhap@email.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              editable={!isLoading}
              style={[
                styles.input,
                errors.email && styles.inputError,
                { borderColor: errors.email ? '#ef4444' : colors.border },
              ]}
            />
            {errors.email && (
              <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
            )}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Số điện thoại</ThemedText>
            <Input
              placeholder="0901234567"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              editable={!isLoading}
              style={[
                styles.input,
                errors.phone && styles.inputError,
                { borderColor: errors.phone ? '#ef4444' : colors.border },
              ]}
            />
            {errors.phone && (
              <ThemedText style={styles.errorText}>{errors.phone}</ThemedText>
            )}
          </View>

          {/* Pharmacy Name */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Tên nhà thuốc</ThemedText>
            <Input
              placeholder="Nhà thuốc Thép Phương"
              value={formData.pharmacyName}
              onChangeText={(value) => handleInputChange('pharmacyName', value)}
              editable={!isLoading}
              style={[
                styles.input,
                errors.pharmacyName && styles.inputError,
                { borderColor: errors.pharmacyName ? '#ef4444' : colors.border },
              ]}
            />
            {errors.pharmacyName && (
              <ThemedText style={styles.errorText}>{errors.pharmacyName}</ThemedText>
            )}
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Địa chỉ</ThemedText>
            <Input
              placeholder="123 Đường ABC, Quận XYZ, TP HCM"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              editable={!isLoading}
              multiline
              numberOfLines={3}
              style={[
                styles.input,
                styles.addressInput,
                errors.address && styles.inputError,
                { borderColor: errors.address ? '#ef4444' : colors.border },
              ]}
            />
            {errors.address && (
              <ThemedText style={styles.errorText}>{errors.address}</ThemedText>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Mật khẩu</ThemedText>
            <View style={styles.passwordContainer}>
              <Input
                placeholder="••••••"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password && styles.inputError,
                  { borderColor: errors.password ? '#ef4444' : colors.border },
                ]}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <ThemedText>{showPassword ? '👁️' : '👁️‍🗨️'}</ThemedText>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Xác nhận mật khẩu</ThemedText>
            <View style={styles.passwordContainer}>
              <Input
                placeholder="••••••"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.confirmPassword && styles.inputError,
                  { borderColor: errors.confirmPassword ? '#ef4444' : colors.border },
                ]}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <ThemedText>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</ThemedText>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>
            )}
          </View>

          {/* Register Button */}
          <Button
            title={isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
            onPress={handleRegister}
            disabled={isLoading}
            style={styles.registerButton}
          />
        </View>

        {/* Back to Login */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Đã có tài khoản? </ThemedText>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <ThemedText style={styles.loginLink}>Đăng nhập ngay</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  addressInput: {
    paddingVertical: 30,
    textAlignVertical: 'top',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
  },
  registerButton: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
