import db from '../config/db.js';

// GET: Kitchen Orders (only order status matters)
export const getKitchenOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        o.id AS order_id,
        o.table_id,
        o.status AS order_status,
        oi.id AS item_id,
        oi.menu_item_id,
        mi.name AS item_name,
        oi.quantity,
        oi.notes
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE o.status != 'served'
      ORDER BY o.id ASC, oi.id ASC
    `);

    // Group items by order
    const ordersMap = new Map();
    for (const row of rows) {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          order_id: row.order_id,
          table_id: row.table_id,
          order_status: row.order_status,
          items: [],
        });
      }
      if (row.item_id) {
        ordersMap.get(row.order_id).items.push({
          item_id: row.item_id,
          menu_item_id: row.menu_item_id,
          item_name: row.item_name,
          quantity: row.quantity,
          notes: row.notes,
        });
      }
    }

    res.json(Array.from(ordersMap.values()));
  } catch (err) {
    console.error('Kitchen fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch kitchen orders' });
  }
};

// PATCH: Update order status
export const updateOrderStatusInKitchen = async (req, res) => {
  const { order_id, status } = req.body;
  if (!['pending','preparing','ready','served'].includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  try {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, order_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: `Order ${order_id} status updated to ${status}` });
  } catch (err) {
    console.error('Kitchen update error:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};