import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../constants/colors';

const PRODUCTS = [
  { 
    id: '1', 
    name: 'Hamburguesa Smash Doble', 
    desc: 'Doble carne angus', 
    price: 149, 
    emoji: '🍔',
    customizations: [
      { title: 'Tipo de queso', required: true, options: [
        { name: 'Americano', price: 0 },
        { name: 'Cheddar', price: 20 },
        { name: 'Cabra', price: 35 },
        { name: 'Monterrey', price: 20 },
      ]},
      { title: 'Extras', required: false, options: [
        { name: 'Tocino', price: 25 },
        { name: 'Aguacate', price: 30 },
        { name: 'Jalapeños', price: 10 },
        { name: 'Huevo', price: 20 },
      ]},
    ]
  },
  { 
    id: '2', 
    name: 'Pizza Hawaiiana', 
    desc: 'Piña asada, jamón', 
    price: 129, 
    emoji: '🍍',
    customizations: [
      { title: 'Tipo de queso', required: true, options: [
        { name: 'Americano', price: 0 },
        { name: 'Cheddar', price: 20 },
        { name: 'Mozzarella', price: 15 },
      ]},
      { title: 'Extras', required: false, options: [
        { name: 'Piña extra', price: 15 },
        { name: 'Jamón extra', price: 25 },
        { name: 'Cebolla', price: 5 },
      ]},
    ]
  },
  { 
    id: '3', 
    name: 'Crispy Chicken', 
    desc: 'Pollo crujiente', 
    price: 119, 
    emoji: '🐔',
    customizations: [
      { title: 'Salsa', required: true, options: [
        { name: 'Ranch', price: 0 },
        { name: 'BBQ', price: 0 },
        { name: 'Búfalo', price: 0 },
      ]},
      { title: 'Extras', required: false, options: [
        { name: 'Queso', price: 15 },
        { name: 'Bacon', price: 20 },
        { name: 'Cebolla caramelizada', price: 12 },
      ]},
    ]
  },
  { 
    id: '4', 
    name: 'Champiñones', 
    desc: 'Aceite de trufa', 
    price: 159, 
    emoji: '🍄',
    customizations: [
      { title: 'Tipo de queso', required: true, options: [
        { name: 'Americano', price: 0 },
        { name: 'Brie', price: 40 },
        { name: 'Gouda', price: 25 },
      ]},
      { title: 'Extras', required: false, options: [
        { name: 'Champiñones extra', price: 20 },
        { name: 'Cebolla morada', price: 8 },
        { name: 'Trufa extra', price: 35 },
      ]},
    ]
  },
  { 
    id: '5', 
    name: 'Alitas Buffalo', 
    desc: '10 pzas con ranch', 
    price: 129, 
    emoji: '🍗',
    customizations: [
      { title: 'Nivel de picante', required: true, options: [
        { name: 'Mild', price: 0 },
        { name: 'Medium', price: 0 },
        { name: 'Hot', price: 0 },
        { name: 'Inferno', price: 0 },
      ]},
      { title: 'Salsas extras', required: false, options: [
        { name: 'Ranch extra', price: 10 },
        { name: 'Bleu Cheese', price: 15 },
        { name: 'Salsa BBQ', price: 8 },
      ]},
    ]
  },
  { 
    id: '6', 
    name: 'Limonada Rosa', 
    desc: 'Frambuesa y menta', 
    price: 55, 
    emoji: '🍋',
    customizations: [
      { title: 'Tamaño', required: true, options: [
        { name: 'Pequeño (250ml)', price: 0 },
        { name: 'Mediano (400ml)', price: 15 },
        { name: 'Grande (600ml)', price: 25 },
      ]},
      { title: 'Extras', required: false, options: [
        { name: 'Sin hielo', price: 0 },
        { name: 'Hielo extra', price: 0 },
        { name: 'Menta extra', price: 5 },
      ]},
    ]
  },
];

const CATEGORIES = ['Todo', 'Burgers', 'Bebidas', 'Entradas', 'Postres', 'Promos'];

interface MenuScreenProps {
  onSelectProduct: (product: any) => void;
  onOpenProductModal: (visible: boolean) => void;
  onChangeScreen: (screen: string) => void;
  selectedTable: number;
  onSetTable: (table: number) => void;
  tableOrders: any;
  lastOrderData: any;
  onCancelOrder: () => void;
  onCheckout: () => void;
}

export default function MenuScreen({ 
  onSelectProduct, 
  onOpenProductModal, 
  onChangeScreen,
  selectedTable,
  onSetTable,
  tableOrders,
  lastOrderData,
  onCancelOrder,
  onCheckout
}: MenuScreenProps) {
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleProductPress = (product: any) => {
    onSelectProduct(product);
    onOpenProductModal(true);
  };

  const handleRepeatOrder = () => {
    if (lastOrderData) {
      // Would repeat the last order with same customizations
      setShowMenu(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Mesa {selectedTable}</Text>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setShowMenu(true)}>
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.categoriesScroll} showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.category, activeCategory === cat && styles.categoryActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.productGrid}>
          {PRODUCTS.map((product) => (
            <TouchableOpacity 
              key={product.id}
              style={styles.productCard} 
              onPress={() => handleProductPress(product)}
            >
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>{product.emoji}</Text>
              </View>
              <View style={styles.productDot} />
              <View style={styles.productBody}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDesc}>{product.desc}</Text>
              </View>
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>${product.price}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => handleProductPress(product)}>
                  <Text style={styles.addBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Menu Hamburguesa Modal */}
      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Opciones</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleRepeatOrder}>
              <Text style={styles.menuItemIcon}>🔄</Text>
              <Text style={styles.menuItemText}>Repetir última orden</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setShowHistory(true);
              setShowMenu(false);
            }}>
              <Text style={styles.menuItemIcon}>📜</Text>
              <Text style={styles.menuItemText}>Historial de mesa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={onCancelOrder}>
              <Text style={styles.menuItemIcon}>❌</Text>
              <Text style={styles.menuItemText}>Cancelar última orden</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={() => {
              onCheckout();
              setShowMenu(false);
            }}>
              <Text style={styles.menuItemIcon}>💳</Text>
              <Text style={styles.menuItemText}>Cerrar cuenta</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* History Modal */}
      <Modal visible={showHistory} transparent animationType="slide">
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Text style={styles.historyBackBtn}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.historyTitle}>Historial - Mesa {selectedTable}</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <ScrollView style={styles.historyList}>
            {tableOrders[selectedTable]?.history?.length > 0 ? (
              tableOrders[selectedTable].history.map((order: any, idx: number) => (
                <View key={idx} style={styles.historyItem}>
                  <Text style={styles.historyTime}>
                    {order.timestamp?.toLocaleTimeString()}
                  </Text>
                  <Text style={styles.historyTotal}>${order.total}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.historyEmpty}>Sin historial</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    paddingTop: 24,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 0.5,
  },
  topbarTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  categoriesScroll: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 0,
    height: 45,
  },
  category: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 36,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
    borderColor: COLORS.border,
    borderWidth: 0.5,
    marginRight: 8,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryActive: {
    backgroundColor: 'rgba(255, 107, 44, 0.15)',
    borderColor: 'rgba(255, 107, 44, 0.4)',
  },
  categoryText: {
    color: '#888',
    fontSize: 12,
  },
  categoryTextActive: {
    color: COLORS.primary,
  },
  content: {
    backgroundColor: COLORS.background,
  },
  productGrid: {
    paddingHorizontal: 7,
    paddingVertical: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
    borderWidth: 0.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  productImage: {
    height: 110,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: {
    fontSize: 56,
  },
  productDot: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  productBody: {
    padding: 8,
  },
  productName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  productDesc: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  productPrice: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  menu: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingTop: 20,
    minWidth: 250,
    maxWidth: 300,
  },
  menuTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    gap: 12,
  },
  menuItemDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 0.5,
  },
  historyBackBtn: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  historyTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  historyTime: {
    color: '#888',
    fontSize: 12,
  },
  historyTotal: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  historyEmpty: {
    color: '#666',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 20,
  },
});
