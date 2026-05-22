# 📱 POS App - Tutorial de Uso y Demo

## 🎯 Guía Rápida de Inicio

### Paso 1: Seleccionar Mesa
1. Abre la app y haz clic en el tab **"📋 Mesas"**
2. Selecciona una mesa (ej: Mesa 03, Mesa 02, etc.)
3. El nombre de la mesa aparecerá en la parte superior

### Paso 2: Agregar Productos al Carrito
1. Ve al tab **"🍽 Menú"**
2. Busca un producto (ej: Crispy Chicken)
3. Toca el producto para abrir el modal de customización
4. **Selecciona opciones:**
   - Opciones requeridas (debe elegir una): Salsa, Término, etc.
   - Extras opcionales (puedes seleccionar varios): Queso (+$15), Bacon (+$20), etc.
5. Ajusta la cantidad con los botones **−** y **+**
6. Toca **"Agregar a orden"** para añadir al carrito

### Paso 3: Ver y Editar la Orden
1. En la parte inferior, verás la barra naranja **"Orden · Mesa X"** con:
   - Número de items (en círculo rojo)
   - Nombre de la mesa
   - Precio total
2. Toca la barra para abrir el modal de detalle
3. En el modal puedes:
   - Ver todos los items con sus customizaciones (ej: "Crispy Chicken - Ranch, Bacon")
   - **Eliminar items** con el botón rojo **✕**
   - Ver subtotal, IVA 16%, y total
   - El precio YA incluye el IVA

### Paso 4: Enviar Orden a Cocina
1. En el modal de orden, toca **"Mandar Orden →"** (botón verde)
2. Recibirás una confirmación: **"Orden enviada a cocina · Mesa X"**
3. La orden aparecerá en el tab **"🔥 Cocina"**
4. El carrito se limpia automáticamente

### Paso 5: Ver y Gestionar Órdenes en Cocina
1. Ve al tab **"🔥 Cocina"**
2. Verás todas las órdenes enviadas por mesa
3. Cada orden muestra:
   - **Mesa X** (ej: Mesa 03)
   - **Estado**: Pendiente / Preparando / Listo / Entregado
   - **Tiempo** desde que se envió (ej: 2m 15s)
   - **Items** con cantidades y customizaciones

4. **Gestionar estados:**
   - **Pendiente** → Toca "Iniciar preparación" → **Preparando**
   - **Preparando** → Toca "Marcar listo" → **Listo**
   - **Listo** → Toca "Entregar" → **Entregado**
   - **Entregado** → Muestra "✓ Entregado" (botón deshabilitado)

### Paso 6: Cobrar (Cerrar Cuenta)
1. Ve al tab **"🍽 Menú"**
2. Toca el icono **☰ (hamburguesa)** en la parte superior
3. Toca **"Cobrar"**
4. Se abre el modal de pago que muestra:
   - **Total (IVA incluido)**: El precio que paga el cliente
   - **Método de pago**: Efectivo o Tarjeta
   - Dos botones:
     - **"Cancelar"** (rojo) - Vuelve atrás sin procesar
     - **"Confirmar cobro"** (verde) - Procesa el pago

5. Selecciona el método de pago y toca **"Confirmar cobro"**
6. Recibirás: **"Cuenta cerrada · Mesa X"**
7. La orden se mueve a historial y la mesa queda disponible

---

## 🎮 Flujo Completo de Ejemplo

### Escenario: Mesa 3 - Lunch

**1. Seleccionar mesa:**
- Tab "Mesas" → Toca "03"

**2. Agregar primer item (Smash Doble):**
- Tab "Menú" → Toca "🍔 Hamburguesa Smash Doble"
- Elige "Queso Cheddar" como opción de queso
- Agrega extras: Bacon (+$20)
- Cantidad: 2
- Toca "Agregar a orden"
- Precio: $149 + $20 = $169 × 2 = $338

**3. Agregar segundo item (Pizza):**
- Toca "🍍 Pizza Hawaiiana"
- Elige "Mozzarella" como queso
- Agrega extra: Jamón extra (+$25)
- Cantidad: 1
- Toca "Agregar a orden"
- Precio: $129 + $25 = $154

**4. Orden en carrito:**
- Barra naranja muestra: "2 Orden · Mesa 3 $492"

**5. Ver detalle:**
- Toca la barra
- Modal muestra:
  - Hamburguesa Smash Doble (x2) - Cheddar, Bacon - $338
  - Pizza Hawaiiana (x1) - Mozzarella, Jamón extra - $154
  - Subtotal: $492
  - IVA 16%: $79
  - **Total: $571**

**6. Enviar a cocina:**
- Toca "Mandar Orden →"
- Confirmación: "Orden enviada a cocina · Mesa 3"

**7. Ver en cocina:**
- Tab "Cocina"
- Orden "Mesa 03" aparece con estado "Pendiente"
- Toca "Iniciar preparación" → Cambia a "Preparando"
- Espera y toca "Marcar listo" → Cambia a "Listo"
- Toca "Entregar" → "Entregado"

**8. Cerrar cuenta:**
- Tab "Menú" → ☰ → "Cobrar"
- Modal muestra: "Total (IVA incluido) $571"
- Selecciona "Efectivo" o "Tarjeta"
- Toca "Confirmar cobro"
- Confirmación: "Cuenta cerrada · Mesa 3"

---

## 🆕 Nuevas Características Implementadas

### ✅ Checkout Modal Mejorado
- **Botón Cancelar** (rojo) para salir sin pagar
- Solo **Efectivo y Tarjeta** (métodos simplificados)
- **IVA incluido** en el total mostrado
- Cancelación preserva el carrito para editar

### ✅ OrderDetailModal (Nuevo)
- Ver todos los items del carrito
- **Customizaciones visibles** (ej: "Cheddar, Bacon, Sin cebolla")
- Botón ✕ para eliminar items individuales
- Cálculos automáticos: Subtotal, IVA 16%, Total
- "Volver" y "Mandar Orden" buttons

### ✅ Kitchen Screen Integrada
- Muestra **órdenes reales** enviadas desde el menú
- Cambio de estado: Pendiente → Preparando → Listo → Entregado
- Tiempo transcurrido desde que se envió
- Emojis para cada producto
- Customizaciones visibles en cada item

### ✅ Per-Table Cart System
- Cada mesa tiene su **carrito independiente**
- Los items no se mezclan entre mesas
- Al cambiar de mesa, el carrito se preserva
- Perfecto para múltiples mesas activas

### ✅ Customización Mejorada
- Los extras seleccionados se **guardan y muestran**
- Ejemplo: "Crispy Chicken - Ranch, Bacon, Queso"
- Se sincroniza desde ProductModal a OrderDetailModal
- Aparece en Cocina para que sepan cómo preparlo

---

## 📊 Estado de Órdenes

Las órdenes tienen 4 estados:

```
Pendiente (🟡)
   ↓ Toca "Iniciar preparación"
Preparando (🟡)
   ↓ Toca "Marcar listo"
Listo (🟢)
   ↓ Toca "Entregar"
Entregado (⚫)
   ↓ Permanece entregado
```

---

## 💡 Tips y Trucos

1. **Cambiar de mesa rápido:** No pierdes el carrito, solo cambia a otra mesa
2. **Editar antes de enviar:** Puedes eliminar items desde el modal de orden
3. **Ver tiempo en cocina:** Se actualiza cada segundo
4. **Personalización completa:** Todas las opciones y extras se muestran en cocina
5. **IVA automático:** No necesitas calcularlo, ya está incluido en todo

---

## 🔧 Configuración Técnica

- **Framework**: React Native + Expo Web
- **Estado**: React Hooks (useState)
- **Persistencia**: En memoria (sesión actual)
- **Cálculos**: Automáticos con IVA 16%
- **Sincronización**: Real-time entre pantallas

---

## 📝 Resumen de Cambios Realizados

### Archivos Modificados:
1. **App.tsx** - Per-table cart, kitchen integration
2. **CheckoutModal.tsx** - Cancelar button, IVA incluido, solo efectivo/tarjeta
3. **OrderDetailModal.tsx** - Customizaciones visibles
4. **ProductModal.tsx** - Capture customization text
5. **KitchenScreen.tsx** - Live order tracking con cambio de estado

### Nuevas Características:
- ✅ Kitchen screen integrada
- ✅ Per-table cart system
- ✅ Customization display
- ✅ IVA automático incluido
- ✅ Order status workflow
- ✅ Cancel checkout option

---

## 🚀 Próximos Pasos (Opcionales)

- [ ] Persistencia a localStorage
- [ ] Historial de órdenes
- [ ] Repetir última orden
- [ ] Cancelar items específicos antes de enviar
- [ ] Toast notifications (en lugar de alerts)
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

---

**¡La app está lista para probar! 🎉**

Selecciona una mesa, agrega productos y envíalos a cocina. Luego ve a la pantalla de cocina para gestionar los estados de las órdenes.
