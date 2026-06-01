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

export default function CheckoutModal({ visible, cartTotal, selectedTable = 0, onClose, onConfirm, onRefresh, serverTotal: serverTotalProp }: Readonly<CheckoutModalProps>) {
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [serverTotalLocal, setServerTotalLocal] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const cartTotal_val = cartTotal;
  const displayedServerTotal = typeof serverTotalProp === 'number' ? serverTotalProp : serverTotalLocal;
  const subtotal = cartTotal_val + (displayedServerTotal || 0);
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

          {/* TOTALS SECTION - Always visible */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Carrito</Text>
              <Text style={styles.totalValue}>${cartTotal_val.toFixed(2)}</Text>
            </View>
            {displayedServerTotal > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>En Cocina</Text>
                <Text style={styles.totalValue}>${displayedServerTotal.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.totalRowBold]}>
              <Text style={styles.totalLabelBold}>TOTAL</Text>
              <Text style={styles.totalValueBold}>${total.toFixed(2)}</Text>
            </View>
          </View>

          {/* PAYMENT SECTION */}
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

          {/* BUTTONS SECTION */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#f0f0f0', marginBottom: 10 }]}
            onPress={handleRefresh}
            disabled={!onRefresh || refreshing}
          >
            <Text style={{ fontWeight: '700', color: COLORS.textPrimary }}>{refreshing ? 'Actualizando...' : '🔄 Refrescar'}</Text>
          </TouchableOpacity>
          
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
  
  /* TOTALS SECTION */
  totalsSection: { backgroundColor: COLORS.background, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomColor: COLORS.border, borderBottomWidth: 0.5 },
  totalRowBold: { borderBottomWidth: 0, borderTopColor: COLORS.border, borderTopWidth: 1, marginTop: 6, paddingTop: 14 },
  totalLabel: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' },
  totalLabelBold: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary },
  totalValue: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '700' },
  totalValueBold: { fontSize: 22, fontWeight: 'bold', color: COLORS.buttonGreen },
  
  /* PAYMENT SECTION */
  paymentSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  paymentGrid: { flexDirection: 'row', gap: 14 },
  paymentBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: COLORS.background, borderColor: COLORS.border, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  paymentBtnSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  paymentIcon: { fontSize: 28, marginBottom: 6 },
  paymentLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
  paymentLabelSelected: { color: '#fff', fontWeight: 'bold' },
  
  /* BUTTONS */
  button: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonsContainer: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: COLORS.buttonRed },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  confirmBtn: { flex: 1, backgroundColor: COLORS.buttonGreen },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
