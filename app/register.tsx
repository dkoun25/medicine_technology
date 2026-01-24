import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePhoneVN } from '@/utils/validators';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';

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
  const textSecondary = isDark ? '#cbd5e1' : '#5f6a7d';
  const accentGreen = '#22c55e';
  const accentOrange = '#f97316';

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Tên không được để trống';
    else if (formData.fullName.trim().length < 3) newErrors.fullName = 'Tên phải có ít nhất 3 ký tự';

    if (!formData.email.trim()) newErrors.email = 'Email không được để trống';
    else if (!validateEmail(formData.email)) newErrors.email = 'Email không hợp lệ (ví dụ: user@gmail.com)';

    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại không được để trống';
    else if (!validatePhoneVN(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ (Việt Nam)';

    if (!formData.pharmacyName.trim()) newErrors.pharmacyName = 'Tên nhà thuốc không được để trống';
    else if (formData.pharmacyName.trim().length < 3) newErrors.pharmacyName = 'Tên nhà thuốc phải có ít nhất 3 ký tự';

    if (!formData.address.trim()) newErrors.address = 'Địa chỉ không được để trống';

    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const success = await register(formData);
        if (success) {
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const updated = { ...errors };
      delete updated[field];
      setErrors(updated);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <View style={[styles.heroCard, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}25` }]}> 
            <ThemedText style={[styles.badge, { color: colors.primary, borderColor: `${colors.primary}40` }]}>Thiết lập trong 1 phút</ThemedText>
            <ThemedText style={[styles.title, { color: colors.text }]}>Tạo tài khoản nhà thuốc</ThemedText>
            <ThemedText style={[styles.subtitle, { color: textSecondary }]}>Đồng bộ bán hàng, kho, báo cáo trên một nền tảng.</ThemedText>
            <View style={styles.heroChips}>
              <View style={[styles.chip, { backgroundColor: `${colors.primary}15` }]}><ThemedText style={[styles.chipText, { color: colors.primary }]}>POS</ThemedText></View>
              <View style={[styles.chip, { backgroundColor: `${accentGreen}20` }]}><ThemedText style={[styles.chipText, { color: accentGreen }]}>Kho</ThemedText></View>
              <View style={[styles.chip, { backgroundColor: `${accentOrange}20` }]}><ThemedText style={[styles.chipText, { color: accentOrange }]}>Báo cáo</ThemedText></View>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card ?? '#fff', borderColor: colors.border }]}> 
          <ThemedText style={[styles.cardTitle, { color: colors.text }]}>Đăng ký tài khoản</ThemedText>
          <ThemedText style={[styles.cardSubtitle, { color: textSecondary }]}>Nhập thông tin để kích hoạt không gian quản lý của bạn.</ThemedText>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>Họ và tên</ThemedText>
              <Input
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChangeText={(v) => handleInputChange('fullName', v)}
                editable={!isLoading}
                style={styles.inputText}
                error={errors.fullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>Email</ThemedText>
              <Input
                placeholder="nhap@email.com"
                value={formData.email}
                onChangeText={(v) => handleInputChange('email', v)}
                keyboardType="email-address"
                editable={!isLoading}
                style={styles.inputText}
                error={errors.email}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>Số điện thoại</ThemedText>
              <Input
                placeholder="0901234567"
                value={formData.phone}
                onChangeText={(v) => handleInputChange('phone', v)}
                keyboardType="phone-pad"
                editable={!isLoading}
                style={styles.inputText}
                error={errors.phone}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>Tên nhà thuốc</ThemedText>
              <Input
                placeholder="Nhà thuốc ABC"
                value={formData.pharmacyName}
                onChangeText={(v) => handleInputChange('pharmacyName', v)}
                editable={!isLoading}
                style={styles.inputText}
                error={errors.pharmacyName}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>Địa chỉ</ThemedText>
              <Input
                placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                value={formData.address}
                onChangeText={(v) => handleInputChange('address', v)}
                editable={!isLoading}
                multiline
                numberOfLines={3}
                style={[styles.inputText, styles.textArea]}
                error={errors.address}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>Mật khẩu</ThemedText>
              <View style={styles.passwordWrapper}>
                <Input
                  placeholder="••••••"
                  value={formData.password}
                  onChangeText={(v) => handleInputChange('password', v)}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  style={[styles.inputText, styles.passwordInput]}
                  error={errors.password}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <ThemedText>{showPassword ? '🙈' : '👁'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>Xác nhận mật khẩu</ThemedText>
              <View style={styles.passwordWrapper}>
                <Input
                  placeholder="••••••"
                  value={formData.confirmPassword}
                  onChangeText={(v) => handleInputChange('confirmPassword', v)}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  style={[styles.inputText, styles.passwordInput]}
                  error={errors.confirmPassword}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <ThemedText>{showConfirmPassword ? '🙈' : '👁'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title={isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              onPress={handleRegister}
              disabled={isLoading}
              style={styles.submitButton}
            />
          </View>

          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: textSecondary }]}>Đã có tài khoản? </ThemedText>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <ThemedText style={[styles.signInLink, { color: colors.primary }]}>Đăng nhập</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  heroWrap: { marginBottom: 24 },
  heroCard: { padding: 20, borderRadius: 16, borderWidth: 1, gap: 10 },
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
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, opacity: 0.8 },
  heroChips: { flexDirection: 'row', gap: 10, marginTop: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { fontSize: 12, fontWeight: '600' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 10,
  },
  cardTitle: { fontSize: 20, fontWeight: '700' },
  cardSubtitle: { fontSize: 14, opacity: 0.8, marginBottom: 8 },
  form: { gap: 14 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  inputText: { fontSize: 14, paddingVertical: 0 },
  textArea: { height: 96, textAlignVertical: 'top' },
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 42 },
  eyeButton: { position: 'absolute', right: 10, top: 12, padding: 6 },
  submitButton: { marginTop: 6 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 },
  footerText: { fontSize: 13, opacity: 0.8 },
  signInLink: { fontSize: 13, fontWeight: '700' },
});
