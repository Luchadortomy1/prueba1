import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface KitchenOrder {
  id: string;
  table: number;
  items: any[];
  timestamp: number;
  status: 'pending' | 'prep' | 'ready' | 'delivered';
}

interface KitchenScreenProps {
  onChangeScreen: (screen: string) => void;
  tableOrders?: {[key: number]: { items: any[] }};
  onUpdateOrderStatus?: (mesa: number, orderId: string, newStatus: string) => void;
}

const getEmoji = (productName: string): string => {
  const emojiMap: {[key: string]: string} = {
    'Hamburguesa Smash Doble': '🍔',
    'Pizza Hawaiiana': '🍍',
    'Crispy Chicken': '🐔',
    'Champiñones': '🍄',
    'Alitas Buffalo': '🍗',
    'Limonada Rosa': '🍋',
  };
  return emojiMap[productName] || '🍽';
};

export default function KitchenScreen({ onChangeScreen, tableOrders = {}, onUpdateOrderStatus }: KitchenScreenProps) {
  // Flatten all orders from all tables
  const allOrders = useMemo(() => {
    const orders: (KitchenOrder & { tableName: string })[] = [];
    
    Object.entries(tableOrders).forEach(([tableNum, tableData]: [string, any]) => {
      if (tableData?.items && Array.isArray(tableData.items)) {
        tableData.items.forEach((order: any) => {
          if (order.id && order.items) {
            orders.push({
              ...order,
              table: parseInt(tableNum),
              tableName: `Mesa ${String(parseInt(tableNum)).padStart(2, '0')}`
            });
          }
        });
      }
    });
    
    return orders.sort((a, b) => b.timestamp - a.timestamp);
  }, [tableOrders]);

  const getElapsedTime = (timestamp: number): string => {
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsed < 60) return `${elapsed}s`;
    return `${Math.floor(elapsed / 60)}m`;
  };

  const renderOrderCard = (order: KitchenOrder & { tableName: string }) => {
    const statusConfig = {
      pending: { color: '#f59e0b', label: 'Pendiente', bgColor: '#78350f' },
      prep: { color: '#f59e0b', label: 'Preparando', bgColor: '#78350f' },
      ready: { color: '#10b981', label: 'Listo', bgColor: '#064e3b' },
      delivered: { color: '#6b7280', label: 'Entregado', bgColor: '#1f2937' },
    };
    const config = statusConfig[order.status || 'pending'];

    return (
      <View key={order.id} style={[styles.orderCard]}>
        <View style={styles.orderHeader}>
          <View style={[styles.statusBar, { backgroundColor: config.color }]} />
          <Text style={styles.tableName}>{order.tableName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            <Text style={[styles.statusBadgeText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={[styles.orderTime, { color: config.color }]}>
            {getElapsedTime(order.timestamp)}
          </Text>
        </View>

        <View style={styles.orderItems}>
          {order.items?.map((item, idx) => (
            <View key={idx} style={styles.orderItem}>
              <Text style={styles.itemEmoji}>{getEmoji(item.name)}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemQty}>{item.qty}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.customizationText && (
                  <Text style={styles.itemCustom}>{item.customizationText}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.orderActions}>
          {order.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.startBtn]}
              onPress={() => onUpdateOrderStatus?.(order.table, order.id, 'prep')}
            >
              <Text style={styles.actionBtnText}>Iniciar preparación</Text>
            </TouchableOpacity>
          )}
          {order.status === 'prep' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.readyBtn]}
              onPress={() => onUpdateOrderStatus?.(order.table, order.id, 'ready')}
            >
              <Text style={styles.actionBtnText}>Marcar listo</Text>
            </TouchableOpacity>
          )}
          {order.status === 'ready' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deliveredBtn]}
              onPress={() => onUpdateOrderStatus?.(order.table, order.id, 'delivered')}
            >
              <Text style={styles.actionBtnText}>Entregar</Text>
            </TouchableOpacity>
          )}
          {order.status === 'delivered' && (
            <View style={[styles.actionBtn, styles.completedBtn]}>
              <Text style={styles.completedBtnText}>✓ Entregado</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onChangeScreen('menu')}>
          <Text style={styles.iconBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>🔥 Cocina</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{allOrders.length} órdenes</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {allOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Sin órdenes pendientes</Text>
            <Text style={styles.emptySubtext}>Las órdenes aparecerán aquí cuando se envíen desde el menú</Text>
          </View>
        ) : (
          allOrders.map(renderOrderCard)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 70,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    paddingTop: 20,
    gap: 10,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 0.5,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#252525',
    borderColor: '#333',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 16,
    color: '#aaa',
  },
  topbarTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#252525',
    borderRadius: 10,
  },
  badgeText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 0.5,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 0.5,
    gap: 8,
  },
  statusBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  tableName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  orderTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderItems: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemQty: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  itemName: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 2,
  },
  itemCustom: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  orderActions: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopColor: COLORS.border,
    borderTopWidth: 0.5,
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  startBtn: {
    backgroundColor: '#78350f',
  },
  readyBtn: {
    backgroundColor: '#78350f',
  },
  deliveredBtn: {
    backgroundColor: '#064e3b',
  },
  completedBtn: {
    backgroundColor: '#1f2937',
  },
  completedBtnText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
  },
});
