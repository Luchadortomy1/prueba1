import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../services/supabaseClient';
import HistoryDetailModal from './HistoryDetailModal';

interface TableHistoryModalProps {
  visible: boolean;
  restaurantId: string;
  onClose: () => void;
}

interface HistoryRow {
  id: string;
  restaurant_id: string;
  table_id: string;
  order_id: string | null;
  total_amount: number;
  payment_method: string;
  items_count: number;
  completed_at: string;
  created_at: string;
  table_number?: number;
}

const formatCustomizationText = (customizations: any[]) => {
  return customizations
    .map((c: any) => c.selected_value || c.product_options?.name || 'Extra')
    .join(', ');
};

export default function TableHistoryModal(props: Readonly<TableHistoryModalProps>) {
  const { visible, restaurantId, onClose } = props;
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [tableFilter, setTableFilter] = useState<number>(0); // 0 = all, 1-9 = specific table

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_history')
        .select('*, tables(table_number)')
        .eq('restaurant_id', restaurantId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setRows((data || []).map((row: any) => ({
        ...row,
        table_number: row.tables?.table_number,
      })));
    } catch (err) {
      console.log('Error loading history rows:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) loadHistory();
  }, [visible, restaurantId]);

  const openDetail = async (row: HistoryRow) => {
    try {
      // Get items directly from row since it's a single session closure
      let detailedItems: any[] = [];
      
      if (row.items_count && row.items_count > 0) {
        const sameTableRows = rows
          .filter((entry) => entry.table_id === row.table_id)
          .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());

        const currentIndex = sameTableRows.findIndex((entry) => entry.id === row.id);
        const previousBoundary = currentIndex > 0 ? sameTableRows[currentIndex - 1].completed_at : null;

        let orderQuery = supabase
          .from('orders')
          .select(`
            id,
            created_at,
            order_items (
              id,
              quantity,
              unit_price,
              subtotal,
              products (name),
              order_item_customizations (selected_value, price_adjustment, product_options(name))
            )
          `)
          .eq('table_id', row.table_id)
          .lte('created_at', row.completed_at)
          .order('created_at', { ascending: true });

        if (previousBoundary) {
          orderQuery = orderQuery.gt('created_at', previousBoundary);
        }

        const { data: orderData, error } = await orderQuery;

        if (error) throw error;

        detailedItems = (orderData || []).flatMap((order: any) =>
          (order.order_items || []).map((it: any) => ({
            id: it.id,
            name: it.products?.name || 'Desconocido',
            qty: it.quantity,
            price: it.unit_price,
            customizationText: formatCustomizationText(it.order_item_customizations || []),
          }))
        );
      }

      setSelectedEntry({
        id: row.id,
        timestamp: row.completed_at,
        total_amount: row.total_amount,
        paymentMethod: row.payment_method,
        table_number: row.table_number,
        items: [{ items: detailedItems }],
      });
      setDetailVisible(true);
    } catch (err) {
      console.log('Error opening history detail:', err);
    }
  };

  const filteredRows = tableFilter === 0 
    ? rows 
    : rows.filter(row => row.table_number === tableFilter);
  
  const totalAmount = filteredRows.reduce((sum, row) => sum + (row.total_amount || 0), 0);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Historial de Cuentas</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* FILTER SECTION */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filtrar por Mesa:</Text>
            <View style={styles.filterButtons}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((tableNum) => (
                <TouchableOpacity
                  key={tableNum}
                  style={[styles.filterBtn, tableFilter === tableNum && styles.filterBtnActive]}
                  onPress={() => setTableFilter(tableNum)}
                >
                  <Text style={[styles.filterBtnText, tableFilter === tableNum && styles.filterBtnTextActive]}>
                    {tableNum === 0 ? 'Todas' : tableNum}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* TOTAL SECTION */}
          {filteredRows.length > 0 && (
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total de Cuentas Filtradas:</Text>
              <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
          ) : (
            <FlatList
              data={filteredRows}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={(
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay cuentas cerradas</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.rowCard} onPress={() => openDetail(item)}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowTitle}>Mesa {item.table_number || 'N/A'}</Text>
                    <Text style={styles.rowAmount}>${Number(item.total_amount || 0).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.rowMeta}>
                    {new Date(item.completed_at).toLocaleString()} · {item.items_count} item(s) · {item.payment_method}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <HistoryDetailModal
        visible={detailVisible}
        historyEntry={selectedEntry}
        onClose={() => setDetailVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  sheet: { width: '100%', maxHeight: '90%', backgroundColor: COLORS.surface, borderRadius: 16, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  closeText: { fontSize: 22, color: COLORS.textSecondary },
  
  /* FILTER SECTION */
  filterSection: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.background },
  filterLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },
  filterButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.border, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  filterBtnTextActive: { color: COLORS.textPrimary, fontWeight: 'bold' },
  
  /* TOTAL SECTION */
  totalSection: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: COLORS.buttonGreen },
  
  loadingContainer: { paddingVertical: 40 },
  emptyContainer: { padding: 28, alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary },
  listContent: { padding: 16, gap: 10 },
  rowCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  rowAmount: { fontSize: 16, fontWeight: 'bold', color: COLORS.buttonGreen },
  rowMeta: { marginTop: 6, fontSize: 12, color: COLORS.textSecondary },
  closeBtn: { paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.primary },
  closeBtnText: { color: COLORS.textPrimary, fontWeight: 'bold' },
});
