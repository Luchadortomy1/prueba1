import React from 'react';
import { StyleSheet, View, Modal, ScrollView, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  customizations?: any[];
}

interface OrderDetailModalProps {
  visible: boolean;
  items: OrderItem[];
  selectedTable?: number;
  onClose: () => void;
  onRemoveItem: (itemId: string) => void;
  onSendOrder: () => void;
}

export default function OrderDetailModal({ 
  visible, 
  items, 
  selectedTable = 3, 
  onClose, 
  onRemoveItem,
  onSendOrder 
}: OrderDetailModalProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + tax;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>Orden · Mesa {selectedTable}</Text>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {items.length === 0 ? (
              <Text style={styles.emptyText}>Sin items agregados</Text>
            ) : (
              <View>
                {items.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.customizationText && (
                        <Text style={styles.itemCustom}>{item.customizationText}</Text>
                      )}
                      <Text style={styles.itemQty}>x{item.qty}</Text>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemPrice}>${item.price * item.qty}</Text>
                      <TouchableOpacity 
                        style={styles.deleteBtn}
                        onPress={() => onRemoveItem(item.id)}
                      >
                        <Text style={styles.deleteBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Totals */}
            {items.length > 0 && (
              <View style={styles.totalsSection}>
                <View style={styles.row}>
                  <Text style={styles.label}>Subtotal</Text>
                  <Text style={styles.value}>${subtotal}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>IVA 16%</Text>
                  <Text style={styles.value}>${tax}</Text>
                </View>
                <View style={[styles.row, styles.rowTotal]}>
                  <Text style={styles.labelTotal}>Total</Text>
                  <Text style={styles.valueTotal}>${total}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Volver</Text>
            </TouchableOpacity>
            {items.length > 0 && (
              <TouchableOpacity style={styles.sendBtn} onPress={onSendOrder}>
                <Text style={styles.sendBtnText}>Mandar Orden →</Text>
              </TouchableOpacity>
            )}
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
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 30,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderColor: COLORS.border,
    borderWidth: 0.5,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemCustom: {
    color: '#888',
    fontSize: 11,
    marginBottom: 4,
  },
  itemQty: {
    color: '#888',
    fontSize: 11,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemPrice: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalsSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopColor: COLORS.border,
    borderTopWidth: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowTotal: {
    marginTop: 4,
  },
  label: {
    color: '#888',
    fontSize: 12,
  },
  labelTotal: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: '#ccc',
    fontSize: 12,
  },
  valueTotal: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
  },
  closeBtn: {
    flex: 1,
    backgroundColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  sendBtn: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sendBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
});
