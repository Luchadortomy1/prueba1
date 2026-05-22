import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface Order {
  id: string;
  table: string;
  status: 'pending' | 'prep' | 'ready';
  time: string;
  items: { qty: number; name: string; note?: string }[];
  urgent?: boolean;
}

interface KitchenScreenProps {
  onChangeScreen: (screen: string) => void;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    table: 'Mesa 03',
    status: 'prep',
    time: '22 min',
    urgent: true,
    items: [
      { qty: 2, name: '🍔 Smash Doble', note: 'Sin cebolla, queso cheddar' },
      { qty: 1, name: '🍗 Alitas Buffalo', note: 'Extra picante' },
    ],
  },
  {
    id: '2',
    table: 'Mesa 01',
    status: 'prep',
    time: '8 min',
    items: [
      { qty: 1, name: '🍄 Champiñones', note: 'Término medio' },
      { qty: 2, name: '🍋 Limonada Rosa' },
    ],
  },
  {
    id: '3',
    table: 'Mesa 08',
    status: 'pending',
    time: '1 min',
    urgent: true,
    items: [{ qty: 3, name: '🐔 Crispy Chicken' }],
  },
];

export default function KitchenScreen({ onChangeScreen }: KitchenScreenProps) {
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const handleMarkStart = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'prep' } : o));
  };

  const handleMarkDone = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'ready' } : o));
  };

  const renderOrderCard = (order: Order) => {
    const statusColor = order.status === 'pending' ? '#f59e0b' : order.status === 'prep' ? '#f59e0b' : '#10b981';
    const barColor = order.urgent ? '#ef4444' : statusColor;

    return (
      <View key={order.id} style={[styles.orderCard, order.urgent && styles.orderCardUrgent]}>
        <View style={styles.orderHeader}>
          <View style={[styles.statusBar, { backgroundColor: barColor }]} />
          <Text style={styles.tableName}>{order.table}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '1f' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {order.status === 'pending' ? 'Pendiente' : order.status === 'prep' ? 'Preparando' : 'Listo'}
            </Text>
          </View>
          <Text style={[styles.orderTime, order.urgent && styles.orderTimeHot]}>
            {order.time}
          </Text>
        </View>

        <View style={styles.orderItems}>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.orderItem}>
              <Text style={styles.itemQty}>{item.qty}x</Text>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.note && <Text style={styles.itemNote}>{item.note}</Text>}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.orderActions}>
          {order.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.startBtn]}
              onPress={() => handleMarkStart(order.id)}
            >
              <Text style={styles.actionBtnText}>Iniciar prep.</Text>
            </TouchableOpacity>
          )}
          {order.status === 'prep' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.doneBtn]}
              onPress={() => handleMarkDone(order.id)}
            >
              <Text style={styles.actionBtnText}>Marcar listo</Text>
            </TouchableOpacity>
          )}
          {order.status === 'ready' && (
            <View style={[styles.actionBtn, styles.deliveredBtn]}>
              <Text style={styles.deliveredBtnText}>Entregado</Text>
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
        <Text style={styles.topbarTitle}>Cocina</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{orders.length} activas</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {orders.map(renderOrderCard)}
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
  orderCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
    borderWidth: 0.5,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  orderCardUrgent: {
    borderColor: 'rgba(239, 68, 68, 0.33)',
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
    color: '#666',
  },
  orderTimeHot: {
    color: '#ef4444',
  },
  orderItems: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemQty: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    minWidth: 20,
  },
  itemName: {
    color: '#ccc',
    fontSize: 13,
  },
  itemNote: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  orderActions: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopColor: COLORS.border,
    borderTopWidth: 0.5,
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  startBtn: {
    backgroundColor: '#78350f',
  },
  doneBtn: {
    backgroundColor: '#064e3b',
  },
  deliveredBtn: {
    backgroundColor: '#1e3a2a',
  },
  deliveredBtnText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '500',
  },
});
