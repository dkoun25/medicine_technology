import { View, Text } from 'react-native';
import { Header } from '@/components/layout/Header';

export default function POSScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Bán thuốc POS" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>POS Screen - Coming soon</Text>
      </View>
    </View>
  );
}