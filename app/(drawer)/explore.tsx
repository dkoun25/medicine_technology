import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

// Đã loại bỏ màn hình Explore mặc định. Điều hướng về dashboard.
export default function ExploreRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return <View />;
}
