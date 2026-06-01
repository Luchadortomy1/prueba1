import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './constants/colors';
import LoginScreen from './screens/LoginScreen';
import AdminPanel from './screens/AdminPanel';
import WaiterScreen from './screens/WaiterScreen';
import WaiterDashboard from './screens/WaiterDashboard';
import KitchenScreen from './screens/KitchenScreen';
import ProductModal from './modals/ProductModal';
import OrderDetailModal from './modals/OrderDetailModal';
import { getProductOptions } from './services/productService';
import { supabase } from './services/supabaseClient';
import { getOrdersByTable } from './services/orderService';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'waiter' | 'kitchen';
  restaurant_id: string;
}

type CartItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  customizationText?: string;
  selectedOptionIds?: string[];
  optionAdjustments?: { option_id: string; price_adjustment: number }[];
};

// eslint-disable-next-line sonarjs/cognitive-complexity
async function persistOrderForTable(
  tableId: string,
  restaurantId: string,
  items: CartItem[],
  userId: string
) {
  const itemsToSave = items.map(item => ({
    localId: item.id,
    name: item.name,
    qty: item.qty,
    price: item.price,
    customizationText: item.customizationText || '',
    selectedOptionIds: item.selectedOptionIds || [],
    optionAdjustments: item.optionAdjustments || [],
  }));

  const totalAmount = itemsToSave.reduce((sum, it) => {
    const adjSum = (it.optionAdjustments || []).reduce((a: number, adj: any) => a + Number(adj.price_adjustment || 0), 0);
    return sum + ((it.price + adjSum) * it.qty);
  }, 0);

  const { data: lastOrder, error: lastOrderErr } = await supabase
    .from('orders')
    .select('order_number')
    .eq('restaurant_id', restaurantId)
    .order('order_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastOrderErr) throw lastOrderErr;
  const nextOrderNumber = lastOrder && (lastOrder as any).order_number ? (lastOrder as any).order_number + 1 : 1;

  const { data: orderData, error: orderInsertErr } = await supabase
    .from('orders')
    .insert([{
      restaurant_id: restaurantId,
      table_id: tableId,
      waiter_id: userId,
      order_number: nextOrderNumber,
      status: 'pending',
      total_amount: totalAmount,
    }])
    .select('id')
    .maybeSingle();

  if (orderInsertErr) throw orderInsertErr;
  const orderId = (orderData as any).id;

  for (const it of itemsToSave) {
    const { data: prod, error: prodErr } = await supabase
      .from('products')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('name', it.name)
      .maybeSingle();

    if (prodErr || !prod) {
      throw new Error(`Producto no encontrado en la base de datos: ${it.name}`);
    }

    const itemAdjSum = (it.optionAdjustments || []).reduce((a: number, adj: any) => a + Number(adj.price_adjustment || 0), 0);
    const unitPriceWithAdj = Number((it.price + itemAdjSum).toFixed(2));
    const subtotalWithAdj = Number((unitPriceWithAdj * it.qty).toFixed(2));

    const { data: insertedItem, error: insertItemErr } = await supabase
      .from('order_items')
      .insert([{
        order_id: orderId,
        product_id: (prod as any).id,
        quantity: it.qty,
        unit_price: unitPriceWithAdj,
        subtotal: subtotalWithAdj,
      }])
      .select('id')
      .maybeSingle();

    if (insertItemErr || !insertedItem) {
      throw insertItemErr || new Error('No se pudo insertar order_item');
    }

    const orderItemId = (insertedItem as any).id;

    if (it.optionAdjustments && it.optionAdjustments.length > 0) {
      const customRows: any[] = [];
      for (const adj of it.optionAdjustments) {
        const { data: optRow } = await supabase
          .from('product_options')
          .select('name')
          .eq('id', adj.option_id)
          .maybeSingle();

        customRows.push({
          order_item_id: orderItemId,
          option_id: adj.option_id,
          selected_value: optRow?.name || null,
          price_adjustment: Number(adj.price_adjustment || 0),
        });
      }

      const { error: customErr } = await supabase
        .from('order_item_customizations')
        .insert(customRows);

      if (customErr) throw customErr;
    }
  }

  const itemNotes = itemsToSave
    .map(it => it.customizationText?.trim())
    .filter((text): text is string => Boolean(text))
    .join(' | ');

  if (itemNotes) {
    const { error: notesErr } = await supabase
      .from('orders')
      .update({ notes: itemNotes })
      .eq('id', orderId);

    if (notesErr && String(notesErr.code) !== '42703') {
      console.warn('No se pudo guardar notes en order:', notesErr);
    }
  }

  return { orderId, totalAmount };
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [tablesRefreshKey, setTablesRefreshKey] = useState(0);
  const [tableCartItems, setTableCartItems] = useState<{ [key: number]: any[] }>({});
  const [tableOrders, setTableOrders] = useState<{ [key: number]: { items: any[], history: any[] } }>({});
  const [tableServerTotals, setTableServerTotals] = useState<{ [key: number]: number }>({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductOptions, setSelectedProductOptions] = useState<any[]>([]);

  const handleSelectProduct = async (product: any) => {
    setSelectedProduct(product);
    const options = await getProductOptions(product.id);
    setSelectedProductOptions(options);
  };

  const initializeTable = (tableId: string, tableNumber: number) => {
    // Reset cart and orders for the table every time a table is initialized
    setTableCartItems(prev => ({ ...prev, [tableNumber]: [] }));
    setTableOrders(prev => ({ ...prev, [tableNumber]: { items: [], history: [] } }));
    setSelectedTable({ id: tableId, table_number: tableNumber });
  };

  const cartItems = selectedTable ? (tableCartItems[selectedTable.table_number] || []) : [];
  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleAddToCart = (
    qty: number,
    price: number,
    productName: string = '',
    customizationText: string = '',
    selectedOptionIds: string[] = [],
    optionAdjustments: { option_id: string; price_adjustment: number }[] = []
  ) => {
    if (!selectedTable) return;
    const itemId = `${productName}-${Date.now()}`;
    const newItem = {
      id: itemId,
      name: productName,
      qty,
      price,
      customizationText,
      selectedOptionIds,
      optionAdjustments,
    };
    const tableNum = selectedTable.table_number;
    const updatedCartItems = [...(tableCartItems[tableNum] || []), newItem];
    setTableCartItems({ ...tableCartItems, [tableNum]: updatedCartItems });
  };

  const handleRemoveFromCart = (itemId: string) => {
    if (!selectedTable) return;
    const tableNum = selectedTable.table_number;
    const updatedCartItems = cartItems.filter(item => item.id !== itemId);
    setTableCartItems({ ...tableCartItems, [tableNum]: updatedCartItems });
  };

  const handleSendOrder = async () => {
    if (cartItems.length === 0 || !selectedTable || !user) return;

    try {
      await persistOrderForTable(
        selectedTable.id,
        user.restaurant_id,
        cartItems,
        user.id
      );


      // Limpiar carrito local
      setTableCartItems({ ...tableCartItems, [selectedTable.table_number]: [] });
      setShowOrderDetailModal(false);

      // Update server total cache for this table so totals appear immediately
      try {
        const refreshed = await handleRefreshCheckout();
        setTableServerTotals(prev => ({ ...prev, [selectedTable.table_number]: refreshed }));
      } catch (err) {
        console.log('Error updating server total cache after sendOrder:', err);
      }

      Alert.alert('Éxito', `Orden enviada a cocina · Mesa ${selectedTable.table_number}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo enviar la orden');
      console.log('Error sending order:', err);
    }
  };

  const handleRefreshCheckout = async (): Promise<number> => {
    if (!selectedTable) return 0;
    try {
      const orders = await getOrdersByTable(selectedTable.id);
      const aggregatedTotal = (orders || []).reduce((s: number, ord: any) => {
        const ordTotal = ord.total_amount ?? (ord.items?.reduce((ss: number, it: any) => ss + (it.subtotal || (it.unit_price * it.quantity)), 0) || 0);
        return s + Number(ordTotal || 0);
      }, 0);
      return aggregatedTotal;
    } catch (err) {
      console.log('Error refreshing checkout totals:', err);
      return 0;
    }
  };

  const handleConfirmPay = async () => {
    if (!selectedTable || !user) return;
    const tableNum = selectedTable.table_number;
    try {
      // Get active (non-completed) orders for this session
      const activeOrders = await getOrdersByTable(selectedTable.id);
      
      // Block payment if there are active orders (they must be ready/completed first)
      if ((activeOrders || []).length > 0) {
        Alert.alert('Atención', 'No se puede cobrar hasta que todos los pedidos estén listos.');
        return;
      }

      // Get all orders from current session (completed ones)
      const sessionOrders = await getOrdersByTable(selectedTable.id, true);
      const sessionTotal = (sessionOrders || []).reduce((s: number, ord: any) => {
        const ordTotal = ord.total_amount ?? (ord.order_items?.reduce((ss: number, it: any) => ss + (it.subtotal || (it.unit_price * it.quantity)), 0) || 0);
        return s + Number(ordTotal || 0);
      }, 0);

      const itemsCount = (sessionOrders || []).reduce((sum: number, ord: any) => sum + ((ord.order_items || []).length || 0), 0);

      // Insert one history row for the closed account session
      try {
        const nowUTC = new Date().toISOString();
        await supabase.from('order_history').insert([
          {
            restaurant_id: user.restaurant_id,
            table_id: selectedTable.id,
            order_id: null,
            total_amount: sessionTotal,
            payment_method: 'cash',
            items_count: itemsCount,
            completed_at: nowUTC,
          },
        ]);
      } catch (historyErr) {
        console.log('Error inserting account history:', historyErr);
      }

      // Try to mark table as free in DB
      try {
        const { error: tableErr } = await supabase
          .from('tables')
          .update({ status: 'free' })
          .eq('id', selectedTable.id);
        if (tableErr) console.warn('No se pudo liberar mesa en BD:', tableErr);
      } catch (err) {
        console.log('Error liberando mesa:', err);
      }

      // Clear local state
      setTableOrders({ ...tableOrders, [tableNum]: { items: [], history: [] } });
      setTableCartItems({ ...tableCartItems, [tableNum]: [] });

      // Clear cached server total for the table
      setTableServerTotals(prev => ({ ...prev, [tableNum]: 0 }));

      // Force reload tables
      setTablesRefreshKey(k => k + 1);
      setShowCheckoutModal(false);
      setSelectedTable(null);
      alert(`Cuenta cerrada · Mesa ${tableNum} · Total: $${sessionTotal.toFixed(2)}`);
    } catch (err: any) {
      console.log('Error during payment:', err);
      Alert.alert('Error', 'No se pudo completar el pago');
    }
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={setUser} />;
  }

  if (user.role === 'admin') {
    return <AdminPanel restaurantId={user.restaurant_id} onLogout={() => setUser(null)} />;
  }

  if (user.role === 'kitchen') {
    return <KitchenScreen restaurantId={user.restaurant_id} onLogout={() => setUser(null)} />;
  }

  if (!selectedTable) {
    return (
      <WaiterScreen
        restaurantId={user.restaurant_id}
        waiterId={user.id}
        onLogout={() => setUser(null)}
        onSelectTable={(table) => initializeTable(table.id, table.table_number)}
        refreshKey={tablesRefreshKey}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} />
      <WaiterDashboard
        restaurantId={user.restaurant_id}
        userId={user.id}
        selectedTable={selectedTable}
        cartItems={cartItems}
        cartTotal={cartTotal}
        onSelectProduct={handleSelectProduct}
        onOpenProductModal={setShowProductModal}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onSendOrder={handleSendOrder}
        onShowCheckout={setShowCheckoutModal}
        showCheckoutModal={showCheckoutModal}
        onConfirmPay={handleConfirmPay}
        onRefreshCheckout={handleRefreshCheckout}
        serverTotalOverride={tableServerTotals[selectedTable.table_number] || 0}
        onBackToTables={() => setSelectedTable(null)}
      />

      <ProductModal 
        visible={showProductModal}
        product={selectedProduct}
        options={selectedProductOptions}
        onClose={() => setShowProductModal(false)}
        onAddToCart={handleAddToCart}
      />

      <OrderDetailModal
        visible={showOrderDetailModal}
        items={cartItems}
        selectedTable={selectedTable?.table_number || 0}
        onClose={() => setShowOrderDetailModal(false)}
        onRemoveItem={handleRemoveFromCart}
        onSendOrder={handleSendOrder}
      />

      {cartCount > 0 && (
        <TouchableOpacity 
          style={styles.orderBar}
          onPress={() => setShowOrderDetailModal(true)}
        >
          <View style={styles.orderBarBadge}>
            <Text style={styles.orderBarBadgeText}>{cartCount}</Text>
          </View>
          <Text style={styles.orderBarLabel}>Orden · Mesa {selectedTable.table_number}</Text>
          <Text style={styles.orderBarTotal}>${cartTotal}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  orderBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, marginHorizontal: 14, marginBottom: 14, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, gap: 10 },
  orderBarBadge: { backgroundColor: 'rgba(0, 0, 0, 0.15)', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8 },
  orderBarBadgeText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: 'bold' },
  orderBarLabel: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  orderBarTotal: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },
});
