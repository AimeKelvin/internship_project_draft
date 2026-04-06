// Calculate order total from items
export const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (parseFloat(item.unit_price) * item.quantity);
  }, 0);
};

// Update order status based on all its items
export const updateOrderStatus = async (pool, orderId) => {
  const [items] = await pool.query(
    'SELECT status FROM order_items WHERE order_id = ?',
    [orderId]
  );

  if (items.length === 0) return;

  const allServed = items.every(item => item.status === 'served');
  const allReady = items.every(item => item.status === 'ready' || item.status === 'served');
  const anyCooking = items.some(item => item.status === 'cooking');

  let newStatus = 'pending';
  if (allServed) newStatus = 'served';
  else if (allReady) newStatus = 'ready';
  else if (anyCooking) newStatus = 'preparing';

  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);

  // If order served, free the table
  if (newStatus === 'served') {
    await pool.query(`
      UPDATE tables t 
      JOIN orders o ON t.id = o.table_id 
      SET t.status = 'available' 
      WHERE o.id = ?
    `, [orderId]);
  }
};