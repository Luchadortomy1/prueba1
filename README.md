# 🍽️ POS Restaurant Management System

Un sistema de punto de venta completo para restaurantes, desarrollado con React Native + Expo. Permite gestionar mesas, órdenes, customización de productos, y seguimiento en cocina.

## 🎯 Características Principales

### 📱 Gestión de Mesas
- Selecciona entre 9 mesas (interior + terraza)
- Carrito independiente por mesa
- Los items se preservan al cambiar de mesa

### 🍔 Menú Interactivo
- 6 productos con customizaciones
- Opciones requeridas (Salsa, Término, etc.)
- Extras opcionales (Queso +$15, Bacon +$20, etc.)
- Precios actualizados automáticamente

### 📋 Gestión de Órdenes
- Modal de detalle con todos los items
- Ver customizaciones de cada item
- Eliminar items específicos
- Cálculo automático de subtotal, IVA 16%, total
- Enviar a cocina con un click

### 🔥 Seguimiento en Cocina
- Ver órdenes en tiempo real
- Estados: Pendiente → Preparando → Listo → Entregado
- Tiempo transcurrido desde que se envió
- Customizaciones visibles para cada item
- Cambiar estado con botones

### 💳 Sistema de Pago
- Dos métodos: Efectivo o Tarjeta
- Precio final con IVA ya incluido
- Opción de cancelar sin procesar
- Cierra la mesa automáticamente

## 🚀 Quick Start

```bash
# 1. Navega a la carpeta del proyecto
cd c:\Users\Tom\Desktop\prueba1

# 2. Instala dependencias
npm install
# o
yarn install

# 3. Inicia el desarrollo
npm start
# o
yarn start

# 4. Abre en navegador
# http://localhost:8081/
```

## 📖 Documentación

- **[TUTORIAL.md](./TUTORIAL.md)** - Guía paso a paso de cómo usar la app
- **[CAMBIOS_REALIZADOS.md](./CAMBIOS_REALIZADOS.md)** - Documentación técnica y cambios implementados

## 🎮 Flujo de Uso

```
1. Selecciona una mesa (📋 Mesas)
   ↓
2. Agrega productos desde el menú (🍽 Menú)
   ↓
3. Personaliza cada producto (opciones + extras)
   ↓
4. Ve tu orden (barra naranja en la base)
   ↓
5. Envía a cocina (botón "Mandar Orden")
   ↓
6. Cocina gestiona los estados (🔥 Cocina)
   ↓
7. Cobra al cliente (☰ → Cobrar)
   ↓
8. Cierra la cuenta
```

## 📊 Stack Tecnológico

- **Frontend**: React Native 0.85.3
- **Framework**: Expo 56.0.3
- **Language**: TypeScript 6.0.3
- **State Management**: React Hooks (useState)
- **UI Components**: React Native (View, Text, ScrollView, Modal, etc.)
- **Web Support**: React Native Web 0.21.2

## 📁 Estructura de Carpetas

```
prueba1/
├── screens/
│   ├── MenuScreen.tsx         # Menú de productos
│   ├── TablesScreen.tsx       # Selector de mesas
│   ├── KitchenScreen.tsx      # Gestor de órdenes (KITCHEN)
│   └── DashboardScreen.tsx    # Dashboard
├── modals/
│   ├── ProductModal.tsx       # Customización de productos
│   ├── CheckoutModal.tsx      # Modal de pago
│   └── OrderDetailModal.tsx   # Detalle de orden
├── constants/
│   └── colors.ts              # Paleta de colores
├── App.tsx                     # Componente raíz
├── TUTORIAL.md                 # Guía de usuario
└── CAMBIOS_REALIZADOS.md       # Documentación técnica
```

## 🎨 Diseño y Colores

```typescript
Primary:    #ff6b2c (Naranja)     // Acciones principales
Accent:     #7c3aed (Púrpura)    // Énfasis
Background: #111    (Negro)      // Fondo
Surface:    #1a1a1a (Gris oscuro) // Cards/Modales
Border:     #2a2a2a (Gris medio)  // Líneas divisorias
Danger:     #dc2626 (Rojo)        // Botones de cancelación
Success:    #10b981 (Verde)       // Estados completados
```

## 🔄 Estado de Órdenes

```
PENDIENTE (amarillo)
    ↓ "Iniciar preparación"
PREPARANDO (amarillo)
    ↓ "Marcar listo"
LISTO (verde)
    ↓ "Entregar"
ENTREGADO (gris)
```

## 💡 Características Implementadas Recientemente

### ✅ Kitchen Screen Integrada
- Muestra órdenes REALES enviadas desde el menú
- No es demo data - se sincroniza en tiempo real
- Estados manejables desde UI
- Tiempo transcurrido actualizado

### ✅ Per-Table Cart System
- Cada mesa tiene su carrito independiente
- Cambiar de mesa NO limpia el carrito
- Items se preservan al volver a la mesa

### ✅ Customizaciones Visibles
- Los extras seleccionados se guardan
- Aparecen en la orden detalle
- Cocina ve exactamente cómo preparar

### ✅ Checkout Simplificado
- Solo 2 métodos: Efectivo y Tarjeta
- IVA incluido en el precio mostrado
- Botón "Cancelar" para salir sin pagar

### ✅ Cancelar Items
- Botón ✕ para eliminar items de la orden
- Totales se recalculan automáticamente
- Puedes editar antes de enviar a cocina

## ⚠️ Limitaciones Actuales

- ❌ No persiste datos (localStorage)
- ❌ No historial de órdenes
- ❌ No "repetir última orden"
- ⚠️ No modal de "cancelar orden completa"
- ⚠️ Usa browser alerts (debería ser toast)

## 🗓️ Próximos Pasos

- [ ] Agregar persistencia (localStorage)
- [ ] Crear modal de historial
- [ ] Implementar "repetir última orden"
- [ ] Agregar "cancelar orden completa"
- [ ] Reemplazar alerts con toast notifications
- [ ] Agregar validaciones de entrada
- [ ] Añadir pruebas unitarias

## 🤝 Contribuir

Para reportar bugs o sugerir mejoras, documenta:
1. Qué quisiste hacer
2. Qué pasó
3. Qué esperabas que pasara
4. Pasos para reproducir

## 📝 Licencia

Este proyecto usa la licencia incluida en [LICENSE](./LICENSE)

## 👨‍💼 Autor

Desarrollado como sistema de demostración de POS.

---

**¿Necesitas ayuda?** Consulta [TUTORIAL.md](./TUTORIAL.md) para instrucciones paso a paso.

**¿Quieres saber qué cambió?** Lee [CAMBIOS_REALIZADOS.md](./CAMBIOS_REALIZADOS.md).
