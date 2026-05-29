-- ============================================
-- FIX: Actualizar datos existentes en Supabase
-- ============================================

-- 1. Obtener ID del restaurante (debería ser f580b0af-5af1-4978-9e35-928129470364)
-- SELECT id FROM restaurants LIMIT 1;

-- 2. Arreglar productos con restaurant_id NULL
UPDATE products 
SET restaurant_id = 'f580b0af-5af1-4978-9e35-928129470364'
WHERE restaurant_id IS NULL;

-- 3. Verificar que los usuarios están asignados al restaurante correcto
UPDATE users 
SET restaurant_id = 'f580b0af-5af1-4978-9e35-928129470364'
WHERE restaurant_id IS NULL OR restaurant_id = '';

-- 4. Verificar mesas con restaurante correcto
UPDATE tables 
SET restaurant_id = 'f580b0af-5af1-4978-9e35-928129470364'
WHERE restaurant_id IS NULL OR restaurant_id = '';

-- 5. Verificar estado final
SELECT '=== RESTAURANTE ===' as label;
SELECT id, name FROM restaurants;

SELECT '=== USUARIOS ===' as label;
SELECT username, role, restaurant_id FROM users;

SELECT '=== PRODUCTOS ===' as label;
SELECT name, base_price, restaurant_id FROM products;

SELECT '=== MESAS ===' as label;
SELECT table_number, capacity, status, restaurant_id FROM tables ORDER BY table_number;

SELECT '=== INGREDIENTES ===' as label;
SELECT po.name, po.is_default, po.price_modifier, p.name as product_name 
FROM product_options po
LEFT JOIN products p ON po.product_id = p.id
ORDER BY p.name, po.sort_order;
