import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Platform, StatusBar as RNStatusBar } from 'react-native';
import { COLORS } from '../constants/colors';
import { getProducts, getCategories, getProductCategories } from '../services/productService';

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface MenuScreenProps {
  restaurantId: string;
  selectedTable: any;
  onSelectProduct: (product: any) => void;
  onOpenProductModal: (visible: boolean) => void;
  onBackToTables: () => void;
  onQuickAdd: (product: any) => void;
}

export default function MenuScreen({
  restaurantId,
  selectedTable,
  onSelectProduct,
  onOpenProductModal,
  onBackToTables,
  onQuickAdd,
}: Readonly<MenuScreenProps>) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [productCategoryMap, setProductCategoryMap] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    setLoading(true);
    const [productsData, categoriesData] = await Promise.all([
      getProducts(restaurantId),
      getCategories(restaurantId),
    ]);
    setProducts(productsData);
    setCategories(categoriesData);
    if (categoriesData.length > 0) {
      setSelectedCategoryId(categoriesData[0].id);
    }
    
    // Load category mappings for all products
    const mappings: { [key: string]: string[] } = {};
    for (const prod of productsData) {
      const cats = await getProductCategories(prod.id);
      mappings[prod.id] = cats.map(cat => cat.id);
    }
    setProductCategoryMap(mappings);
    setLoading(false);
  };

  const filteredProducts = selectedCategoryId
    ? products.filter(prod => {
        const todoId = categories.find(c => c.name === 'Todo')?.id;
        if (selectedCategoryId === todoId) return true; // Show all if "All" category selected
        // Otherwise show only products in selected category
        return productCategoryMap[prod.id]?.includes(selectedCategoryId);
      })
    : products;

  const handleProductPress = (product: any) => {
    onSelectProduct(product);
    onOpenProductModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Menu</Text>
          <Text style={styles.headerSubtitle}>Mesa {selectedTable.table_number}</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={onBackToTables}>
          <Text style={styles.backButtonText}>MESAS</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando menu...</Text>
        </View>
      ) : (
        <>
          {/* Categorías */}
          {categories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesScrollContent}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryTag,
                    selectedCategoryId === cat.id && styles.categoryTagActive
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text style={[
                    styles.categoryTagText,
                    selectedCategoryId === cat.id && styles.categoryTagTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Productos */}
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyProductsContainer}>
              <Text style={styles.emptyProductsText}>No hay productos en esta categoría</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={item => item.id}
              key={filteredProducts.length === 1 ? 'single' : 'grid'}
              numColumns={filteredProducts.length === 1 ? 1 : 2}
              columnWrapperStyle={filteredProducts.length > 1 ? styles.productRow : undefined}
              renderItem={({ item }) => (
                <View style={[styles.productCard, filteredProducts.length === 1 && styles.productCardWide]}>
                  <TouchableOpacity
                    onPress={() => handleProductPress(item)}
                    activeOpacity={0.8}
                  >
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={[styles.productImage, filteredProducts.length === 1 && styles.productImageWide]}
                      />
                    ) : (
                      <View style={[styles.productImage, styles.productImagePlaceholder, filteredProducts.length === 1 && styles.productImageWide]}>
                        <Text style={styles.productImagePlaceholderText}>Sin imagen</Text>
                      </View>
                    )}
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>${item.base_price}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addButton} onPress={() => onQuickAdd(item)}>
                    <Text style={styles.addButtonText}>+ Agregar</Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={styles.productList}
              scrollEnabled={true}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? ((RNStatusBar.currentHeight ?? 0) + 14) : 14,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  backButton: {
    backgroundColor: COLORS.buttonRed,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  categoriesScroll: {
    backgroundColor: COLORS.surface,
    flexGrow: 0,
    flexShrink: 0,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 10,
    alignItems: 'center',
  },
  categoriesScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignSelf: 'center',
    minHeight: 36,
    justifyContent: 'center',
    flexShrink: 0,
  },
  categoryTagActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryTagText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryTagTextActive: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  productList: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  productRow: {
    justifyContent: 'space-between',
    gap: 14,
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  productCardWide: {
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.background,
  },
  productImageWide: {
    height: 180,
  },
  productImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  productImagePlaceholderText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  productName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.buttonGreen,
    paddingHorizontal: 10,
    paddingTop: 4,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  emptyProductsContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyProductsText: { color: COLORS.textSecondary, fontSize: 14 },
});
