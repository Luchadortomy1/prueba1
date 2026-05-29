# 🏗️ Arquitectura - App v3 con Supabase + Multi-Role

## 📊 Estructura de Base de Datos

### Tablas Principales

```
restaurants (id, name)
    ↓
users (id, username, password, role: 'admin'|'waiter', restaurant_id)
    ↓
products (id, name, base_price, emoji, restaurant_id)
    ├─ product_options (id, product_id, name: "Lechuga", type: 'quantity'|'selection', is_default)
    │  └─ option_values (id, option_id, value: "little"|"medium"|"lots", label: "Poco"|"Medio"|"Mucho")
    ↓
tables (id, table_number, status: 'free'|'occupied', restaurant_id)
    ↓
orders (id, table_id, status: 'pending'|'in_progress'|'ready'|'completed')
    ├─ order_items (id, order_id, product_id, quantity, status)
    │  └─ order_item_customizations (id, order_item_id, option_id, selected_value)
    ↓
order_history (registro de cuentas cerradas)
```

### Flujo de Datos

```
ADMIN CREA PRODUCTO:
┌─────────────────────────────────────┐
│ Hamburguesa Clásica - $149          │
├─────────────────────────────────────┤
│ Opciones:                           │
│ ✓ Pan (default)                     │
│ ✓ Carne (default)                   │
│ ✓ Lechuga (default, quantity)       │
│ ✓ Tomate (default, quantity)        │
│ ✓ Queso (default, selection)        │
│ ✗ Mayonesa (default: no)            │
└─────────────────────────────────────┘

MESERO TOMA ORDEN:
1. Abre producto → Ve todas las opciones CON SUS DEFAULTS YA SELECCIONADOS
2. Puede quitar o modificar:
   - Lechuga: ▼ Poco | Medio | Mucho (default: Medio)
   - Queso: ☐ Agregar | ☑ Agregar (default: si)
3. Confirma → Se manda a cocina

COCINA VE:
- Hamburguesa (con lo que pidió el cliente)
  └─ Pan, Carne, Lechuga (medio), Tomate, Queso, NO mayonesa

MESERO CIERRA CUENTA:
- Todo lo que se pidió queda registrado en historial
```

---

## 🎮 Flujos de Usuario

### 1️⃣ ADMIN (123456)

```
LOGIN (123456)
  ↓
ADMIN PANEL
  ├─ 📝 Agregar Producto
  │   ├─ Nombre: "Hamburguesa Clásica"
  │   ├─ Precio base: $149
  │   ├─ Emoji: 🍔
  │   └─ Opciones:
  │       ├─ Pan
  │       │   └─ Type: "selection"
  │       │   └─ Default: ✓
  │       │   └─ Precio +: $0
  │       ├─ Carne
  │       │   └─ Type: "selection"
  │       │   └─ Default: ✓
  │       │   └─ Precio +: $0
  │       ├─ Lechuga
  │       │   └─ Type: "quantity"
  │       │   └─ Default: ✓
  │       │   └─ Valores: Poco, Medio, Mucho
  │       │   └─ Default value: "Medio"
  │       ├─ Queso
  │       │   └─ Type: "selection"
  │       │   └─ Default: ✓
  │       │   └─ Precio +: $15
  │       └─ Mayonesa
  │           └─ Type: "selection"
  │           └─ Default: ✗ (NO viene de default)
  │           └─ Precio +: $5
  │
  ├─ 📋 Ver Productos
  │   └─ Lista de todos los productos
  │   └─ Botón editar/eliminar
  │
  ├─ 📊 Reportes (opcional)
  │   └─ Ventas por día/semana/mes
  │   └─ Productos más vendidos
  │
  └─ 👤 Perfil
      └─ Cambiar contraseña
      └─ Logout
```

### 2️⃣ MESERO (654321)

```
LOGIN (654321)
  ↓
LISTA DE MESAS
  ├─ Mesa 1 (Libre - gris)
  ├─ Mesa 2 (Ocupada - naranja)
  │   └─ Click → Ver orden actual
  ├─ Mesa 3 (Ocupada - naranja)
  │   └─ Click → Ver orden actual
  └─ Mesa 4 (Libre - gris)

CLICK MESA OCUPADA:
  ├─ Ver orden actual
  ├─ Botones:
  │   ├─ ➕ Agregar producto
  │   ├─ 🔄 Repetir último
  │   ├─ ❌ Eliminar item
  │   └─ 💳 Cerrar cuenta

CLICK MESA LIBRE → SELECCIONAR MESA:
  ├─ "¿Cuántos comensales?"
  ├─ [1] [2] [3] [4] [5] [6] [8]
  └─ Click → Mesa marcada como ocupada

AGREGAR PRODUCTO:
  ├─ Menú (Hamburguesa, Pizza, etc.)
  ├─ Click Hamburguesa
  │   ├─ Ver producto CON OPCIONES YA SELECCIONADAS
  │   ├─ Lechuga: [Poco] [Medio] ✓ [Mucho]
  │   ├─ Tomate: [Poco] [Medio] ✓ [Mucho]
  │   ├─ Queso: ☑ Agregar (marcado por default)
  │   ├─ Mayonesa: ☐ Agregar (no marcado)
  │   ├─ Cantidad: [1]
  │   └─ ✓ Agregar a orden

CERRAR CUENTA:
  ├─ Ver total
  ├─ Seleccionar método: 💵 Efectivo | 💳 Tarjeta
  └─ Confirmar → Cuenta cerrada + historial

VER HISTORIAL:
  ├─ Click en una venta
  ├─ Ver detalles:
  │   ├─ Hora
  │   ├─ Qué se pidió
  │   ├─ Customizaciones
  │   └─ Total
  └─ Volver
```

### 3️⃣ COCINA (Nueva pantalla simplificada)

```
COCINA SCREEN
  └─ Lista de órdenes pendientes
      ├─ Mesa 2 - Hamburguesa x2, Pizza x1
      │   ├─ [Recibido] → cambia a...
      │   └─ Status: PENDING
      │
      ├─ Mesa 3 - Crispy Chicken x1
      │   ├─ [Haciéndolo] → cambia a...
      │   └─ Status: IN_PROGRESS
      │
      └─ Mesa 5 - Limonada x2
          ├─ [Terminado] → cambia a...
          └─ Status: READY

      Botones para cada orden:
      ┌──────────────────────┐
      │ [Recibido] [Haciendo] [Terminado] │
      └──────────────────────┘

      Las órdenes con status = READY desaparecen o se mueven a un lado
```

---

## 📁 Estructura de Carpetas - App Actualizada

```
prueba1/
├── screens/
│   ├── LoginScreen.tsx          (NEW - seleccionar rol)
│   ├── AdminPanel.tsx            (NEW - agregar productos)
│   ├── ProductEditorScreen.tsx   (NEW - editar opciones detalladas)
│   ├── WaiterScreen.tsx          (NEW - lista de mesas)
│   ├── WaiterOrderScreen.tsx     (NEW - tomar orden de una mesa)
│   ├── KitchenScreen.tsx         (MODIFIED - solo 3 botones)
│   ├── MenuScreen.tsx            (MODIFIED - obtener de Supabase)
│   ├── TablesScreen.tsx          (KEEP - similar)
│   └── DashboardScreen.tsx       (KEEP - similar)
│
├── modals/
│   ├── ProductModal.tsx          (MODIFIED - usar datos de Supabase)
│   ├── CheckoutModal.tsx         (KEEP)
│   ├── OrderDetailModal.tsx      (KEEP)
│   ├── HistoryDetailModal.tsx    (KEEP)
│   ├── ProductOptionEditorModal.tsx (NEW - agregar opciones)
│   └── TableSelectorModal.tsx    (NEW - seleccionar comensales)
│
├── services/
│   ├── supabaseClient.ts         (NEW - conexión Supabase)
│   ├── authService.ts            (NEW - login/logout)
│   ├── productService.ts         (NEW - CRUD productos)
│   └── orderService.ts           (NEW - CRUD órdenes)
│
├── constants/
│   ├── colors.ts                 (KEEP)
│   └── config.ts                 (NEW - URL Supabase, keys, etc.)
│
├── types/
│   ├── index.ts                  (NEW - interfaces TypeScript)
│   └── database.ts               (NEW - tipos de Supabase)
│
└── App.tsx                        (MODIFIED - agregar login + role-based routing)
```

---

## 🔐 Flujo de Autenticación

```
LOGIN SCREEN
├─ Input: contraseña
├─ Si "123456" → Rol: ADMIN
├─ Si "654321" → Rol: WAITER
├─ Otro → Error
└─ Guardar en estado global (Context API o Zustand)

APP.tsx verifica:
├─ Si no autenticado → LoginScreen
├─ Si role === 'admin' → AdminPanel
├─ Si role === 'waiter' → WaiterScreen
└─ Si role === 'kitchen' → KitchenScreen (opcional, en otra app)
```

---

## 🗄️ Ejemplo de Datos en Supabase

### Producto Hamburguesa
```json
{
  "id": "uuid-1",
  "name": "Hamburguesa Clásica",
  "base_price": 149,
  "emoji": "🍔",
  "restaurant_id": "uuid-resto",
  
  "options": [
    {
      "id": "opt-1",
      "name": "Pan",
      "type": "selection",
      "is_default": true,
      "values": null
    },
    {
      "id": "opt-2",
      "name": "Lechuga",
      "type": "quantity",
      "is_default": true,
      "values": [
        { "value": "little", "label": "Poco" },
        { "value": "medium", "label": "Medio" },
        { "value": "lots", "label": "Mucho" }
      ],
      "default_value": "medium"
    },
    {
      "id": "opt-3",
      "name": "Queso",
      "type": "selection",
      "is_default": true,
      "price_modifier": 15
    },
    {
      "id": "opt-4",
      "name": "Mayonesa",
      "type": "selection",
      "is_default": false,  // ← NO viene seleccionada
      "price_modifier": 5
    }
  ]
}
```

### Orden con Customizaciones
```json
{
  "order_id": "uuid-order",
  "table_id": "uuid-table-3",
  "status": "in_progress",
  
  "items": [
    {
      "order_item_id": "uuid-item-1",
      "product": "Hamburguesa Clásica",
      "quantity": 2,
      "base_price": 149,
      
      "customizations": [
        { "option": "Pan", "value": "Pan blanco", "price_adj": 0 },
        { "option": "Lechuga", "value": "medium", "price_adj": 0 },
        { "option": "Tomate", "value": "little", "price_adj": 0 },
        { "option": "Queso", "value": "si", "price_adj": 15 },
        { "option": "Mayonesa", "value": "no", "price_adj": 0 }
      ],
      
      "item_total": 328  // (149 + 15) × 2
    }
  ],
  
  "order_total": 328,
  "created_at": "2026-05-29T14:30:00Z"
}
```

---

## 🚀 Pasos de Implementación

### Fase 1: Setup Supabase (Hoy)
- [ ] Crear proyecto en supabase.com
- [ ] Ejecutar el SQL (SUPABASE_SCHEMA.sql)
- [ ] Crear datos iniciales (usuarios admin/mesero, mesas)
- [ ] Verificar credenciales en supabaseClient.ts

### Fase 2: Login + Autenticación (Hoy)
- [ ] Crear LoginScreen
- [ ] Crear authService (login/logout)
- [ ] Agregar Context para estado global
- [ ] Actualizar App.tsx con role-based routing

### Fase 3: Admin Panel (Mañana)
- [ ] Crear AdminPanel
- [ ] Crear ProductEditorScreen
- [ ] Crear ProductOptionEditorModal
- [ ] Implementar CRUD en productService

### Fase 4: Mesero - Menu (Mañana)
- [ ] Modificar MenuScreen para obtener de Supabase
- [ ] Actualizar ProductModal con opciones dinámicas
- [ ] Agregar ProductOptionEditorModal

### Fase 5: Mesero - Gestión de Mesas (Pasado mañana)
- [ ] Crear WaiterScreen (lista de mesas)
- [ ] Crear TableSelectorModal
- [ ] Agregar estado de mesas (free/occupied)
- [ ] Implementar en orderService

### Fase 6: Cocina Simplificada (Pasado mañana)
- [ ] Simplificar KitchenScreen a 3 botones
- [ ] Status: pending → in_progress → ready → completed
- [ ] Eliminar panel detallado

### Fase 7: Cierre de Cuentas + Historial
- [ ] Conectar checkout a Supabase
- [ ] Guardar en order_history
- [ ] Actualizar historialDetailModal

---

## 🛠️ Dependencias a Instalar

```bash
npm install @supabase/supabase-js
npm install zustand  # o Context API si prefieres
```

---

## 🔑 Variables de Entorno

Crear archivo `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://ndoxfsqavxdgdbqlgbnn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb3hmc3FhdnhkZ2RicWxnYm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzEzODYsImV4cCI6MjA5NTYwNzM4Nn0.LuETvBE7sxgDMYEBxMpGpc_lDiJfG4GJEJoFtuDQTsU
```

---

## 📝 Notas Importantes

1. **Seguridad en Login**: Por ahora plain text (123456, 654321) está ok para desarrollo
2. **Multi-Restaurant**: La estructura soporta múltiples restaurantes con `restaurant_id`
3. **Realtime**: Podemos agregar Supabase Realtime para ver órdenes en vivo en cocina
4. **Offline**: Puedes guardar en localStorage como fallback si la conexión falla
5. **Roles**: En producción, cambiar a Supabase Auth con roles reales

---

## ✅ Próximos Pasos

1. Ejecuta el SQL en Supabase
2. Confirma que las tablas existen
3. Crea los datos iniciales (usuarios y mesas)
4. Inicia la implementación del LoginScreen
