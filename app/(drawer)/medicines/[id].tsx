import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/layout/Header';

export default function MedicineDetailScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <View style={{ flex: 1 }}>
      <Header title="Chi tiết thuốc" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Medicine Detail Screen - ID: {id}</Text>
      </View>
    </View>
  );
}