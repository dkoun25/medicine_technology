import { useTheme } from '@/context/ThemeContext'; // Import context
import { dataManager } from '@/services/DataManager';
import { useAuthStore } from '@/store/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View
} from 'react-native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { logout } = useAuthStore();
  // 1. Lấy theme và colors từ context
  const { colors, isDark, toggleTheme } = useTheme();

  // 2. Lấy state từ DataManager
  const [settings, setSettings] = useState(dataManager.getSettings());
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [tempShopName, setTempShopName] = useState(settings.shopName);

  // Giả lập config phân quyền
  const [permissions, setPermissions] = useState({
    staffCanDelete: false,
    staffCanExport: true,
    managerCanEditPrice: true,
  });

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    dataManager.updateSettings(newSettings);
  };

  const handleSaveShopInfo = () => {
    updateSetting('shopName', tempShopName);
    setIsEditingShop(false);
  };

  const showToast = (msg: string) => {
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Thông báo', msg);
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

  // Helper render 1 dòng setting
  const SettingItem = ({ icon, color, label, type, value, onToggle, subtext }: any) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon} size={20} color={color} />
        </View>
        <View>
            <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
            {subtext && <Text style={[styles.itemSub, { color: isDark ? '#9ca3af' : '#617589' }]}>{subtext}</Text>}
        </View>
      </View>
      {type === 'switch' && (
        <Switch 
          value={value} 
          onValueChange={onToggle} 
          trackColor={{ false: '#e5e7eb', true: colors.primary }} 
          thumbColor={Platform.OS === 'android' ? '#f4f3f4' : ''}
        />
      )}
      {type === 'arrow' && <MaterialIcons name="chevron-right" size={24} color={isDark ? '#666' : '#9ca3af'} />}
    </View>
  );

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
                {!isEditingShop ? (
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
            
            <Text style={styles.label}>Địa chỉ</Text>
            <Text style={[styles.valueText, { color: colors.text }]}>{settings.shopAddress}</Text>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <Text style={styles.label}>Gói đăng ký</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4}}>
                <MaterialIcons name="verified" size={16} color="#f59e0b" />
                <Text style={{fontWeight: 'bold', color: '#f59e0b'}}>Pharmacy Pro (Premium)</Text>
            </View>
          </View>
        </View>

        {/* SECTION 2: Giao diện & Tiện ích */}
        <Text style={styles.sectionTitle}>GIAO DIỆN & TIỆN ÍCH</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingItem 
            icon="dark-mode" color="#6366f1" 
            label="Chế độ tối (Dark Mode)" 
            type="switch" 
            value={isDark} 
            onToggle={toggleTheme} // QUAN TRỌNG: Gọi hàm toggle từ Context
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem 
            icon="notifications" color="#ec4899" 
            label="Thông báo đẩy" 
            subtext="Nhận tin khi có đơn hàng mới"
            type="switch" 
            value={settings.notifications} 
            onToggle={() => updateSetting('notifications', !settings.notifications)} 
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
           <SettingItem 
            icon="language" color="#10b981" 
            label="Ngôn ngữ" 
            subtext="Tiếng Việt (Mặc định)"
            type="arrow" 
          />
        </View>

        {/* SECTION 3: Phân quyền & Bảo mật */}
        <Text style={styles.sectionTitle}>CẤU HÌNH PHÂN QUYỀN & BẢO MẬT</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
           <SettingItem 
            icon="fingerprint" color="#f97316" 
            label="Đăng nhập sinh trắc học" 
            type="switch" 
            value={settings.biometricLogin} 
            onToggle={() => updateSetting('biometricLogin', !settings.biometricLogin)} 
          />
           <View style={[styles.divider, { backgroundColor: colors.border }]} />
           
           <View style={{padding: 16}}>
              <Text style={{fontSize: 13, color: isDark ? '#9ca3af' : '#617589', marginBottom: 12, textTransform: 'uppercase', fontWeight: 'bold'}}>Quyền hạn nhân viên (Staff)</Text>
              
              <View style={styles.permRow}>
                  <Text style={[styles.permText, { color: colors.text }]}>Được phép xóa đơn hàng</Text>
                  <Switch 
                    value={permissions.staffCanDelete} 
                    onValueChange={(v) => setPermissions({...permissions, staffCanDelete: v})}
                    trackColor={{ false: '#e5e7eb', true: colors.primary }}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
              </View>
              <View style={styles.permRow}>
                  <Text style={[styles.permText, { color: colors.text }]}>Được phép xuất file báo cáo</Text>
                  <Switch 
                    value={permissions.staffCanExport} 
                    onValueChange={(v) => setPermissions({...permissions, staffCanExport: v})}
                    trackColor={{ false: '#e5e7eb', true: colors.primary }}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
              </View>
           </View>
        </View>

        {/* SECTION 4: Dữ liệu */}
        <Text style={styles.sectionTitle}>DỮ LIỆU HỆ THỐNG</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.actionRow} onPress={() => showToast('Đang sao lưu dữ liệu...')}>
                <MaterialIcons name="cloud-upload" size={20} color="#0ea5e9" />
                <Text style={[styles.actionText, { color: colors.text }]}>Sao lưu dữ liệu ngay</Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.actionRow} onPress={() => showToast('Đã dọn dẹp bộ nhớ đệm!')}>
                <MaterialIcons name="cleaning-services" size={20} color="#f59e0b" />
                <Text style={[styles.actionText, { color: colors.text }]}>Xóa bộ nhớ đệm (Cache)</Text>
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