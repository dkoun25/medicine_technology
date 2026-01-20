import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RootIndex() {
  const { user } = useAuth();

  // Nếu đã đăng nhập, vào dashboard
  if (user) {
    return <Redirect href="/(drawer)/dashboard" />;
  }

  // Nếu chưa đăng nhập, vào login
  return <Redirect href="/login" />;
}
