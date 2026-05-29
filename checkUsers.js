const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ndoxfsqavxdgdbqlgbnn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb3hmc3FhdnhkZ2RicWxnYm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzEzODYsImV4cCI6MjA5NTYwNzM4Nn0.LuETvBE7sxgDMYEBxMpGpc_lDiJfG4GJEJoFtuDQTsU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAndCreateUsers() {
  try {
    // Check existing users
    console.log('📋 Verificando usuarios existentes...\n');
    const { data: existingUsers, error: selectError } = await supabase
      .from('users')
      .select('*');

    if (selectError) {
      console.error('❌ Error al consultar usuarios:', selectError.message);
      return;
    }

    console.log(`✅ Usuarios existentes (${existingUsers.length}):`);
    existingUsers.forEach(u => {
      console.log(`  - ${u.username} (${u.role}) | Restaurant: ${u.restaurant_id.substring(0, 8)}...`);
    });
    console.log();

    // Create admin user if not exists
    const adminExists = existingUsers.some(u => u.username === 'admin');
    if (!adminExists) {
      console.log('➕ Creando usuario admin...');
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .insert([{
          username: 'admin',
          password: '123456',
          role: 'admin',
          restaurant_id: 'f580b0af-5af1-4978-9e35-928129470364'
        }])
        .select()
        .single();

      if (adminError) {
        console.error('❌ Error creando admin:', adminError.message);
      } else {
        console.log('✅ Admin creado:', adminUser.username);
      }
    } else {
      console.log('✅ Admin ya existe');
    }

    // Create waiter user if not exists
    const waiterExists = existingUsers.some(u => u.username === 'mesero');
    if (!waiterExists) {
      console.log('➕ Creando usuario mesero...');
      const { data: waiterUser, error: waiterError } = await supabase
        .from('users')
        .insert([{
          username: 'mesero',
          password: '654321',
          role: 'waiter',
          restaurant_id: 'f580b0af-5af1-4978-9e35-928129470364'
        }])
        .select()
        .single();

      if (waiterError) {
        console.error('❌ Error creando mesero:', waiterError.message);
      } else {
        console.log('✅ Mesero creado:', waiterUser.username);
      }
    } else {
      console.log('✅ Mesero ya existe');
    }

    // Final verification
    console.log('\n📋 Usuarios finales en base de datos:');
    const { data: finalUsers } = await supabase
      .from('users')
      .select('*');

    finalUsers.forEach(u => {
      console.log(`  ✓ ${u.username} (${u.role}) - ${u.password}`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkAndCreateUsers();
