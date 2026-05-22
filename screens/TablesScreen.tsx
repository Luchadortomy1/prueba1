import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, FlatList } from 'react-native';
import { COLORS } from '../constants/colors';

const TABLES = [
  { id: '1', number: '01', status: 'occupied', time: '42 min', zone: 'Interior' },
  { id: '2', number: '02', status: 'empty', capacity: '4 personas', zone: 'Interior' },
  { id: '3', number: '03', status: 'pending', time: '1h 08m', zone: 'Interior' },
  { id: '4', number: '04', status: 'occupied', time: '18 min', zone: 'Interior' },
  { id: '5', number: '05', status: 'empty', capacity: '2 personas', zone: 'Interior' },
  { id: '6', number: '06', status: 'reserved', time: '8:30 pm', zone: 'Interior' },
  { id: '7', number: '07', status: 'empty', capacity: '4 personas', zone: 'Terraza' },
  { id: '8', number: '08', status: 'occupied', time: '27 min', zone: 'Terraza' },
  { id: '9', number: '09', status: 'empty', capacity: '6 personas', zone: 'Terraza' },
];

interface TablesScreenProps {
  onChangeScreen: (screen: string) => void;
}

const getTableStyle = (status: string) => {
  switch (status) {
    case 'occupied':
      return { borderColor: '#a78bfa', backgroundColor: '#1c1429' };
    case 'pending':
      return { borderColor: 'rgba(255, 107, 44, 0.33)', backgroundColor: '#1c1208' };
    case 'reserved':
      return { borderColor: '#333', backgroundColor: '#1a1a1a', opacity: 0.6 };
    default:
      return { borderColor: COLORS.border, backgroundColor: COLORS.surfaceAlt };
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'occupied':
      return '#a78bfa';
    case 'pending':
      return COLORS.primary;
    default:
      return '#666';
  }
};

export default function TablesScreen({ onChangeScreen }: TablesScreenProps) {
  const zones = ['Interior', 'Terraza'];

  const renderTable = ({ item }: any) => {
    const tableStyle = getTableStyle(item.status);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity 
        style={[styles.tableCard, tableStyle]}
        onPress={() => onChangeScreen('menu')}
      >
        <Text style={styles.tableNumber}>{item.number}</Text>
        <Text style={[styles.tableStatus, { color: statusColor }]}>
          {item.status === 'empty' ? 'Libre' : item.status === 'occupied' ? 'Ocupada' : item.status === 'pending' ? 'Por cobrar' : 'Reservada'}
        </Text>
        {item.time && <Text style={{ color: statusColor, fontSize: 11, fontWeight: '500' }}>{item.time}</Text>}
        {item.capacity && <Text style={styles.tableCapacity}>{item.capacity}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onChangeScreen('menu')}>
          <Text style={styles.iconBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Mesas</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {zones.map((zone) => (
          <View key={zone}>
            <Text style={styles.zoneLabel}>{zone}</Text>
            <View style={styles.tableGrid}>
              {TABLES.filter(t => t.zone === zone).map((table) => (
                <View key={table.id} style={styles.tableWrapper}>
                  {renderTable({ item: table })}
                </View>
              ))}
            </View>
          </View>
        ))}
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
    textAlign: 'center',
  },
  content: {
    padding: 14,
  },
  zoneLabel: {
    color: '#444',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 4,
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  tableWrapper: {
    width: '31%',
  },
  tableCard: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
  },
  tableNumber: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  tableStatus: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  tableCapacity: {
    fontSize: 10,
    color: '#444',
    marginTop: 2,
  },
});
