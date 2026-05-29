import React, { useState } from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface CheckoutModalProps {
  visible: boolean;
  cartTotal: number;
  selectedTable?: number;
  onClose: () => void;
  onConfirm: () => void;
  onRefresh?: () => Promise<number>;
  serverTotal?: number;
}

const PAYMENT_METHODS = [
  { id: 'cash', icon: '💵', label: 'Efectivo' },
  { id: 'card', icon: '💳', label: 'Tarjeta' },
];

export default function CheckoutModal({ visible, cartTotal, selectedTable = 0, onClose, onConfirm, onRefresh, serverTotal: serverTotalProp }: CheckoutModalProps) {
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [serverTotalLocal, setServerTotalLocal] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const subtotalLocal = cartTotal;
  const displayedServerTotal = typeof serverTotalProp === 'number' ? serverTotalProp : serverTotalLocal;
  const subtotal = subtotalLocal + (displayedServerTotal || 0);
  const total = subtotal;

  const handleRefresh = async () => {
    if (!onRefresh) return;
    try {
      setRefreshing(true);
      const val = await onRefresh();
      setServerTotalLocal(Number(val || 0));
    } catch (err) {
      console.log('Error refreshing checkout total:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Cobrar</Text>
          <Text style={styles.subtitle}>Mesa {selectedTable}</Text>

          <View style={styles.totalsSection}>
            {displayedServerTotal > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>En cocina</Text>
                <Text style={styles.totalValue}>${displayedServerTotal.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowBold]}>
              <Text style={styles.totalLabelBold}>Total</Text>
              <Text style={styles.totalValueBold}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Método de pago</Text>
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

          <View style={{ marginBottom: 12 }}>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#eee', marginBottom: 8 }]} onPress={handleRefresh} disabled={!onRefresh || refreshing}>
              <Text style={{ fontWeight: '700' }}>{refreshing ? 'Actualizando...' : 'Refrescar Totales'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>Confirmar Cobro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  sheet: { backgroundColor: COLORS.surface, borderRadius: 15, padding: 25, width: '90%', maxWidth: 400 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },
  totalsSection: { backgroundColor: COLORS.background, borderRadius: 12, padding: 15, marginBottom: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomColor: COLORS.border, borderBottomWidth: 0.5 },
  totalRowBold: { borderBottomWidth: 0, borderTopColor: COLORS.border, borderTopWidth: 1, marginTop: 5, paddingTop: 12 },
  totalLabel: { fontSize: 14, color: COLORS.textSecondary },
  totalLabelBold: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  totalValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  totalValueBold: { fontSize: 20, fontWeight: 'bold', color: COLORS.buttonGreen },
  paymentSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  paymentGrid: { flexDirection: 'row', gap: 12 },
  paymentBtn: { flex: 1, paddingVertical: 15, borderRadius: 10, backgroundColor: COLORS.background, borderColor: COLORS.border, borderWidth: 2, alignItems: 'center' },
  paymentBtnSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  paymentIcon: { fontSize: 28, marginBottom: 6 },
  paymentLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  paymentLabelSelected: { color: COLORS.textPrimary, fontWeight: 'bold' },
  buttonsContainer: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: COLORS.buttonRed },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  confirmBtn: { backgroundColor: COLORS.buttonGreen },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
