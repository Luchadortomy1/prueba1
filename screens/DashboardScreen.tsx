import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';

interface DashboardScreenProps {
  onChangeScreen: (screen: string) => void;
}

const SALES_DATA = [
  { hour: '10h', sales: 800 },
  { hour: '11h', sales: 1800 },
  { hour: '12h', sales: 4200 },
  { hour: '13h', sales: 5100 },
  { hour: '14h', sales: 3900 },
  { hour: '15h', sales: 2500 },
  { hour: '16h', sales: 1800 },
  { hour: '17h', sales: 2200 },
  { hour: '18h', sales: 3600 },
  { hour: '19h', sales: 4800 },
  { hour: '20h', sales: 5400 },
];

const TOP_PRODUCTS = [
  { rank: 1, emoji: '🍔', name: 'Smash Doble', amount: '$4,470' },
  { rank: 2, emoji: '🍗', name: 'Alitas Buffalo', amount: '$3,096' },
  { rank: 3, emoji: '🐔', name: 'Crispy Chicken', amount: '$2,856' },
  { rank: 4, emoji: '🍋', name: 'Limonada Rosa', amount: '$1,980' },
];

const INVENTORY = [
  { name: 'Carne Angus', stock: '4.5 kg', color: '#ef4444' },
  { name: 'Panes Brioche', stock: '18 pzas', color: '#f59e0b' },
  { name: 'Tocino', stock: '1.2 kg', color: '#ef4444' },
];

export default function DashboardScreen({ onChangeScreen }: DashboardScreenProps) {
  const maxSales = Math.max(...SALES_DATA.map(d => d.sales));

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onChangeScreen('menu')}>
          <Text style={styles.iconBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Dashboard</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>🏢 Suc. 1</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Ventas hoy</Text>
            <Text style={[styles.metricValue, styles.metricValueGreen]}>$12.4k</Text>
            <Text style={styles.metricSub}>+18% vs ayer</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Órdenes</Text>
            <Text style={[styles.metricValue, styles.metricValueOrange]}>74</Text>
            <Text style={styles.metricSub}>12 activas</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Ticket prom.</Text>
            <Text style={styles.metricValue}>$168</Text>
            <Text style={styles.metricSub}>+$14 vs ayer</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Stock crítico</Text>
            <Text style={[styles.metricValue, styles.metricValueRed]}>3</Text>
            <Text style={styles.metricSub}>Revisar ahora</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartWrap}>
          <Text style={styles.chartTitle}>Ventas por hora</Text>
          <View style={styles.bars}>
            {SALES_DATA.map((data, idx) => (
              <View key={idx} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: ((data.sales / maxSales) * 76),
                      backgroundColor: data.sales === maxSales ? COLORS.primary : '#2a2a2a',
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{data.hour}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.topList}>
          <Text style={styles.chartTitle}>Top productos</Text>
          {TOP_PRODUCTS.map((product) => (
            <View key={product.rank} style={styles.topItem}>
              <Text style={styles.topRank}>#{product.rank}</Text>
              <Text style={styles.topEmoji}>{product.emoji}</Text>
              <Text style={styles.topName}>{product.name}</Text>
              <Text style={styles.topAmount}>{product.amount}</Text>
            </View>
          ))}
        </View>

        {/* Inventory */}
        <View style={styles.topList}>
          <Text style={[styles.chartTitle, { color: '#ef4444' }]}>Inventario crítico</Text>
          {INVENTORY.map((item, idx) => (
            <View key={idx} style={[styles.invItem, idx === INVENTORY.length - 1 && styles.invItemLast]}>
              <View style={[styles.invDot, { backgroundColor: item.color }]} />
              <Text style={styles.invName}>{item.name}</Text>
              <Text style={[styles.invStock, { color: item.color }]}>{item.stock}</Text>
            </View>
          ))}
        </View>
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
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#252525',
    borderColor: '#333',
    borderWidth: 0.5,
  },
  pillText: {
    color: '#ff6b2c',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
    borderWidth: 0.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  metricLabel: {
    color: '#555',
    fontSize: 11,
    marginBottom: 4,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '500',
  },
  metricValueGreen: {
    color: COLORS.success,
  },
  metricValueOrange: {
    color: COLORS.primary,
  },
  metricValueRed: {
    color: COLORS.danger,
  },
  metricSub: {
    color: '#555',
    fontSize: 10,
    marginTop: 2,
  },
  chartWrap: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
    borderWidth: 0.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  chartTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    color: '#555',
    fontSize: 9,
  },
  topList: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
    borderWidth: 0.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  topRank: {
    color: '#444',
    fontSize: 12,
    minWidth: 16,
  },
  topEmoji: {
    fontSize: 22,
  },
  topName: {
    color: '#ccc',
    fontSize: 12,
    flex: 1,
  },
  topAmount: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '500',
  },
  invItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomColor: '#222',
    borderBottomWidth: 0.5,
  },
  invItemLast: {
    borderBottomWidth: 0,
  },
  invDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  invName: {
    color: '#ccc',
    fontSize: 12,
    flex: 1,
  },
  invStock: {
    fontSize: 11,
  },
});
