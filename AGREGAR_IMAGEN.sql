-- Agregar columna de imagen a productos
ALTER TABLE products ADD COLUMN image_url TEXT;

-- Vista mejorada con imagen
DROP VIEW IF EXISTS v_products_with_options CASCADE;

CREATE OR REPLACE VIEW v_products_with_options AS
SELECT 
  p.id,
  p.name,
  p.base_price,
  p.emoji,
  p.image_url,
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
GROUP BY p.id, p.name, p.base_price, p.emoji, p.image_url;
