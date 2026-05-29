import React from 'react';
import { StyleSheet, View, Modal, ScrollView, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  customizationText?: string;
}

interface OrderDetailModalProps {
  visible: boolean;
  items: OrderItem[];
  selectedTable?: number;
  onClose: () => void;
  onRemoveItem: (itemId: string) => void;
  onSendOrder: () => void;
}

export default function OrderDetailModal(props: Readonly<OrderDetailModalProps>) {
  const { visible, items, selectedTable = 0, onClose, onRemoveItem, onSendOrder } = props;
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>📋 Detalle Orden</Text>
          <Text style={styles.subtitle}>Mesa {selectedTable}</Text>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {items.length === 0 ? (
              <Text style={styles.emptyText}>Sin items agregados</Text>
            ) : (
              <View>
                {items.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <View>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.customizationText && <Text style={styles.itemCustomization}>{item.customizationText}</Text>}
                        <Text style={styles.itemPrice}>${item.price} x {item.qty} = ${item.price * item.qty}</Text>
                      </View>
                      <TouchableOpacity style={styles.removeBtn} onPress={() => onRemoveItem(item.id)}>
                        <Text style={styles.removeBtnText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowBold]}>
              <Text style={styles.totalLabelBold}>Total</Text>
              <Text style={styles.totalValueBold}>${total}</Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.button, styles.closeBtn]} onPress={onClose}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.sendBtn, items.length === 0 && styles.sendBtnDisabled]} onPress={onSendOrder} disabled={items.length === 0}>
              <Text style={styles.sendBtnText}>Enviar a Cocina</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', paddingTop: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 15 },
  body: { paddingHorizontal: 15, maxHeight: '50%' },
  emptyText: { textAlign: 'center', color: COLORS.textTertiary, fontSize: 14, marginVertical: 20 },
  itemCard: { backgroundColor: COLORS.background, borderRadius: 10, marginBottom: 10, padding: 12, borderColor: COLORS.border, borderWidth: 1 },
  itemInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 13, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  itemCustomization: { fontSize: 11, color: COLORS.accent, fontStyle: 'italic', marginBottom: 4, fontWeight: '500' },
  itemPrice: { fontSize: 12, color: COLORS.textSecondary },
  removeBtn: { width: 32, height: 32, borderRadius: 6, backgroundColor: COLORS.danger + '20', justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { fontSize: 14 },
  totalsSection: { backgroundColor: COLORS.background, marginHorizontal: 15, marginVertical: 15, borderRadius: 12, padding: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomColor: COLORS.border, borderBottomWidth: 0.5 },
  totalRowBold: { borderBottomWidth: 0, borderTopColor: COLORS.border, borderTopWidth: 1, marginTop: 5, paddingTop: 10 },
  totalLabel: { fontSize: 13, color: COLORS.textSecondary },
  totalLabelBold: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  totalValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  totalValueBold: { fontSize: 18, fontWeight: 'bold', color: COLORS.buttonGreen },
  buttonsContainer: { flexDirection: 'row', gap: 10, paddingHorizontal: 15, paddingVertical: 12, borderTopColor: COLORS.border, borderTopWidth: 1 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10 },
  closeBtn: { backgroundColor: COLORS.border },
  closeBtnText: { color: COLORS.textPrimary, textAlign: 'center', fontWeight: 'bold', fontSize: 13 },
  sendBtn: { backgroundColor: COLORS.buttonGreen },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 13 },
});
