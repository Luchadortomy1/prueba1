import React, { useState } from 'react';
import { StyleSheet, View, Modal, ScrollView, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface ProductModalProps {
  visible: boolean;
  product: any;
  onClose: () => void;
  onAddToCart: (qty: number, price: number, productName?: string) => void;
}

export default function ProductModal({ visible, product, onClose, onAddToCart }: ProductModalProps) {
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: number }>({});
  const [selectedExtras, setSelectedExtras] = useState<{ [key: number]: number[] }>({});

  // Initialize selected options on mount
  React.useEffect(() => {
    if (product?.customizations) {
      const initialOptions: { [key: number]: number } = {};
      product.customizations.forEach((_: any, idx: number) => {
        initialOptions[idx] = 0;
      });
      setSelectedOptions(initialOptions);
      setSelectedExtras({});
    }
  }, [product]);

  const calculatePrice = () => {
    let total = product.price;
    
    if (product.customizations) {
      product.customizations.forEach((customization: any, custIdx: number) => {
        // Add selected option price (required)
        if (customization.required && selectedOptions[custIdx] !== undefined) {
          total += customization.options[selectedOptions[custIdx]].price;
        }
        // Add selected extras prices (optional)
        if (!customization.required && selectedExtras[custIdx]) {
          selectedExtras[custIdx].forEach((optIdx: number) => {
            total += customization.options[optIdx].price;
          });
        }
      });
    }
    
    return total * qty;
  };

  const handleAddToCart = () => {
    let optionsPricePerUnit = 0;
    let customizationText = '';
    
    if (product.customizations) {
      const customItems: string[] = [];
      
      product.customizations.forEach((customization: any, custIdx: number) => {
        // Add selected option price (required)
        if (customization.required && selectedOptions[custIdx] !== undefined) {
          const optionName = customization.options[selectedOptions[custIdx]].name;
          optionsPricePerUnit += customization.options[selectedOptions[custIdx]].price;
          customItems.push(optionName);
        }
        // Add selected extras prices (optional)
        if (!customization.required && selectedExtras[custIdx]) {
          selectedExtras[custIdx].forEach((optIdx: number) => {
            const optionName = customization.options[optIdx].name;
            optionsPricePerUnit += customization.options[optIdx].price;
            customItems.push(optionName);
          });
        }
      });
      
      customizationText = customItems.join(', ');
    }
    
    onAddToCart(qty, product.price + optionsPricePerUnit, product.name, customizationText);
    onClose();
    setQty(1);
    setSelectedOptions({});
    setSelectedExtras({});
  };

  const toggleExtra = (custIdx: number, optIdx: number) => {
    const current = selectedExtras[custIdx] || [];
    if (current.includes(optIdx)) {
      setSelectedExtras({
        ...selectedExtras,
        [custIdx]: current.filter(i => i !== optIdx),
      });
    } else {
      setSelectedExtras({
        ...selectedExtras,
        [custIdx]: [...current, optIdx],
      });
    }
  };

  if (!product) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          {product && <Text style={styles.title}>{product.emoji} {product.name}</Text>}

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {product?.customizations?.map((customization: any, custIdx: number) => (
              <View key={custIdx}>
                <Text style={styles.groupTitle}>
                  {customization.title} 
                  {customization.required && <Text style={styles.required}>· requerido</Text>}
                  {!customization.required && <Text style={{ color: '#666', fontSize: 10 }}>· opcional</Text>}
                </Text>
                
                <View style={styles.optionsGrid}>
                  {customization.options.map((option: any, optIdx: number) => {
                    const isSelected = customization.required 
                      ? selectedOptions[custIdx] === optIdx
                      : selectedExtras[custIdx]?.includes(optIdx);
                    
                    const onPress = customization.required
                      ? () => setSelectedOptions({ ...selectedOptions, [custIdx]: optIdx })
                      : () => toggleExtra(custIdx, optIdx);

                    return (
                      <TouchableOpacity
                        key={optIdx}
                        style={[styles.option, isSelected && styles.optionSelected]}
                        onPress={onPress}
                      >
                        <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                          {option.name}
                        </Text>
                        <Text style={[styles.optionPrice, isSelected && styles.optionPriceSelected]}>
                          {option.price === 0 ? 'Incluido' : `+$${option.price}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            {/* Quantity */}
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Cantidad</Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, styles.qtyBtnMinus]}
                  onPress={() => setQty(Math.max(1, qty - 1))}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, styles.qtyBtnPlus]}
                  onPress={() => setQty(qty + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
              <Text style={styles.addBtnText}>Agregar a orden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 10,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 0.5,
    marginBottom: 14,
  },
  body: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  groupTitle: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
  },
  required: {
    color: '#ef4444',
    fontSize: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  option: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#252525',
    borderColor: '#2e2e2e',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  optionSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: COLORS.accent,
  },
  optionName: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 2,
  },
  optionNameSelected: {
    color: '#a78bfa',
  },
  optionPrice: {
    color: '#666',
    fontSize: 11,
  },
  optionPriceSelected: {
    color: COLORS.accent,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  qtyLabel: {
    color: '#888',
    fontSize: 13,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#252525',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnMinus: {
    backgroundColor: '#7f1d1d',
  },
  qtyBtnPlus: {
    backgroundColor: '#064e3b',
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  qtyNum: {
    color: COLORS.textPrimary,
    fontSize: 14,
    minWidth: 24,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#252525',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  addBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
