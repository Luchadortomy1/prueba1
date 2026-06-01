import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import MenuScreen from './MenuScreen';
import OrderTrackingScreen from './OrderTrackingScreen';
import CheckoutModal from '../modals/CheckoutModal';
import { getProductOptions } from '../services/productService';
import { getOrdersByTable } from '../services/orderService';

interface WaiterDashboardProps {
  restaurantId: string;
  userId: string;
  selectedTable: any;
  cartItems: any[];
  cartTotal: number;
  onSelectProduct: (product: any) => void;
  onOpenProductModal: (visible: boolean) => void;
  onAddToCart: (
    qty: number,
    price: number,
    productName?: string,
    customizationText?: string,
    selectedOptionIds?: string[],
    optionAdjustments?: { option_id: string; price_adjustment: number }[]
  ) => void;
  onRemoveFromCart: (itemId: string) => void;
  onSendOrder: () => void;
  onShowCheckout: (visible: boolean) => void;
  showCheckoutModal: boolean;
  onConfirmPay: () => void;
  onBackToTables: () => void;
  onRefreshCheckout?: () => Promise<number>;
  serverTotalOverride?: number;
  sessionStart?: string;
}

export default function WaiterDashboard(props: Readonly<WaiterDashboardProps>) {
  const {
    restaurantId,
    userId,
    selectedTable,
    cartItems,
    onSelectProduct,
    onOpenProductModal,
    onAddToCart,
    onShowCheckout,
    showCheckoutModal,
    onConfirmPay,
    onBackToTables,
    sessionStart,
  } = props;
  const [activeTab, setActiveTab] = React.useState<'menu' | 'tracking' | 'checkout'>('menu');
  const [checkoutOrders, setCheckoutOrders] = React.useState<any[]>([]);
  const [loadingCheckout, setLoadingCheckout] = React.useState(false);

  const sessionTotal = React.useMemo(
    () => checkoutOrders.reduce((sum: number, ord: any) => sum + Number(ord.total_amount || 0), 0),
    [checkoutOrders]
  );

  const loadCheckoutOrders = React.useCallback(async () => {
    setLoadingCheckout(true);
    try {
      const orders = await getOrdersByTable(selectedTable.id, true, sessionStart);
      setCheckoutOrders(orders);
    } catch (err) {
      console.log('Error loading checkout orders:', err);
    } finally {
      setLoadingCheckout(false);
    }
  }, [selectedTable, sessionStart]);

  React.useEffect(() => {
    if (activeTab === 'checkout') {
      loadCheckoutOrders();
    }
  }, [activeTab, loadCheckoutOrders]);

  const handleQuickAdd = async (product: any) => {
    try {
      const options = await getProductOptions(product.id);
      const defaultOpts = options.filter(opt => opt.type === 'default');
      const selectedOptionIds = defaultOpts.map(opt => opt.id as string);
      const optionAdjustments = defaultOpts.map(opt => ({
        option_id: opt.id as string,
        price_adjustment: Number(opt.price_modifier || 0),
      }));
      const customizationText = defaultOpts.map(opt => opt.name).join(', ');
      onAddToCart(1, product.base_price, product.name, customizationText, selectedOptionIds, optionAdjustments);
    } catch (err) {
      console.log('Error en quick add:', err);
    }
  };

  return (
    <View style={styles.container}>
      {activeTab === 'menu' && (
        <MenuScreen
          restaurantId={restaurantId}
          selectedTable={selectedTable}
          onSelectProduct={onSelectProduct}
          onOpenProductModal={onOpenProductModal}
          onBackToTables={onBackToTables}
          onQuickAdd={handleQuickAdd}
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
        <ScrollView style={styles.checkoutScroll} contentContainerStyle={styles.checkoutScrollContent}>
          <View style={styles.checkoutHeader}>
            <Text style={styles.checkoutTitle}>Cierre de Cuenta</Text>
            <Text style={styles.checkoutSubtitle}>Mesa {selectedTable.table_number}</Text>
          </View>

          <View style={styles.checkoutSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.checkoutSectionTitle}>Pedidos de esta sesión</Text>
              <TouchableOpacity onPress={loadCheckoutOrders} disabled={loadingCheckout}>
                <Text style={styles.refreshText}>{loadingCheckout ? '...' : '↺ Actualizar'}</Text>
              </TouchableOpacity>
            </View>

            {loadingCheckout ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : checkoutOrders.length === 0 ? (
              <Text style={styles.emptyCheckout}>No hay pedidos registrados en esta sesión</Text>
            ) : (
              checkoutOrders.map((order: any) => (
                <View key={order.id} style={styles.orderBlock}>
                  <Text style={styles.orderTimeLabel}>
                    Pedido · {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {(order.order_items || []).map((item: any) => (
                    <View key={item.id} style={styles.itemLine}>
                      <Text style={styles.itemLineName} numberOfLines={1}>
                        {item.products?.name || 'Producto'}  ×{item.quantity}
                      </Text>
                      <Text style={styles.itemLinePrice}>${Number(item.subtotal || 0).toFixed(2)}</Text>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>

          <View style={styles.checkoutTotalBlock}>
            <Text style={styles.checkoutTotalLabel}>Total a Cobrar</Text>
            <Text style={styles.checkoutTotalValue}>${sessionTotal.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.payButton}
            onPress={() => onShowCheckout(true)}
          >
            <Text style={styles.payButtonText}>Procesar Pago</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.tabActive]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.tabText, activeTab === 'menu' && styles.tabTextActive]}>
            Menú
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

      <CheckoutModal
        visible={showCheckoutModal}
        selectedTable={selectedTable?.table_number || 0}
        onClose={() => onShowCheckout(false)}
        onConfirm={onConfirmPay}
        sessionTotal={sessionTotal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  /* Checkout tab */
  checkoutScroll: { flex: 1 },
  checkoutScrollContent: { padding: 16, gap: 14 },
  checkoutHeader: { alignItems: 'center', paddingVertical: 8 },
  checkoutTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
  checkoutSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  checkoutSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkoutSectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  refreshText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  emptyCheckout: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
  },
  orderBlock: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderTimeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  itemLineName: { flex: 1, fontSize: 13, color: COLORS.textPrimary, marginRight: 8 },
  itemLinePrice: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  checkoutTotalBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkoutTotalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  checkoutTotalValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.buttonGreen },
  payButton: {
    backgroundColor: COLORS.buttonGreen,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  /* Tab bar */
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.surface, borderTopColor: COLORS.border, borderTopWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabActive: { borderTopColor: COLORS.primary, borderTopWidth: 3 },
  tabText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  badge: { position: 'absolute', top: 6, right: 8, backgroundColor: COLORS.buttonRed, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
