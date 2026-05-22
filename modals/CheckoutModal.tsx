import React, { useState } from 'react';
import { StyleSheet, View, Modal, ScrollView, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface CheckoutModalProps {
  visible: boolean;
  cartTotal: number;
  onClose: () => void;
  onConfirm: () => void;
}

const PAYMENT_METHODS = [
  { id: 'cash', icon: '💵', label: 'Efectivo' },
  { id: 'card', icon: '💳', label: 'Tarjeta' },
  { id: 'transfer', icon: '📱', label: 'Transferencia' },
  { id: 'mixed', icon: '📊', label: 'Mixto' },
];

export default function CheckoutModal({ visible, cartTotal, onClose, onConfirm }: CheckoutModalProps) {
  const [selectedPayment, setSelectedPayment] = useState('cash');

  const tax = Math.round(cartTotal * 0.16);
  const total = cartTotal + tax;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>Cobrar · Mesa 3</Text>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Totals */}
            <View>
              <View style={styles.row}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>${cartTotal}</Text>
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

            {/* Payment Methods */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.groupTitle}>Método de pago</Text>
              <View style={styles.paymentGrid}>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.paymentBtn, selectedPayment === method.id && styles.paymentBtnSelected]}
                    onPress={() => setSelectedPayment(method.id)}
                  >
                    <Text style={styles.paymentIcon}>{method.icon}</Text>
                    <Text style={[styles.paymentLabel, selectedPayment === method.id && styles.paymentLabelSelected]}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Confirm Button */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>Confirmar cobro</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#222',
    borderBottomWidth: 0.5,
  },
  rowTotal: {
    borderBottomWidth: 0,
  },
  label: {
    color: '#888',
    fontSize: 13,
  },
  labelTotal: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    color: '#ccc',
    fontSize: 13,
  },
  valueTotal: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '500',
  },
  groupTitle: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#252525',
    borderColor: '#2e2e2e',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  paymentBtnSelected: {
    backgroundColor: 'rgba(255, 107, 44, 0.15)',
    borderColor: COLORS.primary,
  },
  paymentIcon: {
    fontSize: 22,
    color: '#666',
  },
  paymentLabel: {
    fontSize: 11,
    color: '#888',
  },
  paymentLabelSelected: {
    color: COLORS.primary,
  },
  actions: {
    paddingHorizontal: 16,
  },
  confirmBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
});
