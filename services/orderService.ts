import { supabase } from './supabaseClient';

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  status: 'pending' | 'in_progress' | 'ready' | 'delivered';
}

export interface Order {
  id: string;
  table_id: string;
  status: 'pending' | 'in_progress' | 'ready' | 'completed';
  total_amount: number;
  payment_method?: 'cash' | 'card';
  items?: OrderItem[];
  created_at: string;
}

export async function createOrder(
  restaurantId: string,
  tableId: string,
  waiterId: string,
  items: Array<{ product_id: string; quantity: number; unit_price: number }>
): Promise<Order | null> {
  try {
    // Obtener próximo número de orden
    const { data: orderData } = await supabase
      .rpc('get_next_order_number', { restaurant_id_param: restaurantId });

    const orderNumber = orderData || 1;

    // Crear orden
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          restaurant_id: restaurantId,
          table_id: tableId,
          waiter_id: waiterId,
          order_number: orderNumber,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insertar items
    const itemsToInsert = items.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return newOrder as Order;
  } catch (err: any) {
    console.error('Error creating order:', err);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'in_progress' | 'ready' | 'completed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', orderId);

    if (error) throw error;

    return true;
  } catch (err: any) {
    console.error('Error updating order status:', err);
    return false;
  }
}

export async function updateOrderItemStatus(
  itemId: string,
  status: 'pending' | 'in_progress' | 'ready' | 'delivered'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('order_items')
      .update({ status })
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('Error updating item status:', err);
    return false;
  }
}

export async function completeOrder(
  orderId: string,
  restaurantId: string,
  tableId: string,
  totalAmount: number,
  paymentMethod: 'cash' | 'card'
): Promise<boolean> {
  try {
    // Actualizar orden como completada
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'completed', completed_at: new Date() })
      .eq('id', orderId);

    if (orderError) throw orderError;

    // Marcar mesa como libre
    await supabase
      .rpc('mark_table_free', { table_id_param: tableId });

    return true;
  } catch (err: any) {
    console.error('Error completing order:', err);
    return false;
  }
}

export async function getOrdersByTable(tableId: string, includeCompleted = false): Promise<Order[]> {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('table_id', tableId)
      .order('created_at', { ascending: false });

    if (!includeCompleted) {
      // Only fetch active orders (not completed)
      query = query.not('status', 'eq', 'completed');
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Order[];
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return [];
  }
}
