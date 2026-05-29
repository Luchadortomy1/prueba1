import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../services/supabaseClient';
import { updateOrderStatus as svcUpdateOrderStatus } from '../services/orderService';

interface KitchenOrder {
  id: string;
  table_number: number;
  items: any[];
  created_at: string;
  status: 'pending' | 'started' | 'ready' | 'delivered';
}

interface KitchenScreenProps {
  restaurantId: string;
  onLogout?: () => void;
}

export default function KitchenScreen({ restaurantId, onLogout }: KitchenScreenProps) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      // Intento inicial con notes (si la tabla lo soporta)
      let query = supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          tables(table_number),
          order_items (
            id,
            quantity,
            unit_price,
            subtotal,
            status,
            products (name),
            order_item_customizations (selected_value, price_adjustment, product_options(name))
          )
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['pending', 'in_progress', 'ready'])
        .order('created_at', { ascending: true });

      let res = await query;

      if (res.error && /notes/.test(String(res.error.message))) {
        console.debug('notes column missing in orders, retrying without notes');
        res = await supabase
          .from('orders')
          .select(`
            id,
            status,
            created_at,
            tables(table_number),
            order_items (
              id,
              quantity,
              unit_price,
              subtotal,
              status,
              products (name),
              order_item_customizations (selected_value, price_adjustment, product_options(name))
            )
          `)
          .eq('restaurant_id', restaurantId)
          .in('status', ['pending', 'in_progress', 'ready'])
          .order('created_at', { ascending: true });
      }

      const { data, error } = res;

      if (error) throw error;

      const ordersData = (data || []).map((order: any) => ({
        id: order.id,
        status: order.status,
        items: (order.order_items || []).map((it: any) => ({
          id: it.id,
          qty: it.quantity,
          name: it.products?.name || 'Desconocido',
          price: it.unit_price,
          item_status: it.status,
          customizations: it.order_item_customizations || [],
          customizationText: it.customization_text || null,
        })),
        created_at: order.created_at,
        table_number: order.tables?.table_number || 0,
      }));

      setOrders(ordersData);
    } catch (err) {
      console.log('Error loading kitchen orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const updateOrderStatus = async (orderId: string, nextDbStatus: string) => {
    try {
      const ok = await svcUpdateOrderStatus(orderId, nextDbStatus as any);
      if (!ok) throw new Error('update failed');
      loadOrders();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar la orden');
    }
  };

  const getStatusColor = (status: string) => {
    // Map DB statuses to UI colors
    switch (status) {
      case 'pending':
        return COLORS.buttonRed;
      case 'in_progress':
        return '#FF9800';
      case 'ready':
        return COLORS.primary;
      case 'completed':
        return COLORS.buttonGreen;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'Empezado';
      case 'ready':
        return 'Listo';
      case 'completed':
        return 'Entregado';
      default:
        return status;
    }
  };

  const getNextStatus = (currentDbStatus: string): string | null => {
    switch (currentDbStatus) {
      case 'pending':
        return 'in_progress';
      case 'in_progress':
        return 'ready';
      case 'ready':
        return 'completed';
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Cocina</Text>
          <Text style={styles.subtitle}>{orders.length} orden(es) pendiente(s)</Text>
        </View>
        {onLogout ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay órdenes pendientes</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.tableLabel}>Mesa {item.table_number}</Text>
                  <Text style={styles.orderTime}>
                    {new Date(item.created_at).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {item.items.map((orderItem: any, idx: number) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemQty}>{orderItem.qty}</Text>
                    <Text style={styles.itemName}>{orderItem.name}</Text>
                    {orderItem.customizationText && (
                      <Text style={styles.itemCustom}>{orderItem.customizationText}</Text>
                    )}
                    {orderItem.customizations && orderItem.customizations.length > 0 && (
                      <View style={styles.customizationsContainer}>
                        {orderItem.customizations.map((c: any, idx: number) => (
                          <Text key={idx} style={styles.itemCustom}>
                            - {c.selected_value || c.product_options?.name || 'Extra'} {c.price_adjustment ? `(+${c.price_adjustment})` : ''}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.updateBtn, { backgroundColor: getStatusColor(item.status) }]}
                onPress={() => {
                  const nextStatus = getNextStatus(item.status);
                  if (nextStatus) {
                    updateOrderStatus(item.id, nextStatus);
                  }
                }}
              >
                <Text style={styles.updateBtnText}>
                  {getNextStatus(item.status) ? `Marcar como ${getStatusLabel(getNextStatus(item.status)!)}` : 'Completado'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 15 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.surface, paddingHorizontal: 15, paddingVertical: 15, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textTertiary },
  orderCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 2, borderColor: COLORS.border },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
  tableLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  orderTime: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  itemsList: { marginBottom: 12, backgroundColor: COLORS.background, borderRadius: 8, padding: 10 },
  itemRow: { paddingVertical: 8, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
  itemQty: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginBottom: 2 },
  itemName: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  itemCustom: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, fontStyle: 'italic' },
  updateBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  updateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  headerRow: { backgroundColor: COLORS.surface, paddingHorizontal: 15, paddingVertical: 15, borderBottomColor: COLORS.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoutBtn: { backgroundColor: COLORS.buttonRed, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: '700' },
});
