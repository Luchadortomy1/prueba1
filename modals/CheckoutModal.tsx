import React, { useState } from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface CheckoutModalProps {
  visible: boolean;
  sessionTotal: number;
  selectedTable?: number;
  onClose: () => void;
  onConfirm: () => void;
}

const PAYMENT_METHODS = [
  { id: 'cash', icon: '💵', label: 'Efectivo' },
  { id: 'card', icon: '💳', label: 'Tarjeta' },
];

export default function CheckoutModal({ visible, sessionTotal, selectedTable = 0, onClose, onConfirm }: Readonly<CheckoutModalProps>) {
  const [selectedPayment, setSelectedPayment] = useState('cash');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Cobrar</Text>
          <Text style={styles.subtitle}>Mesa {selectedTable}</Text>

          {/* TOTAL */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>TOTAL A COBRAR</Text>
              <Text style={styles.totalValueBold}>${sessionTotal.toFixed(2)}</Text>
            </View>
          </View>

          {/* MÉTODO DE PAGO */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Método de Pago</Text>
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

          {/* BOTONES */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>Confirmar Pago</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 },
  sheet: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 22, width: '100%', maxWidth: 420 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },

  totalsSection: { backgroundColor: COLORS.background, borderRadius: 14, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabelBold: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  totalValueBold: { fontSize: 28, fontWeight: 'bold', color: COLORS.buttonGreen },

  paymentSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  paymentGrid: { flexDirection: 'row', gap: 14 },
  paymentBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: COLORS.background, borderColor: COLORS.border, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  paymentBtnSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  paymentIcon: { fontSize: 28, marginBottom: 6 },
  paymentLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
  paymentLabelSelected: { color: '#fff', fontWeight: 'bold' },

  button: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonsContainer: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: COLORS.buttonRed },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  confirmBtn: { flex: 1, backgroundColor: COLORS.buttonGreen },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
