import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';

interface DashboardScreenProps {
  onChangeScreen: (screen: string) => void;
}

const TOP_PRODUCTS = [
  { rank: 1, emoji: '🍔', name: 'Smash Doble', sold: 23 },
  { rank: 2, emoji: '🍗', name: 'Alitas Buffalo', sold: 18 },
  { rank: 3, emoji: '🐔', name: 'Crispy Chicken', sold: 15 },
  { rank: 4, emoji: '🍋', name: 'Limonada Rosa', sold: 31 },
];

const UNAVAILABLE = [
  { emoji: '🍄', name: 'Champiñones', reason: 'Stock acabado' },
  { emoji: '🍍', name: 'Pizza Hawaiiana', reason: 'Espera por ingredientes' },
];

export default function DashboardScreen({ onChangeScreen }: DashboardScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onChangeScreen('menu')}>
          <Text style={styles.iconBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Panel Mesero</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>🏢 Suc. 1</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Productos - Consumo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Lo más popular</Text>
          {TOP_PRODUCTS.map((product) => (
            <View key={product.rank} style={styles.consumItem}>
              <View style={styles.consumHeader}>
                <Text style={styles.consumEmoji}>{product.emoji}</Text>
                <View style={styles.consumInfo}>
                  <Text style={styles.consumName}>{product.name}</Text>
                  <Text style={styles.consumSubtext}>Vendido hoy</Text>
                </View>
              </View>
              <Text style={styles.consumCount}>{product.sold}x</Text>
            </View>
          ))}
        </View>

        {/* Productos No Disponibles */}
        {UNAVAILABLE.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.sectionTitleWarning]}>⚠️ No disponible</Text>
            {UNAVAILABLE.map((item, idx) => (
              <View key={idx} style={styles.unavailableItem}>
                <Text style={styles.unavailableEmoji}>{item.emoji}</Text>
                <View style={styles.unavailableInfo}>
                  <Text style={styles.unavailableName}>{item.name}</Text>
                  <Text style={styles.unavailableReason}>{item.reason}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Información útil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Información</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>• Recuerda revisar mesas cada 15 minutos</Text>
            <Text style={styles.infoText}>• Asegúrate de confirmar órdenes especiales</Text>
            <Text style={styles.infoText}>• Notifica al cliente sobre productos no disponibles</Text>
          </View>
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
  section: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
    borderWidth: 0.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionTitleWarning: {
    color: '#f59e0b',
  },
  consumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#222',
    borderBottomWidth: 0.5,
  },
  consumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  consumEmoji: {
    fontSize: 24,
  },
  consumInfo: {
    flex: 1,
  },
  consumName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  consumSubtext: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
  consumCount: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  unavailableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderLeftColor: '#f59e0b',
    borderLeftWidth: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  unavailableEmoji: {
    fontSize: 24,
  },
  unavailableInfo: {
    flex: 1,
  },
  unavailableName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  unavailableReason: {
    color: '#f59e0b',
    fontSize: 10,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftColor: COLORS.accent,
    borderLeftWidth: 3,
  },
  infoText: {
    color: '#a78bfa',
    fontSize: 11,
    marginBottom: 6,
  },
});
