import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import MenuScreen from './MenuScreen';
import OrderTrackingScreen from './OrderTrackingScreen';
import CheckoutModal from '../modals/CheckoutModal';

interface WaiterDashboardProps {
  restaurantId: string;
  userId: string;
  selectedTable: any;
  cartItems: any[];
  cartTotal: number;
  onSelectProduct: (product: any) => void;
  onOpenProductModal: (visible: boolean) => void;
  onAddToCart: (qty: number, price: number, productName?: string, customizationText?: string) => void;
  onRemoveFromCart: (itemId: string) => void;
  onSendOrder: () => void;
  onShowCheckout: (visible: boolean) => void;
  showCheckoutModal: boolean;
  onConfirmPay: () => void;
  onBackToTables: () => void;
  onRefreshCheckout?: () => Promise<number>;
  serverTotalOverride?: number;
}

export default function WaiterDashboard(props: Readonly<WaiterDashboardProps>) {
  const {
  restaurantId,
  userId,
  selectedTable,
  cartItems,
  cartTotal,
  onSelectProduct,
  onOpenProductModal,
  onShowCheckout,
  showCheckoutModal,
  onConfirmPay,
  onRefreshCheckout,
  serverTotalOverride,
  onBackToTables,
  } = props;
  const [activeTab, setActiveTab] = React.useState<'menu' | 'tracking' | 'checkout'>('menu');
  const [serverTotal, setServerTotal] = React.useState<number>(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefreshClick = async () => {
    if (!onRefreshCheckout) return;
    try {
      setRefreshing(true);
      const val = await onRefreshCheckout();
      setServerTotal(Number(val || 0));
    } catch (err) {
      console.log('Error refreshing checkout:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-poll server totals while checkout tab is active or modal open
  React.useEffect(() => {
    if (!onRefreshCheckout) return;
    let interval: any = null;
    if (activeTab === 'checkout' || showCheckoutModal) {
      // initial fetch
      (async () => {
        try {
          const val = await onRefreshCheckout();
          setServerTotal(Number(val || 0));
        } catch (err) {
          console.log('Error initial refresh checkout:', err);
        }
      })();
      interval = setInterval(async () => {
        try {
          const val = await onRefreshCheckout();
          setServerTotal(Number(val || 0));
        } catch (err) {
          console.log('Error poll refresh checkout:', err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, showCheckoutModal, onRefreshCheckout]);

  const displayedServerTotal = typeof serverTotalOverride === 'number' ? serverTotalOverride : serverTotal;

  return (
    <View style={styles.container}>
      {/* Content Area */}
      {activeTab === 'menu' && (
        <MenuScreen
          restaurantId={restaurantId}
          selectedTable={selectedTable}
          onSelectProduct={onSelectProduct}
          onOpenProductModal={onOpenProductModal}
          onBackToTables={onBackToTables}
        />
      )}

      {activeTab === 'tracking' && (
        <OrderTrackingScreen
          restaurantId={restaurantId}
          waiterId={userId}
          tableId={selectedTable.id}
        />
      )}

      {activeTab === 'checkout' && (
        <View style={styles.checkoutContent}>
          <Text style={styles.checkoutTitle}>Cerrar Cuenta</Text>
          <Text style={styles.totalText}>Total: ${(cartTotal + displayedServerTotal).toFixed(2)}</Text>
          <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: '#eee', marginTop: 8 }]} onPress={handleRefreshClick} disabled={!onRefreshCheckout || refreshing}>
            <Text style={{ fontWeight: '700' }}>{refreshing ? 'Actualizando...' : 'Refrescar Totales'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => onShowCheckout(true)}>
            <Text style={styles.checkoutBtnText}>Procesar Pago</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.tabActive]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.tabText, activeTab === 'menu' && styles.tabTextActive]}>
            Menu
          </Text>
          {cartItems.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'tracking' && styles.tabActive]}
          onPress={() => setActiveTab('tracking')}
        >
          <Text style={[styles.tabText, activeTab === 'tracking' && styles.tabTextActive]}>
            Seguimiento
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'checkout' && styles.tabActive]}
          onPress={() => setActiveTab('checkout')}
        >
          <Text style={[styles.tabText, activeTab === 'checkout' && styles.tabTextActive]}>
            Cierre
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
        <CheckoutModal
          visible={showCheckoutModal}
          cartTotal={cartTotal}
          selectedTable={selectedTable?.table_number || 0}
          onClose={() => onShowCheckout(false)}
          onConfirm={onConfirmPay}
          onRefresh={onRefreshCheckout}
          serverTotal={displayedServerTotal}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  checkoutContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  checkoutTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 20 },
  totalText: { fontSize: 28, fontWeight: 'bold', color: COLORS.buttonGreen, marginBottom: 30 },
  checkoutBtn: { backgroundColor: COLORS.buttonGreen, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12 },
  checkoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.surface, borderTopColor: COLORS.border, borderTopWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabActive: { borderTopColor: COLORS.primary, borderTopWidth: 3 },
  tabText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  badge: { position: 'absolute', top: 6, right: 8, backgroundColor: COLORS.buttonRed, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
