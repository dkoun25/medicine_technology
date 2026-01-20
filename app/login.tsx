import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { isValidEmail } from '@/utils/validators';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const handleLogin = async () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Gọi hàm login từ store
        const success = await login(email, password);
        if (success) {
          router.replace('/(drawer)/dashboard');
        } else {
          setErrors({ email: 'Email hoặc mật khẩu không đúng' });
        }
      } catch (error) {
        setErrors({ email: 'Lỗi đăng nhập, vui lòng thử lại' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>💊 Quản Lý Thuốc</ThemedText>
          <ThemedText style={styles.subtitle}>
            Hệ thống quản lý cửa hàng bán thuốc
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <Input
              placeholder="nhap@email.com"
              value={email}
              onChangeText={setEmail}
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

          {/* Password */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Mật khẩu</ThemedText>
            <View style={styles.passwordContainer}>
              <Input
                placeholder="••••••"
                value={password}
                onChangeText={setPassword}
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

          {/* Login Button */}
          <Button
            title={isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginButton}
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.text }]} />
          <ThemedText style={styles.dividerText}>hoặc</ThemedText>
          <View style={[styles.divider, { backgroundColor: colors.text }]} />
        </View>

        {/* Demo Accounts */}
        <View style={styles.demoContainer}>
          <ThemedText style={styles.demoTitle}>📋 Tài khoản Demo</ThemedText>
          
          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => {
              setEmail('admin@pharmacy.com');
              setPassword('admin123');
            }}
          >
            <ThemedText style={styles.demoButtonText}>👨‍💼 Admin</ThemedText>
            <ThemedText style={styles.demoButtonEmail}>admin@pharmacy.com</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: '#3b82f6' + '20' }]}
            onPress={() => {
              setEmail('manager@pharmacy.com');
              setPassword('manager123');
            }}
          >
            <ThemedText style={styles.demoButtonText}>📊 Manager</ThemedText>
            <ThemedText style={styles.demoButtonEmail}>manager@pharmacy.com</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: '#10b981' + '20' }]}
            onPress={() => {
              setEmail('staff@pharmacy.com');
              setPassword('staff123');
            }}
          >
            <ThemedText style={styles.demoButtonText}>👤 Staff</ThemedText>
            <ThemedText style={styles.demoButtonEmail}>staff@pharmacy.com</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Chưa có tài khoản? </ThemedText>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <ThemedText style={styles.signUpLink}>Đăng ký ngay</ThemedText>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
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
    marginBottom: 20,
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
  loginButton: {
    marginTop: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    fontSize: 12,
    opacity: 0.6,
  },
  demoContainer: {
    marginBottom: 30,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  demoButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  demoButtonText: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  demoButtonEmail: {
    fontSize: 12,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
