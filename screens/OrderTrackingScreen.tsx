import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../services/supabaseClient';

interface Order {
  id: string;
  status: 'pending' | 'started' | 'ready' | 'delivered';
  items: any[];
  created_at: string;
  table_number: number;
  notes?: string;
}

interface OrderTrackingScreenProps {
  restaurantId: string;
  waiterId: string;
  tableId: string;
}
export default function OrderTrackingScreen(props: Readonly<OrderTrackingScreenProps>) {
  const { restaurantId, waiterId, tableId } = props;
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, [tableId, waiterId]);

  const buildOrdersQuery = (includeNotes: boolean, sessionBoundary: string | null) => {
    let baseQuery = supabase
      .from('orders')
      .select(includeNotes ? `
          id,
          status,
          created_at,
          tables(table_number),
          notes,
          order_items (
            id,
            quantity,
            unit_price,
            subtotal,
            status,
            products (name),
            order_item_customizations (option_id, selected_value, price_adjustment, product_options(name))
          )
        ` : `
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
            order_item_customizations (option_id, selected_value, price_adjustment, product_options(name))
          )
        `)
      .eq('restaurant_id', restaurantId)
      .eq('waiter_id', waiterId)
      .eq('table_id', tableId)
      .order('created_at', { ascending: false });

    if (sessionBoundary) {
      baseQuery = baseQuery.gt('created_at', sessionBoundary);
    }

    return baseQuery;
  };

  const loadOrders = async () => {
    try {
      // Obtener el último cierre de esta mesa para delimitar la sesión actual
      const { data: lastClose, error: lastCloseError } = await supabase
        .from('order_history')
        .select('completed_at')
        .eq('restaurant_id', restaurantId)
        .eq('table_id', tableId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastCloseError) {
        console.log('Error loading last close for tracking:', lastCloseError);
      }

      const sessionBoundary = lastClose?.completed_at || null;

      let res = await buildOrdersQuery(true, sessionBoundary);

      // Si la columna notes no existe, rehacer la consulta sin ella
      if (res.error && /notes/.test(String(res.error.message))) {
        console.debug('notes column missing, retrying without notes');
        res = await buildOrdersQuery(false, sessionBoundary);
      }

      const { data, error } = res;
      console.debug('OrderTracking loadOrders data:', data, 'error:', error);

      if (error) throw error;

      // Transformar data para que coincida con Order interface
      const ordersData = (data || []).map((order: any) => ({
        id: order.id,
        status: order.status,
        items: (order.order_items || []).map((it: any) => ({
          id: it.id,
          name: it.products?.name || 'Desconocido',
          qty: it.quantity,
          price: it.unit_price,
          customizations: it.order_item_customizations || []
        })),
        created_at: order.created_at,
        table_number: order.tables?.table_number || 'N/A',
        notes: order.notes,
      }));
      
      setOrders(ordersData);
    } catch (err) {
      console.log('Error loading orders:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.buttonRed;
      case 'in_progress':
      case 'started':
        return '#FF9800';
      case 'ready':
        return COLORS.primary;
      case 'completed':
      case 'delivered':
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
      case 'started':
        return 'Empezado';
      case 'ready':
        return 'Listo';
      case 'completed':
      case 'delivered':
        return 'Entregado';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguimiento de Órdenes</Text>
      
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
                <Text style={styles.orderTime}>
                  {new Date(item.created_at).toLocaleTimeString()}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {item.items.map((orderItem: any) => (
                  <View key={`${orderItem.id}-${orderItem.name}`} style={{ paddingVertical: 6 }}>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemName}>{orderItem.name}</Text>
                      <Text style={styles.itemQty}>x{orderItem.qty}</Text>
                      <Text style={styles.itemPrice}>${orderItem.price * orderItem.qty}</Text>
                    </View>
                    {orderItem.customizations && orderItem.customizations.length > 0 && (
                      <View style={{ paddingLeft: 12 }}>
                        {orderItem.customizations.map((c: any) => (
                          <Text key={`${orderItem.id}-${c.option_id || c.selected_value || 'extra'}`} style={{ fontSize: 12, color: '#444' }}>- {c.selected_value || c.product_options?.name || 'Extra'} {c.price_adjustment ? `(+${c.price_adjustment})` : ''}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {item.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Notas:</Text>
                  <Text style={styles.notesText}>{item.notes}</Text>
                </View>
              )}
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 15 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginVertical: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textTertiary },
  orderCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomColor: COLORS.border, borderBottomWidth: 1 },
  orderTime: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  itemsList: { marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 8 },
  itemName: { flex: 1, fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },
  itemQty: { fontSize: 12, color: COLORS.textSecondary, marginHorizontal: 8 },
  itemPrice: { fontSize: 12, color: COLORS.buttonGreen, fontWeight: 'bold', minWidth: 50, textAlign: 'right' },
  notesSection: { backgroundColor: COLORS.background, borderRadius: 8, padding: 8, marginTop: 10 },
  notesLabel: { fontSize: 11, fontWeight: 'bold', color: COLORS.textSecondary },
  notesText: { fontSize: 11, color: COLORS.textPrimary, marginTop: 4 },
});
