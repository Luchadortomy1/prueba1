import React from 'react';
import { StyleSheet, View, Modal, ScrollView, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface HistoryDetailModalProps {
  visible: boolean;
  historyEntry: any;
  onClose: () => void;
}

export default function HistoryDetailModal(props: Readonly<HistoryDetailModalProps>) {
  const { visible, historyEntry, onClose } = props;
  if (!historyEntry) return null;

  const timestamp = new Date(historyEntry.timestamp);
  const timeString = timestamp.toLocaleTimeString();
  const dateString = timestamp.toLocaleDateString();

  // Flatten all items from orders
  const allItems = historyEntry.items && historyEntry.items.length > 0
    ? historyEntry.items.flatMap((order: any) => order.items || [])
    : historyEntry.items || [];

  // Calculate totals
  const subtotal = allItems.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
  const total = subtotal;

  // Get payment method label
  const paymentLabel = historyEntry.paymentMethod === 'cash' ? '💵 Efectivo' : '💳 Tarjeta';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Detalle de Venta</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Date and Time */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>{dateString}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Hora</Text>
                <Text style={styles.infoValue}>{timeString}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Método</Text>
                <Text style={styles.infoValue}>{paymentLabel}</Text>
              </View>
            </View>

            {/* Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Productos ({allItems.length})</Text>
              {allItems.length > 0 ? (
                allItems.map((item: any) => (
                  <View key={item.id || `${item.name}-${item.qty}-${item.price}`} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>${(item.price * item.qty).toFixed(0)}</Text>
                    </View>
                    
                    {/* Quantity and Customization */}
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemQty}>Cantidad: {item.qty}</Text>
                      {item.customizationText && (
                        <View style={styles.customizationBox}>
                          <Text style={styles.customizationLabel}>Agregados:</Text>
                          <Text style={styles.customizationText}>{item.customizationText}</Text>
                        </View>
                      )}
                      <Text style={styles.itemUnitPrice}>
                        ${item.price} × {item.qty} = ${(item.price * item.qty).toFixed(0)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Sin items</Text>
              )}
            </View>

            {/* Totals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Totales</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>${subtotal}</Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowFinal]}>
                <Text style={styles.totalLabelFinal}>Total</Text>
                <Text style={styles.totalValueFinal}>${historyEntry.total_amount || historyEntry.total || total}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeFullBtn} onPress={onClose}>
            <Text style={styles.closeFullBtnText}>Cerrar</Text>
          </TouchableOpacity>
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
    maxHeight: '90%',
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 0.5,
  },
  closeBtn: {
    color: COLORS.textSecondary,
    fontSize: 24,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 0.5,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  itemCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderColor: COLORS.border,
    borderWidth: 0.5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  itemPrice: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  itemDetails: {
    marginTop: 8,
  },
  itemQty: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  customizationBox: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderLeftColor: COLORS.accent,
    borderLeftWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 8,
    borderRadius: 6,
  },
  customizationLabel: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  customizationText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  itemUnitPrice: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 0.5,
  },
  totalRowFinal: {
    borderBottomWidth: 0,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: 8,
    paddingVertical: 12,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  totalLabelFinal: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  totalValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  totalValueFinal: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  closeFullBtn: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeFullBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
