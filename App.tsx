import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Componentes de Pantallas
import MenuScreen from './screens/MenuScreen';
import TablesScreen from './screens/TablesScreen';
import KitchenScreen from './screens/KitchenScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProductModal from './modals/ProductModal';
import CheckoutModal from './modals/CheckoutModal';
import OrderDetailModal from './modals/OrderDetailModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [tableCartItems, setTableCartItems] = useState<{[key: number]: any[]}>({});
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTable, setSelectedTable] = useState(3);
  const [tableOrders, setTableOrders] = useState<{[key: number]: { items: any[], history: any[] }}>({
    3: { items: [], history: [] }
  });
  const [lastOrderData, setLastOrderData] = useState<any>(null);

  const cartItems = tableCartItems[selectedTable] || [];
  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // Calculate checkout total: cart items + orders in kitchen
  const currentTableOrders = tableOrders[selectedTable] || { items: [], history: [] };
  const kitchenTotal = currentTableOrders.items.reduce((sum: number, order: any) => {
    return sum + order.items.reduce((itemSum: number, item: any) => {
      return itemSum + (item.price * item.qty);
    }, 0);
  }, 0);
  
  // Checkout should show total of both cart and kitchen orders
  const checkoutTotal = cartTotal + kitchenTotal;

  const handleAddToCart = (qty: number, price: number, productName: string = '', customizationText: string = '') => {
    const itemId = `${productName}-${Date.now()}`;
    const newItem = {
      id: itemId,
      name: productName,
      qty: qty,
      price: price,
      customizationText: customizationText // e.g., "Cheddar, Sin cebolla"
    };
    
    const updatedCartItems = [...(tableCartItems[selectedTable] || []), newItem];
    setTableCartItems({
      ...tableCartItems,
      [selectedTable]: updatedCartItems
    });
    
    // Store order data for repeat functionality
    if (productName) {
      setLastOrderData({ qty, price, productName, customizationText });
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    const updatedCartItems = cartItems.filter(item => item.id !== itemId);
    setTableCartItems({
      ...tableCartItems,
      [selectedTable]: updatedCartItems
    });
  };

  const handleSendOrder = () => {
    if (cartItems.length === 0) return;
    
    // Add items to table orders with status
    const currentTable = tableOrders[selectedTable] || { items: [], history: [] };
    
    // Create kitchen order with status
    const kitchenOrder = {
      id: `order-${selectedTable}-${Date.now()}`,
      table: selectedTable,
      items: cartItems.map(item => ({
        ...item,
        status: 'pending' // 'pending' | 'prep' | 'ready' | 'delivered'
      })),
      timestamp: Date.now(),
      status: 'pending'
    };
    
    const updatedItems = [...(currentTable.items || []), kitchenOrder];
    
    setTableOrders({
      ...tableOrders,
      [selectedTable]: {
        items: updatedItems,
        history: currentTable.history || []
      }
    });
    
    // Clear cart for this table
    setTableCartItems({
      ...tableCartItems,
      [selectedTable]: []
    });
    setShowOrderDetailModal(false);
    
    // Show confirmation
    alert(`Orden enviada a cocina · Mesa ${selectedTable}`);
  };

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleConfirmPay = () => {
    // Get current table data
    const currentTable = tableOrders[selectedTable] || { items: [], history: [] };
    const newHistory = [...(currentTable.history || [])];
    
    // Calculate total from kitchen orders
    const totalFromOrders = currentTable.items.reduce((sum: number, order: any) => {
      return sum + order.items.reduce((itemSum: number, item: any) => {
        return itemSum + (item.price * item.qty);
      }, 0);
    }, 0);
    
    // Total to save: cart items + kitchen items
    const totalToSave = cartTotal + totalFromOrders;
    
    // Items to save should include both cart items and kitchen orders
    const itemsToSave = [
      ...cartItems,
      ...currentTable.items
    ];
    
    newHistory.push({
      id: `history-${selectedTable}-${Date.now()}`,
      timestamp: Date.now(),
      items: itemsToSave,
      total: totalToSave,
      paymentMethod: 'efectivo'
    });
    
    setTableOrders({
      ...tableOrders,
      [selectedTable]: {
        items: [],
        history: newHistory
      }
    });
    
    setTableCartItems({
      ...tableCartItems,
      [selectedTable]: []
    });
    setShowCheckoutModal(false);
    alert(`Cuenta cerrada · Mesa ${selectedTable}`);
  };

  const handleCancelLastOrder = () => {
    if (cartItems.length > 0) {
      setTableCartItems({
        ...tableCartItems,
        [selectedTable]: []
      });
    }
  };

  const handleRepeatOrder = () => {
    if (!lastOrderData) {
      alert('No hay orden anterior');
      return;
    }
    
    // Add the last order data to cart
    handleAddToCart(
      lastOrderData.qty,
      lastOrderData.price,
      lastOrderData.productName,
      lastOrderData.customizationText
    );
    alert(`Orden de ${lastOrderData.productName} agregada`);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} />
      
      {/* Pantalla actual */}
      {currentScreen === 'menu' && <MenuScreen 
        onSelectProduct={setSelectedProduct} 
        onOpenProductModal={setShowProductModal} 
        onChangeScreen={setCurrentScreen}
        selectedTable={selectedTable}
        onSetTable={setSelectedTable}
        tableOrders={tableOrders}
        lastOrderData={lastOrderData}
        onCancelOrder={handleCancelLastOrder}
        onCheckout={handleCheckout}
        onRepeatOrder={handleRepeatOrder}
      />}
      {currentScreen === 'tables' && <TablesScreen 
        onChangeScreen={setCurrentScreen}
        selectedTable={selectedTable}
        onSelectTable={setSelectedTable}
      />}
      {currentScreen === 'kitchen' && <KitchenScreen 
        onChangeScreen={setCurrentScreen}
        tableOrders={tableOrders}
        onUpdateOrderStatus={(mesa, orderId, newStatus) => {
          const currentTable = tableOrders[mesa] || { items: [], history: [] };
          const updatedItems = currentTable.items.map((order: any) => 
            order.id === orderId ? { ...order, status: newStatus } : order
          );
          setTableOrders({
            ...tableOrders,
            [mesa]: {
              ...currentTable,
              items: updatedItems
            }
          });
        }}
      />}
      {currentScreen === 'dashboard' && <DashboardScreen onChangeScreen={setCurrentScreen} />}

      {/* Modales */}
      <ProductModal 
        visible={showProductModal} 
        product={selectedProduct} 
        onClose={() => setShowProductModal(false)}
        onAddToCart={handleAddToCart}
      />

      <CheckoutModal
        visible={showCheckoutModal}
        cartTotal={checkoutTotal}
        selectedTable={selectedTable}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={handleConfirmPay}
      />

      <OrderDetailModal
        visible={showOrderDetailModal}
        items={cartItems}
        selectedTable={selectedTable}
        onClose={() => setShowOrderDetailModal(false)}
        onRemoveItem={handleRemoveFromCart}
        onSendOrder={handleSendOrder}
      />

      {/* Order Bar - Vista previa del carrito */}
      {cartCount > 0 && (
        <TouchableOpacity 
          style={styles.orderBar}
          onPress={() => setShowOrderDetailModal(true)}
        >
          <View style={styles.orderBarBadge}>
            <Text style={styles.orderBarBadgeText}>{cartCount}</Text>
          </View>
          <Text style={styles.orderBarLabel}>Orden · Mesa {selectedTable}</Text>
          <Text style={styles.orderBarTotal}>${cartTotal}</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, currentScreen === 'menu' && styles.navItemActive]}
          onPress={() => setCurrentScreen('menu')}
        >
          <Text style={styles.navItemIcon}>🍽</Text>
          <Text style={[styles.navItemText, currentScreen === 'menu' && styles.navItemTextActive]}>Menú</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, currentScreen === 'tables' && styles.navItemActive]}
          onPress={() => setCurrentScreen('tables')}
        >
          <Text style={styles.navItemIcon}>📋</Text>
          <Text style={[styles.navItemText, currentScreen === 'tables' && styles.navItemTextActive]}>Mesas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, currentScreen === 'kitchen' && styles.navItemActive]}
          onPress={() => setCurrentScreen('kitchen')}
        >
          <Text style={styles.navItemIcon}>🔥</Text>
          <Text style={[styles.navItemText, currentScreen === 'kitchen' && styles.navItemTextActive]}>Cocina</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, currentScreen === 'dashboard' && styles.navItemActive]}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <Text style={styles.navItemIcon}>📊</Text>
          <Text style={[styles.navItemText, currentScreen === 'dashboard' && styles.navItemTextActive]}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  orderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b2c',
    marginHorizontal: 14,
    marginBottom: 70,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 10,
  },
  orderBarBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  orderBarBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  orderBarLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  orderBarTotal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderTopColor: '#2a2a2a',
    borderTopWidth: 0.5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  navItemActive: {},
  navItemIcon: {
    fontSize: 20,
  },
  navItemText: {
    color: '#555',
    fontSize: 9,
  },
  navItemTextActive: {
    color: '#ff6b2c',
  },
});
