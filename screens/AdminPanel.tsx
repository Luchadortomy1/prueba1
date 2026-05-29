import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage, getProductOptions, getCategories, createCategory, deleteCategory, addProductToCategory, getProductCategories } from '../services/productService';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabaseClient';

interface Product {
  id: string;
  name: string;
  base_price: number;
  description?: string;
  image_url?: string;
}

interface Option {
  id?: string;
  name: string;
  type: 'default' | 'extra';
  price_modifier: number;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface AdminPanelProps {
  restaurantId: string;
  onLogout: () => void;
}

export default function AdminPanel({ restaurantId, onLogout }: AdminPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionType, setNewOptionType] = useState<'default' | 'extra'>('default');
  const [newOptionPrice, setNewOptionPrice] = useState('0');
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    requestImagePermission();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [productsData, categoriesData] = await Promise.all([
      getProducts(restaurantId),
      getCategories(restaurantId),
    ]);
    setProducts(productsData);
    setCategories(categoriesData);
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para la categoria');
      return;
    }
    try {
      await createCategory(restaurantId, newCategoryName, categories.length);
      setNewCategoryName('');
      loadData();
      Alert.alert('Exito', 'Categoria creada');
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo crear la categoria: ' + err.message);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    Alert.alert('Eliminar', 'Eliminar esta categoria?', [
      { text: 'Cancelar', onPress: () => {} },
      { 
        text: 'Eliminar', 
        onPress: async () => {
          try {
            await deleteCategory(categoryId);
            loadData();
            Alert.alert('Exito', 'Categoria eliminada');
          } catch (err: any) {
            Alert.alert('Error', 'No se pudo eliminar: ' + err.message);
          }
        }
      }
    ]);
  };

  const requestImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para subir imágenes');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
      setImagePreview(result.assets[0].uri);
    }
  };

  const handleOpenModal = async (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setPrice(product.base_price.toString());
      setDescription(product.description || '');
      setImagePreview(product.image_url || '');
      setSelectedImage(null);
      
      // Load existing options/ingredients
      const existingOptions = await getProductOptions(product.id);
      setOptions(existingOptions);
      
      // Load existing categories
      const productCategories = await getProductCategories(product.id);
      setSelectedCategories(productCategories.map(cat => cat.id));
    } else {
      setEditingProduct(null);
      setName('');
      setPrice('');
      setDescription('');
      setImagePreview('');
      setSelectedImage(null);
      setOptions([]);
      setSelectedCategories([]);
    }
    setNewOptionName('');
    setNewOptionPrice('0');
    setShowModal(true);
  };

  const handleAddOption = () => {
    if (!newOptionName.trim()) {
      Alert.alert('Error', 'Ingresa nombre del ingrediente');
      return;
    }
    const newOption: Option = {
      id: `temp-${Date.now()}`,
      name: newOptionName,
      type: newOptionType,
      price_modifier: parseFloat(newOptionPrice) || 0,
    };
    setOptions([...options, newOption]);
    setNewOptionName('');
    setNewOptionPrice('0');
  };

  const handleRemoveOption = (id: string | undefined) => {
    setOptions(options.filter((o) => o.id !== id));
  };

  const handleSaveProduct = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Error', 'Completa nombre y precio');
      return;
    }

    try {
      const basePrice = parseFloat(price);
      let imageUrl = '';

      // Determine which image URL to use
      if (selectedImage) {
        // New image selected - upload it
        try {
          imageUrl = await uploadProductImage(restaurantId, name, selectedImage);
          console.log('✅ Imagen subida:', imageUrl);
        } catch (err) {
          console.warn('⚠️ Image upload failed:', err);
          imageUrl = editingProduct?.image_url || '';
        }
      } else if (editingProduct?.image_url && imagePreview.startsWith('https')) {
        // Existing Supabase URL - keep it
        imageUrl = imagePreview;
      } else if (imagePreview && !imagePreview.startsWith('https')) {
        // Local URI - skip if not uploaded
        imageUrl = '';
      } else {
        imageUrl = imagePreview;
      }

      let productId = editingProduct?.id;

      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.id, { name, base_price: basePrice, description, image_url: imageUrl });
        productId = editingProduct.id;
      } else {
        // Create new product
        const newProduct = await createProduct(restaurantId, name, basePrice, description, imageUrl);
        productId = newProduct?.id;
      }

      // Save/update options
      if (productId) {
        // Delete old options if editing
        if (editingProduct) {
          await supabase.from('product_options').delete().eq('product_id', productId);
        }

        // Insert new options
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          
          const { error } = await supabase.from('product_options').insert({
            product_id: productId,
            name: opt.name,
            option_type: 'selection',
            is_default: opt.type === 'default',
            price_modifier: opt.price_modifier,
            sort_order: i,
          });

          if (error) {
            console.warn('⚠️ Error saving option:', error);
          }
        }

        // Save/update product categories
        // Delete old categories if editing
        if (editingProduct) {
          await supabase.from('product_categories').delete().eq('product_id', productId);
        }

        // Always add "Todo" category
        const todoCategory = categories.find(cat => cat.name === 'Todo');
        if (todoCategory) {
          try {
            await addProductToCategory(productId, todoCategory.id);
          } catch (err) {
            console.warn('⚠️ Error adding Todo category:', err);
          }
        }

        // Insert additional selected categories (besides Todo)
        for (const categoryId of selectedCategories) {
          if (categoryId !== todoCategory?.id) { // Skip Todo if it was manually selected
            try {
              await addProductToCategory(productId, categoryId);
            } catch (err) {
              console.warn('⚠️ Error adding category:', err);
            }
          }
        }
      }

      Alert.alert('Éxito', editingProduct ? 'Producto actualizado' : 'Producto creado');
      setShowModal(false);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto');
      console.error('❌ Error:', error);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert('Eliminar', '¿Eliminar este producto?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        onPress: async () => {
          await deleteProduct(productId);
          loadData();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutBtnText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>Productos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>Categorias</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'products' ? (
        <>
          <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
            <Text style={styles.addBtnText}>AGREGAR PRODUCTO</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  {item.image_url && <Image source={{ uri: item.image_url }} style={styles.productImage} />}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productDesc}>{item.description}</Text>
                    <Text style={styles.productPrice}>${item.base_price}</Text>
                  </View>
                  <View style={styles.productActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenModal(item)}>
                      <Text style={styles.actionBtnText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteProduct(item.id)}>
                      <Text style={styles.actionBtnText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              scrollEnabled={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </>
      ) : (
        <>
          <View style={styles.categoryInputContainer}>
            <TextInput 
              style={styles.categoryInput}
              placeholder="Nombre de categoria"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddCategory}>
              <Text style={styles.addBtnText}>AGREGAR CATEGORIA</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.categoryCard}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <TouchableOpacity 
                    style={styles.deleteCategoryBtn}
                    onPress={() => handleDeleteCategory(item.id)}
                  >
                    <Text style={styles.deleteCategoryBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
              scrollEnabled={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </>
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</Text>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput style={styles.input} placeholder="Hamburguesa, Pizza, etc." value={name} onChangeText={setName} />

              <Text style={styles.label}>Precio Base</Text>
              <TextInput style={styles.input} placeholder="0.00" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

              <Text style={styles.label}>Descripcion</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                placeholder="Detalles del producto..."
                value={description}
                onChangeText={setDescription}
                multiline
              />

              <Text style={styles.label}>Imagen</Text>
              {imagePreview && <Image source={{ uri: imagePreview }} style={styles.imagePreview} />}
              <TouchableOpacity style={styles.imagePickBtn} onPress={pickImage}>
                <Text style={styles.imagePickBtnText}>Seleccionar Imagen</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Ingredientes / Componentes</Text>
              <View style={styles.optionsSection}>
                {options.length === 0 ? (
                  <Text style={styles.emptyText}>Sin ingredientes aun</Text>
                ) : (
                  options.map((opt) => (
                    <View key={opt.id} style={styles.optionItem}>
                      <View>
                        <Text style={styles.optionName}>{opt.name}</Text>
                        <Text style={styles.optionType}>{opt.type === 'default' ? 'Default' : 'Extra'}</Text>
                        {opt.price_modifier !== 0 && <Text style={styles.optionPrice}>${opt.price_modifier}</Text>}
                      </View>
                      <TouchableOpacity style={styles.optionDeleteBtn} onPress={() => handleRemoveOption(opt.id)}>
                        <Text>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.addOptionContainer}>
                <Text style={styles.label}>Agregar Ingrediente</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Lechuga, Tomate, Queso"
                  value={newOptionName}
                  onChangeText={setNewOptionName}
                />

                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[styles.typeBtn, newOptionType === 'default' && styles.typeActive]}
                    onPress={() => setNewOptionType('default')}
                  >
                    <Text style={styles.typeBtnText}>Default</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeBtn, newOptionType === 'extra' && styles.typeActive]}
                    onPress={() => setNewOptionType('extra')}
                  >
                    <Text style={styles.typeBtnText}>Extra</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Precio Adicional (si aplica)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={newOptionPrice}
                  onChangeText={setNewOptionPrice}
                  keyboardType="decimal-pad"
                />

                <TouchableOpacity style={styles.addOptionBtn} onPress={handleAddOption}>
                  <Text style={styles.addOptionBtnText}>Agregar Ingrediente</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Categorias Adicionales</Text>
              <Text style={[styles.label, { fontSize: 11, fontWeight: '400', marginBottom: 8, color: COLORS.textTertiary }]}>
                Nota: "Todo" se asigna automáticamente a todos los productos
              </Text>
              <View style={styles.categoriesGrid}>
                {categories.filter(cat => cat.name !== 'Todo').map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCheckbox,
                      selectedCategories.includes(cat.id) && styles.categoryCheckboxActive
                    ]}
                    onPress={() => {
                      if (selectedCategories.includes(cat.id)) {
                        setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                      } else {
                        setSelectedCategories([...selectedCategories, cat.id]);
                      }
                    }}
                  >
                    <Text style={[
                      styles.categoryCheckboxText,
                      selectedCategories.includes(cat.id) && styles.categoryCheckboxTextActive
                    ]}>
                      {selectedCategories.includes(cat.id) ? `X ${cat.name}` : cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProduct}>
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 15, paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  logoutBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: COLORS.danger, borderRadius: 8 },
  logoutBtnText: { color: '#fff', fontWeight: 'bold' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, gap: 10, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: COLORS.surface, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.textPrimary, fontWeight: 'bold' },
  addBtn: { marginHorizontal: 15, marginVertical: 10, backgroundColor: COLORS.buttonGreen, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  categoryInputContainer: { paddingHorizontal: 15, paddingVertical: 10, gap: 10 },
  categoryInput: { borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.textPrimary, fontSize: 13 },
  categoryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 15, marginVertical: 8, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12 },
  categoryName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  deleteCategoryBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.danger + '20', borderRadius: 6 },
  deleteCategoryBtnText: { fontSize: 12, color: COLORS.danger, fontWeight: 'bold' },
  productCard: { flexDirection: 'row', marginHorizontal: 15, marginVertical: 8, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, alignItems: 'center', gap: 12 },
  productImage: { width: 60, height: 60, borderRadius: 8 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  productDesc: { fontSize: 11, color: COLORS.textSecondary, marginVertical: 2 },
  productPrice: { fontSize: 12, fontWeight: 'bold', color: COLORS.buttonGreen },
  productActions: { flexDirection: 'row', gap: 8 },
  editBtn: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: COLORS.primary + '20', borderRadius: 6 },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: COLORS.danger + '20', borderRadius: 6 },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '95%', paddingTop: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 15 },
  modalContent: { paddingHorizontal: 15, paddingVertical: 10 },
  label: { fontSize: 13, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  input: { borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, color: COLORS.textPrimary, fontSize: 13 },
  imagePreview: { width: 100, height: 100, borderRadius: 8, marginBottom: 10 },
  imagePickBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  imagePickBtnText: { color: COLORS.textPrimary, fontWeight: 'bold' },
  optionsSection: { backgroundColor: COLORS.background, borderRadius: 8, padding: 10, marginBottom: 15 },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  optionName: { fontSize: 12, fontWeight: 'bold', color: COLORS.textPrimary },
  optionType: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  optionPrice: { fontSize: 11, color: COLORS.buttonGreen, marginTop: 2, fontWeight: '600' },
  optionDeleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  addOptionContainer: { marginBottom: 15 },
  emptyText: { textAlign: 'center', color: COLORS.textTertiary, fontSize: 12, paddingVertical: 10 },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  typeActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  typeBtnText: { fontWeight: '600', color: COLORS.textPrimary, fontSize: 12 },
  addOptionBtn: { backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  addOptionBtnText: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 15, paddingVertical: 12, borderTopColor: COLORS.border, borderTopWidth: 1 },
  cancelBtn: { flex: 1, paddingVertical: 12, backgroundColor: COLORS.border, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textPrimary, fontWeight: 'bold' },
  saveBtn: { flex: 1, paddingVertical: 12, backgroundColor: COLORS.buttonGreen, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15, justifyContent: 'space-between' },
  categoryCheckbox: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.background, width: '48%' },
  categoryCheckboxActive: { backgroundColor: COLORS.primary + '30', borderColor: COLORS.primary },
  categoryCheckboxText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center' },
  categoryCheckboxTextActive: { color: COLORS.primary, fontWeight: 'bold' },
});
