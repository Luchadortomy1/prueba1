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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleAddToCart = (qty, price) => {
    setCartCount(cartCount + qty);
    setCartTotal(cartTotal + price * qty);
  };

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleConfirmPay = () => {
    setCartCount(0);
    setCartTotal(0);
    setShowCheckoutModal(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Pantalla actual */}
      {currentScreen === 'menu' && <MenuScreen onSelectProduct={setSelectedProduct} onOpenProductModal={setShowProductModal} onChangeScreen={setCurrentScreen} />}
      {currentScreen === 'tables' && <TablesScreen onChangeScreen={setCurrentScreen} />}
      {currentScreen === 'kitchen' && <KitchenScreen onChangeScreen={setCurrentScreen} />}
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
        cartTotal={cartTotal}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={handleConfirmPay}
      />

      {/* Order Bar - Vista previa del carrito */}
      {cartCount > 0 && (
        <TouchableOpacity 
          style={styles.orderBar}
          onPress={handleCheckout}
        >
          <View style={styles.orderBarBadge}>
            <Text style={styles.orderBarBadgeText}>{cartCount}</Text>
          </View>
          <Text style={styles.orderBarLabel}>Ver orden · Mesa 3</Text>
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
