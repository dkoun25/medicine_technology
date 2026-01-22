import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/utils/validators';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';

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
  const textSecondary = isDark ? '#cbd5e1' : '#5f6a7d';
  const accentGreen = '#22c55e';
  const accentOrange = '#f97316';

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
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <View style={[styles.heroCard, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}25` }]}> 
            <ThemedText style={[styles.badge, { color: colors.primary, borderColor: `${colors.primary}40` }]}>All-in-one Pharmacy POS</ThemedText>
            <ThemedText style={[styles.title, { color: colors.text }]}>Quản lý nhà thuốc</ThemedText>
            <ThemedText style={[styles.subtitle, { color: textSecondary }]}>Bán hàng nhanh, kiểm kho chuẩn, báo cáo tức thời.</ThemedText>
            <View style={styles.heroChips}>
              <View style={[styles.chip, { backgroundColor: `${colors.primary}15` }]}><ThemedText style={[styles.chipText, { color: colors.primary }]}>POS</ThemedText></View>
              <View style={[styles.chip, { backgroundColor: `${accentGreen}20` }]}><ThemedText style={[styles.chipText, { color: accentGreen }]}>Kho</ThemedText></View>
              <View style={[styles.chip, { backgroundColor: `${accentOrange}20` }]}><ThemedText style={[styles.chipText, { color: accentOrange }]}>Báo cáo</ThemedText></View>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card ?? colors.backgroundCard ?? '#fff', borderColor: colors.border }]}>
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>Đăng nhập</ThemedText>
          <ThemedText style={[styles.cardSubtitle, { color: textSecondary }]}>Dùng tài khoản demo hoặc email của bạn.</ThemedText>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>Email</ThemedText>
              <Input
                placeholder="admin@pharmacy.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!isLoading}
                style={styles.inputText}
                error={errors.email}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>Mật khẩu</ThemedText>
              <View style={styles.passwordContainer}>
                <Input
                  placeholder="••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  style={[styles.inputText, styles.passwordInput]}
                  error={errors.password}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <ThemedText>{showPassword ? '👁️' : '👁️‍🗨️'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <Button title={isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'} onPress={handleLogin} disabled={isLoading} style={styles.loginButton} />
          </View>

          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: textSecondary }]}>Chưa có tài khoản? </ThemedText>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <ThemedText style={[styles.signUpLink, { color: colors.primary }]}>Đăng ký ngay</ThemedText>
            </TouchableOpacity>
          </View>
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
    paddingTop: 56,
    paddingBottom: 40,
  },
  heroWrap: {
    marginBottom: 24,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  heroChips: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 18,
  },
  form: {
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputText: {
    paddingVertical: 0,
    fontSize: 14,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 42,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 12,
    padding: 6,
  },
  loginButton: {
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    opacity: 0.8,
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
