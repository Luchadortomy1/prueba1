import React, { useState } from 'react';
import { StyleSheet, View, Modal, ScrollView, Text, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '../constants/colors';

interface ProductModalProps {
  visible: boolean;
  product: any;
  options: any[];
  onClose: () => void;
  onAddToCart: (
    qty: number,
    price: number,
    productName?: string,
    customizationText?: string,
    selectedOptionIds?: string[],
    optionAdjustments?: { option_id: string; price_adjustment: number }[]
  ) => void;
}

export default function ProductModal({ visible, product, options, onClose, onAddToCart }: ProductModalProps) {
  const [qty, setQty] = useState(1);
  const [customizationText, setCustomizationText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: boolean }>({});

  // Initialize selected options with all defaults checked
  React.useEffect(() => {
    if (product && options.length > 0) {
      const initialSelected: { [key: string]: boolean } = {};
      options.forEach(opt => {
        if (opt.type === 'default') {
          initialSelected[opt.id] = true;
        }
      });
      setSelectedOptions(initialSelected);
    }
  }, [product, options]);

  const handleAddToCart = () => {
    if (product) {
      // Calcular precio total con extras
      const extrasPrice = options
        .filter(opt => selectedOptions[opt.id] && opt.type === 'extra')
        .reduce((sum, opt) => sum + opt.price_modifier, 0);
      const totalPrice = product.base_price + extrasPrice;

      const selectedOptionNames = options
        .filter(opt => selectedOptions[opt.id])
        .map(opt => `${opt.name} (${opt.type})`)
        .join(', ');
      const customizationWithOptions = [selectedOptionNames, customizationText]
        .filter(text => text.trim())
        .join(' | ');
      
      const selectedOptionIds = options.filter(opt => selectedOptions[opt.id]).map(opt => opt.id);
      const optionAdjustments = options
        .filter(opt => selectedOptions[opt.id])
        .map(opt => ({ option_id: opt.id, price_adjustment: Number(opt.price_modifier || 0) }));

      onAddToCart(
        qty,
        totalPrice,
        product.name,
        customizationWithOptions,
        selectedOptionIds,
        optionAdjustments
      );
      setQty(1);
      setCustomizationText('');
      setSelectedOptions({});
      onClose();
    }
  };

  if (!product) return null;

  const defaultOptions = options.filter(opt => opt.type === 'default');
  const extraOptions = options.filter(opt => opt.type === 'extra');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{product.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Precio</Text>
              <Text style={styles.priceValue}>${product.base_price}</Text>
            </View>

            {product.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionText}>{product.description}</Text>
              </View>
            )}

            {defaultOptions.length > 0 && (
              <View style={styles.ingredientsSection}>
                <Text style={styles.sectionTitle}>Ingredientes Base</Text>
                {defaultOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.defaultOptionItem,
                      !selectedOptions[opt.id] && styles.defaultOptionRemoved
                    ]}
                    onPress={() => setSelectedOptions({
                      ...selectedOptions,
                      [opt.id]: !selectedOptions[opt.id]
                    })}
                  >
                    <View style={styles.defaultOptionCheckbox}>
                      {selectedOptions[opt.id] && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.defaultOptionContent}>
                      <Text style={[
                        styles.defaultOptionName,
                        !selectedOptions[opt.id] && styles.defaultOptionNameRemoved
                      ]}>
                        {opt.name}
                      </Text>
                      {opt.price_modifier > 0 && (
                        <Text style={styles.defaultOptionPrice}>+${opt.price_modifier}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {extraOptions.length > 0 && (
              <View style={styles.ingredientsSection}>
                <Text style={styles.sectionTitle}>Agregados</Text>
                {extraOptions.map(opt => (
                  <TouchableOpacity 
                    key={opt.id}
                    style={[
                      styles.extraOptionItem,
                      selectedOptions[opt.id] && styles.extraOptionActive
                    ]}
                    onPress={() => setSelectedOptions({
                      ...selectedOptions,
                      [opt.id]: !selectedOptions[opt.id]
                    })}
                  >
                    <View style={styles.extraOptionCheckbox}>
                      {selectedOptions[opt.id] && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.extraOptionContent}>
                      <Text style={styles.extraOptionName}>{opt.name}</Text>
                      {opt.price_modifier > 0 && (
                        <Text style={styles.extraOptionPrice}>+${opt.price_modifier}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Cantidad</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity style={styles.qtyButton} onPress={() => setQty(Math.max(1, qty - 1))}>
                  <Text style={styles.qtyButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{qty}</Text>
                <TouchableOpacity style={styles.qtyButton} onPress={() => setQty(qty + 1)}>
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.customizationSection}>
              <Text style={styles.sectionTitle}>Alergias / Notas Especiales</Text>
              <TextInput
                style={styles.customizationInput}
                placeholder="Ej: Sin maní, Alérgico a lácteos..."
                placeholderTextColor={COLORS.textTertiary}
                value={customizationText}
                onChangeText={setCustomizationText}
                multiline
              />
              <Text style={styles.customizationHint}>Avísanos de alergias o preferencias especiales</Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAddToCart}>
              <Text style={styles.addButtonText}>Agregar al Carrito</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  content: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  closeButton: { fontSize: 24, color: COLORS.textSecondary },
  body: { paddingHorizontal: 20, paddingVertical: 15 },
  priceSection: { backgroundColor: COLORS.background, padding: 15, borderRadius: 10, marginBottom: 15 },
  priceLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 5 },
  priceValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.buttonGreen },
  descriptionSection: { marginBottom: 20 },
  descriptionText: { fontSize: 14, color: COLORS.textSecondary, fontStyle: 'italic' },
  ingredientsSection: { marginBottom: 20 },
  ingredientItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COLORS.background, borderRadius: 8, marginBottom: 8 },
  ingredientName: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },
  ingredientPrice: { fontSize: 12, color: COLORS.buttonGreen, fontWeight: 'bold' },
  defaultOptionItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COLORS.background, borderRadius: 8, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  defaultOptionRemoved: { opacity: 0.5, backgroundColor: COLORS.background + '80' },
  defaultOptionCheckbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  defaultOptionContent: { flex: 1 },
  defaultOptionName: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },
  defaultOptionNameRemoved: { color: COLORS.textTertiary, textDecorationLine: 'line-through' },
  defaultOptionPrice: { fontSize: 12, color: COLORS.buttonGreen, fontWeight: 'bold', marginTop: 2 },
  extraOptionItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COLORS.background, borderRadius: 8, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  extraOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  extraOptionCheckbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  checkmark: { fontSize: 14, color: COLORS.primary, fontWeight: 'bold' },
  extraOptionContent: { flex: 1 },
  extraOptionName: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },
  extraOptionPrice: { fontSize: 12, color: COLORS.buttonGreen, fontWeight: 'bold', marginTop: 2 },
  quantitySection: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: COLORS.background, paddingVertical: 12, paddingHorizontal: 15, borderRadius: 10 },
  qtyButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  qtyButtonText: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  qtyValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, flex: 1, textAlign: 'center' },
  customizationSection: { marginBottom: 30 },
  customizationInput: { backgroundColor: COLORS.background, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, color: COLORS.textPrimary, minHeight: 80, textAlignVertical: 'top' },
  customizationHint: { fontSize: 11, color: COLORS.textTertiary, marginTop: 8, fontStyle: 'italic' },
  footer: { flexDirection: 'row', gap: 10, padding: 15, borderTopColor: COLORS.border, borderTopWidth: 1 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10 },
  cancelButton: { backgroundColor: COLORS.buttonRed },
  cancelButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 14 },
  addButton: { backgroundColor: COLORS.buttonGreen },
  addButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 14 },
});
