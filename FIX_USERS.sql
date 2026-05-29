-- Desactivar RLS en tabla users para permitir inserciones desde cliente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Crear usuarios de demo
INSERT INTO users (username, password, role, restaurant_id) VALUES
('admin', '123456', 'admin', 'f580b0af-5af1-4978-9e35-928129470364'),
('mesero', '654321', 'waiter', 'f580b0af-5af1-4978-9e35-928129470364')
ON CONFLICT (username) DO NOTHING;

-- Verificar usuarios creados
SELECT id, username, password, role FROM users;
