import { View, Text } from 'react-native';
import { Header } from '@/components/layout/Header';

export default function MedicinesScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Danh sách thuốc" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Medicines Screen - Coming soon</Text>
      </View>
    </View>
  );
}