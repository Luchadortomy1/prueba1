-- Corregir el restaurant_id NULL
UPDATE products 
SET restaurant_id = 'f580b0af-5af1-4978-9e35-928129470364'
WHERE restaurant_id IS NULL
AND name = 'Hamburguesa';

-- Verificar
SELECT id, restaurant_id, name, base_price, is_active FROM products WHERE name = 'Hamburguesa';
