const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ndoxfsqavxdgdbqlgbnn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb3hmc3FhdnhkZ2RicWxnYm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzEzODYsImV4cCI6MjA5NTYwNzM4Nn0.LuETvBE7sxgDMYEBxMpGpc_lDiJfG4GJEJoFtuDQTsU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyAll() {
  try {
    console.log('🔍 VERIFICACIÓN COMPLETA\n');

    const { data: restaurants, error: e1 } = await supabase.from('restaurants').select('*');
    console.log('🏢 RESTAURANTES:', restaurants?.length || 0);
    if (restaurants) {
      restaurants.forEach(r => console.log('  - ID:', r.id.substring(0, 8) + '...', 'Nombre:', r.name));
    }

    const { data: allProducts } = await supabase.from('products').select('*');
    console.log('\n🍔 PRODUCTOS (todos):', allProducts?.length || 0);
    if (allProducts) {
      allProducts.forEach(p => {
        console.log(`  - ${p.name}: restaurant_id=${p.restaurant_id?.substring(0, 8)}... is_active=${p.is_active}`);
      });
    }

    const { data: allTables } = await supabase.from('tables').select('*');
    console.log('\n🪑 MESAS (todas):', allTables?.length || 0);
    if (allTables && allTables.length > 0) {
      allTables.slice(0, 5).forEach(t => {
        console.log(`  - Mesa ${t.table_number}: restaurant_id=${t.restaurant_id?.substring(0, 8)}...`);
      });
      if (allTables.length > 5) console.log(`  ... y ${allTables.length - 5} más`);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

verifyAll();
