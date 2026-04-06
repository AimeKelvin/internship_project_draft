// === Menu Categories CRUD ===
import db from '../config/db.js';
// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM menu_categories ORDER BY name'
    );
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// Create category (Manager only)
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    await db.query(
      'INSERT INTO menu_categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    res.status(201).json({ message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category' });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE menu_categories SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category' });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM menu_categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

// === Menu Items CRUD ===

// Get all menu items (with category name)
export const getAllMenuItems = async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT mi.*, mc.name as category_name 
      FROM menu_items mi 
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id 
      ORDER BY mc.name, mi.name
    `);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
};

// Create menu item (Manager only)
export const createMenuItem = async (req, res) => {
  const { category_id, name, price, image_url } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Name, price and category are required' });
  }

  try {
    await db.query(
      'INSERT INTO menu_items (category_id, name, price, image_url) VALUES (?, ?, ?, ?)',
      [category_id, name, price, image_url || null]
    );
    res.status(201).json({ message: 'Menu item created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create menu item' });
  }
};

// Update menu item (including toggle availability)
export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, price, image_url, is_available } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE menu_items SET name = ?, price = ?, image_url = ?, is_available = ? WHERE id = ?',
      [name, price, image_url || null, is_available !== undefined ? is_available : true, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update menu item' });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM menu_items WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
};