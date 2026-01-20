import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Medicine, MedicineBatch } from '@/types/medicine';

interface MedicineFormProps {
  initialData?: Medicine;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isDark?: boolean;
  colors?: any;
}

export const MedicineForm: React.FC<MedicineFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isDark = false,
  colors = {
    background: '#fff',
    text: '#000',
    border: '#ddd',
    primary: '#137fec',
  },
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    activeIngredient: initialData?.activeIngredient || '',
    category: initialData?.category || '',
    unit: initialData?.unit || '',
    manufacturer: initialData?.manufacturer || '',
    country: initialData?.country || '',
    registrationNumber: initialData?.registrationNumber || '',
    description: initialData?.description || '',
    dosage: initialData?.dosage || '',
    usage: initialData?.usage || '',
    minStock: initialData?.minStock?.toString() || '10',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validate
    if (!formData.name || !formData.activeIngredient || !formData.manufacturer) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    onSubmit({
      ...initialData,
      ...formData,
      minStock: parseInt(formData.minStock) || 10,
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {initialData ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới'}
      </Text>

      {/* Tên thuốc - BẮT BUỘC */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Tên thuốc <Text style={{ color: 'red' }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="VD: Aspirin 500mg"
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
        />
      </View>

      {/* Hoạt chất - BẮT BUỘC */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Hoạt chất <Text style={{ color: 'red' }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="VD: Acetylsalicylic Acid"
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          value={formData.activeIngredient}
          onChangeText={(text) => handleChange('activeIngredient', text)}
        />
      </View>

      {/* Nhà sản xuất - BẮT BUỘC */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Nhà sản xuất <Text style={{ color: 'red' }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="VD: Bayer"
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          value={formData.manufacturer}
          onChangeText={(text) => handleChange('manufacturer', text)}
        />
      </View>

      {/* Nhóm thuốc */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Nhóm thuốc</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="VD: Kháng sinh, Vitamin..."
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          value={formData.category}
          onChangeText={(text) => handleChange('category', text)}
        />
      </View>

      {/* Đơn vị */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Đơn vị tính</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="VD: Viên, Hộp, Lọ..."
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          value={formData.unit}
          onChangeText={(text) => handleChange('unit', text)}
        />
      </View>

      {/* Nước sản xuất */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Nước sản xuất</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="VD: Việt Nam, Đức..."
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          value={formData.country}
          onChangeText={(text) => handleChange('country', text)}
        />
      </View>

      {/* Số đăng ký */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Số đăng ký</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="VD: VN123456"
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          value={formData.registrationNumber}
          onChangeText={(text) => handleChange('registrationNumber', text)}
        />
      </View>

      {/* Liều lượng */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Liều lượng</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="VD: 500mg x 3 lần/ngày"
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          value={formData.dosage}
          onChangeText={(text) => handleChange('dosage', text)}
        />
      </View>

      {/* Cách dùng */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Cách dùng</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, minHeight: 80 }]}
          placeholder="Mô tả cách dùng..."
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          multiline
          numberOfLines={4}
          value={formData.usage}
          onChangeText={(text) => handleChange('usage', text)}
        />
      </View>

      {/* Mô tả */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Mô tả</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, minHeight: 80 }]}
          placeholder="Mô tả thêm về thuốc..."
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
        />
      </View>

      {/* Tồn kho tối thiểu */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Tồn kho tối thiểu</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="VD: 10"
          placeholderTextColor={isDark ? '#999' : '#ccc'}
          keyboardType="number-pad"
          value={formData.minStock}
          onChangeText={(text) => handleChange('minStock', text)}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.buttonCancel, { borderColor: colors.border }]}
          onPress={onCancel}
        >
          <MaterialIcons name="close" size={20} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonSubmit, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <MaterialIcons name="check" size={20} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>
            {initialData ? 'Cập nhật' : 'Thêm thuốc'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  buttonCancel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonSubmit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
