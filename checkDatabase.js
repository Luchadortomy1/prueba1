const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ndoxfsqavxdgdbqlgbnn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb3hmc3FhdnhkZ2RicWxnYm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzEzODYsImV4cCI6MjA5NTYwNzM4Nn0.LuETvBE7sxgDMYEBxMpGpc_lDiJfG4GJEJoFtuDQTsU';
const restaurantId = 'f580b0af-5af1-4978-9e35-928129470364';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabase() {
  try {
    console.log('📋 === VERIFICANDO BASE DE DATOS ===\n');

    // Get tables in restaurant
    console.log('🪑 MESAS:');
    const { data: tables } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (tables && tables.length > 0) {
      console.log(`Encontradas ${tables.length} mesas:`);
      tables.forEach(t => {
        console.log(`  Mesa ${t.table_number}: ${t.status} (${t.capacity} personas)`);
      });
    } else {
      console.log('  (Sin mesas)');
    }

    console.log('\n✅ Verificación completada');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkDatabase();
