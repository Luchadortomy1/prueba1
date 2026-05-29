-- ============================================
-- SUPABASE SQL SCHEMA - POS Restaurant App
-- ============================================

-- 1. RESTAURANTES (Para multi-tenant) - PRIMERO
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. USUARIOS (Autenticación básica - en producción usar Auth de Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'waiter')),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. PRODUCTOS (Hamburguesa, Pizza, etc.)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  emoji TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id, name)
);

-- 4. OPCIONES DE PRODUCTOS (Ingredientes/Toppings)
CREATE TABLE product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  option_type TEXT NOT NULL CHECK (option_type IN ('quantity', 'selection')),
  -- quantity: poco, medio, mucho
  -- selection: agregar o no agregar
  is_default BOOLEAN DEFAULT FALSE,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, name)
);

-- 5. VALORES DE OPCIONES (para quantity: "poco", "medio", "mucho")
CREATE TABLE option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  display_label TEXT NOT NULL,
  price_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  sort_order INT DEFAULT 0,
  UNIQUE(option_id, value)
);

-- 6. MESAS
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INT NOT NULL,
  capacity INT DEFAULT 4,
  status TEXT DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id, table_number)
);

-- 7. ÓRDENES (Comanda)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  waiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_number INT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'ready', 'completed')),
  total_amount DECIMAL(10, 2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', NULL)),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. ITEMS DE ORDEN (Productos en la comanda)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'ready', 'delivered')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. CUSTOMIZACIONES DE ITEMS (Lo que el cliente pidió específico)
CREATE TABLE order_item_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE RESTRICT,
  selected_value TEXT,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  UNIQUE(order_item_id, option_id)
);

-- 10. HISTORIAL (Closed accounts)
CREATE TABLE order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  items_count INT NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_product_options_product ON product_options(product_id);
CREATE INDEX idx_option_values_option ON option_values(option_id);
CREATE INDEX idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_customizations_item ON order_item_customizations(order_item_id);
CREATE INDEX idx_order_history_restaurant ON order_history(restaurant_id);
CREATE INDEX idx_order_history_completed ON order_history(completed_at DESC);

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Crear restaurante
INSERT INTO restaurants (name) 
VALUES ('Mi Restaurante') 
RETURNING id AS restaurant_id;

-- Crear usuarios (usa el restaurant_id del anterior)
-- NOTA: La contraseña debería estar hasheada en producción
-- INSERT INTO users (username, password, role, restaurant_id) 
-- VALUES 
--   ('admin', 'hashed_123456', 'admin', 'YOUR_RESTAURANT_ID'),
--   ('mesero', 'hashed_654321', 'waiter', 'YOUR_RESTAURANT_ID');

-- Crear mesas
-- INSERT INTO tables (restaurant_id, table_number, capacity)
-- VALUES 
--   ('YOUR_RESTAURANT_ID', 1, 2),
--   ('YOUR_RESTAURANT_ID', 2, 4),
--   ('YOUR_RESTAURANT_ID', 3, 4),
--   ('YOUR_RESTAURANT_ID', 4, 6),
--   ('YOUR_RESTAURANT_ID', 5, 2),
--   ('YOUR_RESTAURANT_ID', 6, 4),
--   ('YOUR_RESTAURANT_ID', 7, 4),
--   ('YOUR_RESTAURANT_ID', 8, 6),
--   ('YOUR_RESTAURANT_ID', 9, 8);

-- Ejemplo: Producto HAMBURGUESA
-- INSERT INTO products (restaurant_id, name, description, base_price, emoji)
-- VALUES ('YOUR_RESTAURANT_ID', 'Hamburguesa Clásica', 'Hamburguesa con ingredientes básicos', 149, '🍔')
-- RETURNING id AS product_id;

-- Ejemplo: Opciones para HAMBURGUESA
-- INSERT INTO product_options (product_id, name, option_type, is_default)
-- VALUES 
--   ('PRODUCT_ID', 'Pan', 'selection', TRUE),
--   ('PRODUCT_ID', 'Carne', 'selection', TRUE),
--   ('PRODUCT_ID', 'Lechuga', 'quantity', TRUE),
--   ('PRODUCT_ID', 'Tomate', 'quantity', TRUE),
--   ('PRODUCT_ID', 'Queso', 'selection', TRUE),
--   ('PRODUCT_ID', 'Mayonesa', 'quantity', FALSE);

-- Ejemplo: Valores para opción LECHUGA
-- INSERT INTO option_values (option_id, value, display_label)
-- VALUES 
--   ('OPTION_ID', 'little', 'Poco'),
--   ('OPTION_ID', 'medium', 'Medio'),
--   ('OPTION_ID', 'lots', 'Mucho');

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Órdenes con detalles
CREATE OR REPLACE VIEW v_orders_detail AS
SELECT 
  o.id,
  o.order_number,
  t.table_number,
  o.status,
  COUNT(oi.id) as items_count,
  COALESCE(SUM(oi.subtotal), 0) as total,
  o.created_at,
  o.updated_at
FROM orders o
LEFT JOIN tables t ON o.table_id = t.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, t.table_number;

-- Vista: Productos con opciones
CREATE OR REPLACE VIEW v_products_with_options AS
SELECT 
  p.id,
  p.name,
  p.base_price,
  p.emoji,
  json_agg(
    json_build_object(
      'id', po.id,
      'name', po.name,
      'type', po.option_type,
      'is_default', po.is_default,
      'price_modifier', po.price_modifier,
      'values', COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'value', ov.value,
              'label', ov.display_label
            )
            ORDER BY ov.sort_order
          )
          FROM option_values ov 
          WHERE ov.option_id = po.id
        ),
        '[]'::json
      )
    )
    ORDER BY po.sort_order
  ) as options
FROM products p
LEFT JOIN product_options po ON p.id = po.product_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.base_price, p.emoji;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función: Obtener próximo número de orden
CREATE OR REPLACE FUNCTION get_next_order_number(restaurant_id_param UUID)
RETURNS INT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT MAX(order_number) FROM orders WHERE restaurant_id = restaurant_id_param),
    0
  ) + 1;
END;
$$ LANGUAGE plpgsql;

-- Función: Marcar mesa como ocupada
CREATE OR REPLACE FUNCTION mark_table_occupied(table_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE tables SET status = 'occupied', updated_at = NOW() 
  WHERE id = table_id_param;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función: Marcar mesa como libre
CREATE OR REPLACE FUNCTION mark_table_free(table_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE tables SET status = 'free', updated_at = NOW() 
  WHERE id = table_id_param;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Política: Solo admin puede crear/editar productos
CREATE POLICY "admin_products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE role = 'admin' AND users.restaurant_id = products.restaurant_id
    )
  );

-- Política: Meseros pueden ver ordenes de su restaurante
CREATE POLICY "waiter_orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.restaurant_id = orders.restaurant_id 
      AND users.role = 'waiter'
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
/*
1. PRIMEROS PASOS EN SUPABASE:
   - Copia todo este SQL
   - Ve a tu proyecto en supabase.com
   - SQL Editor → New Query
   - Pega el SQL
   - Ejecuta

2. LUEGO, CREA TUS DATOS INICIALES:
   - Usa el comentario "DATOS DE EJEMPLO"
   - Reemplaza YOUR_RESTAURANT_ID con el ID que te devuelve
   - Crea tus usuarios y mesas

3. CONFIGURAR RLS (Seguridad):
   - Las políticas están comentadas arriba
   - En producción, actívalas para seguridad
   - Puedes disablearlas mientras desarrollas

4. CONTRASEÑAS:
   - Para demostración: plain text está ok
   - En producción: usa bcrypt o similar desde backend

5. ESTRUCTURA DE DATOS:
   - productos: Hamburguesa, Pizza, etc.
   - product_options: Lechuga, Queso, Carne, etc.
   - option_values: "poco", "medio", "mucho" para cantidad
   - orders: Una comanda por mesa
   - order_items: Cada producto en la comanda
   - order_item_customizations: Las customizaciones específicas
*/
