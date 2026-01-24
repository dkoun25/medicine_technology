import { useTheme } from '@/context/ThemeContext'; // Import context
import { dataManager } from '@/services/DataManager';
import { useAuthStore } from '@/store/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { logout } = useAuthStore();
  // 1. Lấy theme và colors từ context
  const { colors, isDark } = useTheme();

  const STORAGE_KEY = 'pharmacy_data_v1';
  const BACKUP_KEY = 'pharmacy_data_backup_v1';
  const INVOICES_KEY = 'invoices';
  const INVOICES_BACKUP_KEY = 'invoices_backup';
  const PURCHASE_ORDERS_KEY = 'purchase_orders';
  const PURCHASE_ORDERS_BACKUP_KEY = 'purchase_orders_backup';

  // 2. Lấy state từ DataManager
  const [settings, setSettings] = useState(dataManager.getSettings());
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const isEditing = isEditingShop || isEditingAddress;
  const [tempShopName, setTempShopName] = useState(settings.shopName);
  const [tempShopAddress, setTempShopAddress] = useState(settings.shopAddress);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    dataManager.updateSettings(newSettings);
  };

  const handleSaveShopInfo = () => {
    // Lưu cả tên và địa chỉ cùng lúc để tránh xung đột state
    const newSettings = { 
      ...settings, 
      shopName: tempShopName,
      shopAddress: tempShopAddress
    };
    setSettings(newSettings);
    dataManager.updateSettings(newSettings);
    setIsEditingShop(false);
    setIsEditingAddress(false);
    showToast('✅ Đã lưu thông tin nhà thuốc thành công');
  };

  const showToast = (msg: string) => {
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Thông báo', msg);
  };

  const handleBackupNow = async () => {
    try {
      // Backup tất cả các keys quan trọng
      const current = await AsyncStorage.getItem(STORAGE_KEY);
      const invoices = await AsyncStorage.getItem(INVOICES_KEY);
      const purchaseOrders = await AsyncStorage.getItem(PURCHASE_ORDERS_KEY);
      
      if (!current && !invoices && !purchaseOrders) {
        showToast('Chưa có dữ liệu để sao lưu.');
        return;
      }
      
      // Backup từng key
      if (current) await AsyncStorage.setItem(BACKUP_KEY, current);
      if (invoices) await AsyncStorage.setItem(INVOICES_BACKUP_KEY, invoices);
      if (purchaseOrders) await AsyncStorage.setItem(PURCHASE_ORDERS_BACKUP_KEY, purchaseOrders);
      
      showToast('✅ Đã sao lưu dữ liệu thành công.');
    } catch (error) {
      showToast('❌ Sao lưu thất bại.');
      console.error('Backup error:', error);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const backupData = await AsyncStorage.getItem(BACKUP_KEY);
      const backupInvoices = await AsyncStorage.getItem(INVOICES_BACKUP_KEY);
      const backupPurchaseOrders = await AsyncStorage.getItem(PURCHASE_ORDERS_BACKUP_KEY);
      
      if (!backupData && !backupInvoices && !backupPurchaseOrders) {
        showToast('Không tìm thấy bản lưu gần nhất.');
        return;
      }
      
      // Restore tất cả keys
      if (backupData) await AsyncStorage.setItem(STORAGE_KEY, backupData);
      if (backupInvoices) await AsyncStorage.setItem(INVOICES_KEY, backupInvoices);
      if (backupPurchaseOrders) await AsyncStorage.setItem(PURCHASE_ORDERS_KEY, backupPurchaseOrders);
      
      // Force reload dữ liệu từ storage vào memory
      await dataManager.reloadFromStorage();
      
      // Cập nhật lại UI ngay lập tức
      setSettings(dataManager.getSettings());
      setTempShopName(dataManager.getSettings().shopName);
      setTempShopAddress(dataManager.getSettings().shopAddress);
      
      showToast('✅ Đã khôi phục bản lưu gần nhất.');
    } catch (error) {
      showToast('❌ Khôi phục thất bại.');
      console.error('Restore error:', error);
    }
  };

  const handleResetData = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('⚠️ Xác nhận reset dữ liệu?\n\nTất cả thay đổi sẽ bị xóa và quay về dữ liệu mặc định từ pharmacy.json.');
      if (confirmed) {
        await dataManager.resetToDefault();
        showToast('✅ Đã reset dữ liệu thành công! Vui lòng tải lại trang.');
        setTimeout(() => window.location.reload(), 1500);
      }
    } else {
      Alert.alert(
        '⚠️ Reset dữ liệu',
        'Tất cả thay đổi (thuốc, hóa đơn, khách hàng) sẽ bị xóa và quay về dữ liệu mặc định.\n\nBạn có chắc chắn?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: async () => {
              await dataManager.resetToDefault();
              Alert.alert('✅ Thành công', 'Dữ liệu đã được reset. Vui lòng khởi động lại app.', [
                { text: 'OK' }
              ]);
            },
          },
        ]
      );
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logout button clicked!');
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
      if (confirmed) {
        console.log('Logging out...');
        logout();
        console.log('Navigating to login...');
        router.replace('/login' as any);
      } else {
        console.log('Logout cancelled');
      }
    } else {
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất?',
        [
          { 
            text: 'Hủy', 
            style: 'cancel',
            onPress: () => console.log('Logout cancelled')
          },
          {
            text: 'Đăng xuất',
            style: 'destructive',
            onPress: () => {
              console.log('Logging out...');
              logout();
              console.log('Navigating to login...');
              router.replace('/login' as any);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <MaterialIcons name="menu" size={28} color={colors.text} />
              </TouchableOpacity>
            )}
            <Text style={[styles.headerTitle, { color: colors.text }]}>Cài đặt hệ thống</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        
        {/* SECTION 1: Cửa hàng */}
        <Text style={styles.sectionTitle}>THÔNG TIN NHÀ THUỐC</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Tên nhà thuốc</Text>
              {!isEditing ? (
                <TouchableOpacity onPress={() => setIsEditingShop(true)}>
                  <Text style={{color: colors.primary, fontWeight: '600'}}>Sửa</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleSaveShopInfo}>
                  <Text style={{color: colors.primary, fontWeight: '600'}}>Lưu</Text>
                </TouchableOpacity>
              )}
            </View>
            {isEditingShop ? (
                <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.primary }]} 
                    value={tempShopName} 
                    onChangeText={setTempShopName} 
                    autoFocus
                />
            ) : (
                <Text style={[styles.valueText, { color: colors.text }]}>{settings.shopName}</Text>
            )}
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Địa chỉ</Text>
              {!isEditingAddress ? (
                <TouchableOpacity onPress={() => setIsEditingAddress(true)}>
                  <Text style={{color: colors.primary, fontWeight: '600'}}>Sửa</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleSaveShopInfo}>
                  <Text style={{color: colors.primary, fontWeight: '600'}}>Lưu</Text>
                </TouchableOpacity>
              )}
            </View>
            {isEditingAddress ? (
              <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.primary }]} 
                value={tempShopAddress} 
                onChangeText={setTempShopAddress}
              />
            ) : (
              <Text style={[styles.valueText, { color: colors.text }]}>{settings.shopAddress}</Text>
            )}
          </View>
        </View>

        {/* SECTION 3: Sao lưu dữ liệu */}
        <Text style={styles.sectionTitle}>SAO LƯU DỮ LIỆU</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Backup = upload to cloud */}
          <TouchableOpacity style={styles.actionRow} onPress={handleBackupNow}>
            <MaterialIcons name="cloud-download" size={20} color="#0ea5e9" />
            <Text style={[styles.actionText, { color: colors.text }]}>Sao lưu dữ liệu ngay</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {/* Restore = download from cloud */}
          <TouchableOpacity style={styles.actionRow} onPress={handleRestoreBackup}>
            <MaterialIcons name="cloud-upload" size={20} color="#0ea5e9" />
            <Text style={[styles.actionText, { color: colors.text }]}>Tải lên bản lưu gần nhất</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20, alignItems: 'center' }}>
            <TouchableOpacity 
              style={[styles.logoutBtn, { backgroundColor: isDark ? '#450a0a' : '#fef2f2', borderColor: isDark ? '#7f1d1d' : '#fecaca' }]}
              onPress={() => {
                console.log('👆 Logout TouchableOpacity pressed');
                handleLogout();
              }}
              activeOpacity={0.6}
            >
                <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Đăng xuất</Text>
            </TouchableOpacity>
            <Text style={{ marginTop: 10, color: '#9ca3af', fontSize: 12 }}>Phiên bản 1.0.2 (Build 20260519)</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: Platform.OS === 'web' ? 20 : 50, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#9ca3af', marginTop: 20, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  
  // Styles cho Setting Item
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: 16 },
  itemSub: { fontSize: 12 },
  
  // Styles cho Shop Info
  label: { fontSize: 13, color: '#9ca3af', marginBottom: 4 },
  valueText: { fontSize: 16, fontWeight: '500' },
  input: { borderBottomWidth: 1, paddingVertical: 4, fontSize: 16 },
  
  divider: { height: 1, marginLeft: 16 },
  
  // Styles cho Permissions
  permRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  permText: { fontSize: 14 },

  // Styles cho Action Rows
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  actionText: { fontSize: 15 },

  logoutBtn: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 20, borderWidth: 1 }
});