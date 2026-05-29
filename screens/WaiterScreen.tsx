import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../services/supabaseClient';
import TableHistoryModal from '../modals/TableHistoryModal';

interface Table {
  id: string;
  table_number: number;
  status: 'free' | 'occupied' | 'reserved';
  capacity: number;
}

interface WaiterScreenProps {
  restaurantId: string;
  waiterId: string;
  onLogout: () => void;
  onSelectTable: (table: Table) => void;
  refreshKey?: number;
}

export default function WaiterScreen(props: Readonly<WaiterScreenProps>) {
  const {
    restaurantId,
    onLogout,
    onSelectTable,
    refreshKey,
  } = props;
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [guestCount, setGuestCount] = useState('2');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [refreshingTables, setRefreshingTables] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    console.log('📍 WaiterScreen: restaurantId=', restaurantId?.substring(0, 8));
    loadTables();
  }, [restaurantId, refreshKey]);

  const loadTables = async () => {
    try {
      console.log('📍 Cargando mesas para restaurante:', restaurantId);
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('table_number');

      if (error) {
        console.error('❌ Error cargando mesas:', error);
        throw error;
      }
      console.log('✅ Mesas cargadas:', data?.length || 0);
      setTables(data || []);
    } catch (err: any) {
      console.error('❌ Error loading tables:', err);
      Alert.alert('Error', 'No se pudieron cargar las mesas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefreshTables = async () => {
    try {
      setRefreshingTables(true);
      await loadTables();
    } catch (err) {
      console.error('Error refreshing tables:', err);
    } finally {
      setRefreshingTables(false);
    }
  };

  const handleTablePress = (table: Table) => {
    if (table.status === 'free') {
      setSelectedTable(table);
      setShowGuestModal(true);
    } else {
      // Si ya está ocupada, abrir la orden existente
      onSelectTable(table);
    }
  };

  const handleConfirmGuests = async () => {
    if (!selectedTable) return;

    const guests = Number.parseInt(guestCount, 10);
    if (Number.isNaN(guests) || guests < 1) {
      Alert.alert('Error', 'Ingresa cantidad válida de comensales');
      return;
    }

    // Marcar mesa como ocupada
    const { error } = await supabase
      .from('tables')
      .update({ status: 'occupied' })
      .eq('id', selectedTable.id);

    if (error) {
      Alert.alert('Error', 'No se pudo ocupar la mesa');
      return;
    }

    setShowGuestModal(false);
    onSelectTable(selectedTable);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free':
        return COLORS.buttonGreen;
      case 'occupied':
        return COLORS.warning;
      case 'reserved':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'free':
        return 'LIBRE';
      case 'occupied':
        return 'OCUPADA';
      case 'reserved':
        return 'RESERVADA';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesas</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistoryModal(true)}>
            <Text style={styles.historyButtonText}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Cargando mesas...</Text>
      ) : (
        <FlatList
          data={tables}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.tableRow}
          refreshControl={<RefreshControl refreshing={refreshingTables} onRefresh={onRefreshTables} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tableCard,
                { backgroundColor: getStatusColor(item.status) },
              ]}
              onPress={() => handleTablePress(item)}
              disabled={item.status !== 'free' && item.status !== 'occupied'}
            >
              <Text style={styles.tableNumberBig}>{item.table_number}</Text>
              <Text style={styles.tableStatus}>
                {getStatusLabel(item.status)}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={showGuestModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.guestModal}>
            <Text style={styles.guestModalTitle}>
              Mesa {selectedTable?.table_number}
            </Text>
            <Text style={styles.guestModalSubtitle}>
              Cuantos comensales?
            </Text>

            <TextInput
              style={styles.guestInput}
              placeholder="Ej: 2"
              value={guestCount}
              onChangeText={setGuestCount}
              keyboardType="number-pad"
            />

            <View style={styles.guestButtons}>
              <TouchableOpacity
                style={[styles.guestButton, styles.cancelButton]}
                onPress={() => {
                  setShowGuestModal(false);
                  setSelectedTable(null);
                }}
              >
                <Text style={styles.guestButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.guestButton, styles.confirmButton]}
                onPress={handleConfirmGuests}
              >
                <Text style={styles.guestButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TableHistoryModal
        visible={showHistoryModal}
        restaurantId={restaurantId}
        onClose={() => setShowHistoryModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  historyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  historyButtonText: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 12 },
  logoutButton: {
    backgroundColor: COLORS.buttonRed,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  listContent: {
    padding: 15,
  },
  tableRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  tableCard: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tableNumberBig: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  tableStatus: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.7,
    marginTop: 10,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestModal: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 30,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  guestModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  guestModalSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  guestInput: {
    backgroundColor: '#F9F9F9',
    borderColor: COLORS.border,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  guestButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  guestButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.buttonRed,
  },
  confirmButton: {
    backgroundColor: COLORS.buttonGreen,
  },
  guestButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
