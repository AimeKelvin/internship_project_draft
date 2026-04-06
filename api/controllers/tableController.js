import db from '../config/db.js';
// Get all tables (with computed status - but we store it for simplicity)
export const getAllTables = async (req, res) => {
  try {
    const [tables] = await db.query(
      'SELECT * FROM tables ORDER BY table_number'
    );
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tables' });
  }
};

// Manager: Create a new table
export const createTable = async (req, res) => {
  const { table_number } = req.body;

  if (!table_number) {
    return res.status(400).json({ message: 'Table number is required' });
  }

  try {
    await db.query(
      'INSERT INTO tables (table_number) VALUES (?)',
      [table_number]
    );
    res.status(201).json({ message: 'Table created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Table number already exists' });
    }
    res.status(500).json({ message: 'Failed to create table' });
  }
};

// Manager: Update table (rarely needed, but included for full CRUD)
export const updateTable = async (req, res) => {
  const { id } = req.params;
  const { table_number } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE tables SET table_number = ? WHERE id = ?',
      [table_number, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({ message: 'Table updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update table' });
  }
};

// Manager: Delete table
export const deleteTable = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM tables WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete table' });
  }
};