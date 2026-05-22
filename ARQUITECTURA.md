# 🏗️ Arquitectura del Sistema

## Diagrama de Flujo Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP.TSX (ROOT)                           │
│  - selectedTable (state)                                          │
│  - tableCartItems (state) {[mesa]: items[]}                      │
│  - tableOrders (state) {[mesa]: { items[], history[] }}          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ MenuScreen   │  │ TablesScreen │  │ KitchenScreen│           │
│  │              │  │              │  │              │           │
│  │ - Products   │  │ - Mesas 1-9  │  │ - Órdenes    │           │
│  │ - Categories │  │ - Selection  │  │ - Estados    │           │
│  │ - Add to cart│  │ - Highlight  │  │ - Workflow   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ProductModal  │  │CheckoutModal │  │OrderDetail   │           │
│  │              │  │              │  │Modal         │           │
│  │- Customiz.   │  │- Pago        │  │- Items view  │           │
│  │- Opciones    │  │- Métodos     │  │- Delete item │           │
│  │- Precio calc │  │- Total IVA   │  │- Send order  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Estado - Per-Table Carts

```
App State:
{
  selectedTable: 3,
  
  tableCartItems: {
    2: [
      { id: "Pizza-123", name: "Pizza", qty: 1, price: 129, customizationText: "Mozzarella, Jamón extra" },
      { id: "Crispy-456", name: "Crispy Chicken", qty: 2, price: 119, customizationText: "Ranch, Bacon" }
    ],
    3: [
      { id: "Smash-789", name: "Smash Doble", qty: 1, price: 169, customizationText: "Cheddar" }
    ],
    5: []  // Mesa 5 sin items
  },
  
  tableOrders: {
    2: {
      items: [
        {
          id: "order-2-1234567890",
          table: 2,
          items: [...items],
          timestamp: 1234567890,
          status: "prep"  // pending | prep | ready | delivered
        }
      ],
      history: [
        { timestamp, items, total, paymentMethod }
      ]
    },
    3: { items: [], history: [] },
    5: { items: [], history: [] }
  }
}
```

## Flujo de un Producto - De Menú a Cocina

```
1. MENÚ SCREEN
   └─ Click en "🍔 Hamburguesa Smash Doble"
      └─ Abre ProductModal

2. PRODUCT MODAL
   ├─ Selecciona "Queso Cheddar"
   ├─ Agrega extras: "Bacon" (+$20)
   ├─ Cantidad: 2
   ├─ Calcula: $149 + $20 = $169 × 2 = $338
   ├─ customizationText: "Queso Cheddar, Bacon"
   └─ Click "Agregar a orden"
      └─ handleAddToCart(2, 169, "Hamburguesa Smash Doble", "Queso Cheddar, Bacon")

3. APP.TSX (handleAddToCart)
   ├─ Crea item: { id, name, qty, price, customizationText }
   ├─ Agrega a: tableCartItems[3].push(item)
   └─ Estado actualiza

4. MENÚ SCREEN (Re-render)
   └─ Barra naranja aparece: "1 Orden · Mesa 3 $338"

5. CLICK EN BARRA → ORDER DETAIL MODAL
   ├─ Muestra: "Hamburguesa Smash Doble - Queso Cheddar, Bacon x2"
   ├─ Precio: $338
   ├─ Subtotal: $338
   ├─ IVA 16%: $54
   └─ Total: $392

6. CLICK "Mandar Orden →"
   └─ handleSendOrder()
      ├─ Crea orden:
      │  {
      │    id: "order-3-timestamp",
      │    table: 3,
      │    items: [...cartItems con status],
      │    timestamp: Date.now(),
      │    status: "pending"
      │  }
      ├─ Agrega a: tableOrders[3].items
      ├─ Limpia: tableCartItems[3] = []
      └─ Alert: "Orden enviada a cocina · Mesa 3"

7. KITCHEN SCREEN
   └─ Re-render detecta nuevo tableOrders
      ├─ Extrae orden de Mesa 3
      ├─ Muestra:
      │  - Mesa 03
      │  - Estado: Pendiente
      │  - Tiempo: 0s
      │  - Items: "Hamburguesa Smash Doble - Queso Cheddar, Bacon x2"
      └─ Botón: "Iniciar preparación"

8. CLICK "Iniciar preparación"
   └─ onUpdateOrderStatus(3, "order-3-timestamp", "prep")
      ├─ App.tsx actualiza orden status
      ├─ Kitchen vuelve a renderizar
      └─ Ahora muestra: "Preparando" con botón "Marcar listo"

9. CLICK "Marcar listo"
   └─ onUpdateOrderStatus(3, "order-3-timestamp", "ready")
      └─ Estado cambia a "ready", muestra "Listo"

10. CLICK "Entregar"
    └─ onUpdateOrderStatus(3, "order-3-timestamp", "delivered")
       └─ Estado cambia a "delivered", muestra "✓ Entregado"
```

## Estructura de Datos - Customizaciones

```
ProductModal:
├─ product.customizations[0]  // Salsa (requerido)
│  ├─ title: "Salsa"
│  ├─ required: true
│  ├─ options: [
│  │  { name: "Ranch", price: 0 },
│  │  { name: "BBQ", price: 0 },
│  │  { name: "Búfalo", price: 0 }
│  │]
│  └─ selectedOptions[0] = 0  // "Ranch"
│
└─ product.customizations[1]  // Extras (opcional)
   ├─ title: "Extras"
   ├─ required: false
   ├─ options: [
   │  { name: "Queso", price: 15 },
   │  { name: "Bacon", price: 20 },
   │  { name: "Cebolla caramelizada", price: 12 }
   │]
   └─ selectedExtras[1] = [0, 1]  // ["Queso", "Bacon"]

Customization Text:
"Queso Cheddar, Bacon"  // Nombre de opciones seleccionadas, no precios
```

## Componentes y Sus Props

### MenuScreen
```typescript
interface MenuScreenProps {
  onSelectProduct: (product) => void;
  onOpenProductModal: (bool) => void;
  onChangeScreen: (screen) => void;
  selectedTable: number;
  onSetTable: (table) => void;
  tableOrders: { [key: number]: any };
  lastOrderData: any;
  onCancelOrder: () => void;
  onCheckout: () => void;
}
```

### ProductModal
```typescript
interface ProductModalProps {
  visible: boolean;
  product: any;
  onClose: () => void;
  onAddToCart: (qty, price, productName, customizationText) => void;
}
```

### OrderDetailModal
```typescript
interface OrderDetailModalProps {
  visible: boolean;
  items: OrderItem[];  // { id, name, qty, price, customizationText }
  selectedTable?: number;
  onClose: () => void;
  onRemoveItem: (itemId) => void;
  onSendOrder: () => void;
}
```

### CheckoutModal
```typescript
interface CheckoutModalProps {
  visible: boolean;
  cartTotal: number;
  selectedTable?: number;
  onClose: () => void;
  onConfirm: () => void;
}
```

### KitchenScreen
```typescript
interface KitchenScreenProps {
  onChangeScreen: (screen) => void;
  tableOrders?: { [key: number]: { items: any[] } };
  onUpdateOrderStatus?: (mesa, orderId, newStatus) => void;
}
```

## Cálculos de Precios

```typescript
// ProductModal - Calcular precio del producto con opciones
let totalPrice = product.price;  // Base: $149

product.customizations.forEach((customization, custIdx) => {
  // Opciones requeridas (ej: Queso)
  if (customization.required && selectedOptions[custIdx]) {
    totalPrice += customization.options[selectedOptions[custIdx]].price;
    // +$0 si Cheddar es gratis, +$5 si extra
  }
  
  // Extras (ej: Bacon, Queso)
  if (!customization.required && selectedExtras[custIdx]) {
    selectedExtras[custIdx].forEach(optIdx => {
      totalPrice += customization.options[optIdx].price;
      // +$20 por Bacon, +$15 por Queso extra
    });
  }
});

finalPrice = totalPrice * qty;
// Ej: ($149 + $5 + $20) × 2 = $348
```

```typescript
// OrderDetailModal - Cálculo de totales
const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
const tax = Math.round(subtotal * 0.16);
const total = subtotal + tax;

// Ej:
// subtotal = $348
// tax = $56  (16% de 348)
// total = $404
```

## Sincronización de Estado

```
App.tsx
  ├─ setTableCartItems({...tableCartItems, [selectedTable]: updatedItems})
  │  └─ Trigger: MenuScreen re-renders
  │     └─ Order bar actualizado
  │        └─ Click → OrderDetailModal abierto
  │           └─ Muestra items del tableCartItems[selectedTable]
  │
  ├─ setTableOrders({...tableOrders, [selectedTable]: { items: [...], history: [...] }})
  │  └─ Trigger: KitchenScreen re-renders
  │     └─ Muestra órdenes de tableOrders[mesa].items
  │
  └─ onUpdateOrderStatus() en KitchenScreen
     └─ Actualiza estado de orden
        └─ KitchenScreen re-renders con nuevo status
```

## Props Drilling Example

```
App.tsx
  └─ <KitchenScreen
       tableOrders={tableOrders}                              // DOWN
       onUpdateOrderStatus={(mesa, orderId, status) => {     // UP
         setTableOrders({ ...tableOrders, [mesa]: {...} })
       }}
     />
       └─ renderOrderCard()
            └─ <TouchableOpacity onPress={() => 
                 onUpdateOrderStatus(order.table, order.id, 'prep')
               }>
```

## Performance Considerations

- ✅ Per-table state prevents unnecessary renders
- ⚠️ No Context API / Redux (acceptable for 5-10 mesas)
- ⚠️ Props drilling (works but could use Context)
- ✅ useMemo in KitchenScreen (flattens orders once)
- ❌ No virtualization (limits to ~50 items max)

---

**Diagrama actualizado**: Sesión actual
**Versión**: 2.0 con Kitchen integrada
