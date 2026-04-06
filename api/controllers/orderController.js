import { calculateOrderTotal, updateOrderStatus } from '../utils/helpers.js';
import db from '../config/db.js';
// Create new order (Waiter only) - with business rules
export const createOrder = async (req, res) => {
  const { table_id, items } = req.body; // items = [{menu_item_id, quantity, notes?}]
  const waiter_id = req.user.id;

  if (!table_id || !items || items.length === 0) {
    return res.status(400).json({ message: 'Table ID and at least one item are required' });
  }

  try {
    // Check if table is available (business rule)
    const [tableRows] = await db.query(
      'SELECT status FROM tables WHERE id = ?',
      [table_id]
    );

    if (tableRows.length === 0 || tableRows[0].status !== 'available') {
      return res.status(400).json({ message: 'Table is not available or does not exist' });
    }

    // Create the order
    const [orderResult] = await db.query(
      'INSERT INTO orders (table_id, waiter_id) VALUES (?, ?)',
      [table_id, waiter_id]
    );
    const orderId = orderResult.insertId;

    let total = 0;

    // Add each order item with raw SQL
    for (const item of items) {
      const [menuItemRows] = await db.query(
        'SELECT price FROM menu_items WHERE id = ? AND is_available = TRUE',
        [item.menu_item_id]
      );

      if (menuItemRows.length === 0) {
        return res.status(400).json({ message: `Menu item ${item.menu_item_id} is not available or does not exist` });
      }

      const unit_price = menuItemRows[0].price;
      total += unit_price * item.quantity;

      await db.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.menu_item_id, item.quantity, unit_price, item.notes || null]
      );
    }

    // Update order total
    await db.query(
      'UPDATE orders SET total = ? WHERE id = ?',
      [total, orderId]
    );

    // Mark table as occupied (business rule)
    await db.query(
      'UPDATE tables SET status = "occupied" WHERE id = ?',
      [table_id]
    );

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Get all orders (Manager only)
export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, u.username as waiter_name, t.table_number 
      FROM orders o 
      JOIN users u ON o.waiter_id = u.id 
      JOIN tables t ON o.table_id = t.id 
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get my orders (Waiter only)
export const getMyOrders = async (req, res) => {
  try {
    // Fetch all orders for this waiter with table number
    const [orders] = await db.query(
      `SELECT o.*, t.table_number
       FROM orders o
       JOIN tables t ON o.table_id = t.id
       WHERE o.waiter_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    const orderIds = orders.map(o => o.id);
    if (orderIds.length === 0) return res.json([]);

    // Fetch all order items with menu item name and image
    const [items] = await db.query(
      `SELECT 
          oi.*, 
          m.name as menu_item_name, 
          m.image_url as menu_item_image
       FROM order_items oi
       JOIN menu_items m ON oi.menu_item_id = m.id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    // Attach items to their respective orders
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: items.filter(i => i.order_id === order.id)
    }));

    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch your orders' });
  }
};

// Update order (limited - mainly for manager to cancel)
export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., cancel order

  try {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If cancelled, free the table
    if (status === 'cancelled') {
      await db.query(`
        UPDATE tables t 
        JOIN orders o ON t.id = o.table_id 
        SET t.status = 'available' 
        WHERE o.id = ?
      `, [id]);
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order' });
  }
};

// Delete order (Manager only - careful use)
export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order' });
  }
};