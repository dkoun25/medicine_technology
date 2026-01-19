import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dataManager } from '@/services/DataManager';
import { Medicine } from '@/types/medicine';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

export default function MedicinesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = dataManager.getAllCategories();

  useEffect(() => {
    loadMedicines();
  }, [selectedCategory, searchQuery]);

  const loadMedicines = () => {
    let result = dataManager.getAllMedicines();
    
    if (selectedCategory !== 'all') {
      result = result.filter(m => m.category === selectedCategory);
    }
    
    if (searchQuery) {
      result = dataManager.searchMedicines(searchQuery);
    }
    
    setMedicines(result);
  };

  const getTotalStock = (medicine: Medicine) => {
    return medicine.batches.reduce((sum, batch) => sum + batch.quantity, 0);
  };

  const getStockStatus = (medicine: Medicine) => {
    const total = getTotalStock(medicine);
    if (total === 0) return { text: 'Hết hàng', color: colors.danger };
    if (total <= medicine.minStock) return { text: 'Sắp hết', color: colors.warning };
    return { text: 'Còn hàng', color: colors.success };
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Danh sách thuốc" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Actions */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.headerActions}>
            <Input
              placeholder="Tìm kiếm thuốc theo tên, hoạt chất, barcode..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              icon="🔍"
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
            <Button
              title="Thêm thuốc"
              onPress={() => router.push('/medicines/add')}
              icon="➕"
              variant="primary"
            />
          </Animated.View>

          {/* Category Filter */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { borderColor: colors.border },
                  selectedCategory === 'all' && { 
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  }
                ]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[
                  styles.categoryText,
                  { color: colors.text },
                  selectedCategory === 'all' && { color: '#fff' }
                ]}>
                  Tất cả ({medicines.length})
                </Text>
              </TouchableOpacity>
              
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { borderColor: colors.border },
                    selectedCategory === cat.id && { 
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    }
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    { color: colors.text },
                    selectedCategory === cat.id && { color: '#fff' }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsGrid}>
            <Card style={styles.statCard} padding={Spacing.md}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{medicines.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tổng thuốc</Text>
            </Card>
            <Card style={styles.statCard} padding={Spacing.md}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {medicines.filter(m => getTotalStock(m) > m.minStock).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Còn hàng</Text>
            </Card>
            <Card style={styles.statCard} padding={Spacing.md}>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {medicines.filter(m => {
                  const stock = getTotalStock(m);
                  return stock > 0 && stock <= m.minStock;
                }).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sắp hết</Text>
            </Card>
            <Card style={styles.statCard} padding={Spacing.md}>
              <Text style={[styles.statValue, { color: colors.danger }]}>
                {medicines.filter(m => getTotalStock(m) === 0).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hết hàng</Text>
            </Card>
          </Animated.View>

          {/* Medicine List */}
          <View style={styles.medicineList}>
            {medicines.map((medicine, index) => {
              const stockStatus = getStockStatus(medicine);
              const totalStock = getTotalStock(medicine);
              const categoryData = categories.find(c => c.id === medicine.category);

              return (
                <Animated.View
                  key={medicine.id}
                  entering={FadeInRight.delay(300 + index * 50).duration(400)}
                >
                  <TouchableOpacity
                    onPress={() => router.push(`/medicines/${medicine.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <Card style={styles.medicineCard}>
                      <View style={styles.medicineHeader}>
                        <View style={styles.medicineInfo}>
                          <View style={styles.medicineTitleRow}>
                            <Text style={[styles.medicineName, { color: colors.text }]}>
                              {medicine.name}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: stockStatus.color + '20' }]}>
                              <View style={[styles.statusDot, { backgroundColor: stockStatus.color }]} />
                              <Text style={[styles.statusText, { color: stockStatus.color }]}>
                                {stockStatus.text}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.medicineIngredient, { color: colors.textSecondary }]}>
                            {medicine.activeIngredient}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.medicineDivider, { backgroundColor: colors.borderLight }]} />

                      <View style={styles.medicineDetails}>
                        <View style={styles.detailItem}>
                          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Nhóm:</Text>
                          <View style={styles.categoryBadge}>
                            <Text style={{ fontSize: 14 }}>{categoryData?.icon}</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                              {categoryData?.name}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.detailItem}>
                          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tồn kho:</Text>
                          <Text style={[
                            styles.detailValue, 
                            { 
                              color: totalStock <= medicine.minStock ? colors.danger : colors.text,
                              fontWeight: 'bold',
                            }
                          ]}>
                            {totalStock} {medicine.unit}
                          </Text>
                        </View>

                        <View style={styles.detailItem}>
                          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Giá bán:</Text>
                          <Text style={[styles.detailValue, { color: colors.primary, fontWeight: 'bold' }]}>
                            {medicine.batches[0]?.sellingPrice.toLocaleString('vi-VN')} đ
                          </Text>
                        </View>

                        <View style={styles.detailItem}>
                          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Số lô:</Text>
                          <Text style={[styles.detailValue, { color: colors.text }]}>
                            {medicine.batches.length} lô
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {medicines.length === 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.emptyState}>
              <Text style={{ fontSize: 64 }}>📦</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? 'Không tìm thấy thuốc nào' : 'Chưa có thuốc nào'}
              </Text>
              <Button
                title="Thêm thuốc đầu tiên"
                onPress={() => router.push('/medicines/add')}
                variant="primary"
              />
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  headerActions: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  categoryScroll: {
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  categoryText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  medicineList: {
    gap: Spacing.md,
  },
  medicineCard: {
    padding: Spacing.md,
  },
  medicineHeader: {
    marginBottom: Spacing.sm,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  medicineName: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    flex: 1,
  },
  medicineIngredient: {
    fontSize: FontSizes.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  medicineDivider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  medicineDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailLabel: {
    fontSize: FontSizes.sm,
  },
  detailValue: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    textAlign: 'center',
  },
});