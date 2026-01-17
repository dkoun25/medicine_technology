import { Header } from '@/components/layout/Header';
import { Text, View } from 'react-native';

export default function AddMedicineScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Thêm thuốc mới" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Add Medicine Screen - Coming soon</Text>
      </View>
    </View>
  );
}