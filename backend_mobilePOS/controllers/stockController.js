const db = require('../db');

// Create a new stock detail
exports.createStockDetail = async (req, res) => {
  try {
    const { date, customer, items, total } = req.body;
    if (!date || !customer || !items || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const itemsJson = JSON.stringify(items);
    const [result] = await db.execute(
      'INSERT INTO sales_details (date, customer, items, total) VALUES (?, ?, ?, ?)',
      [date, customer, itemsJson, total]
    );
    res.status(201).json({ id: result.insertId, date, customer, items, total });
  } catch (err) {
    res.status(500).json({ message: 'Error creating stock detail', error: err.message });
  }
};

// Get all stock details
exports.getAllStockDetails = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM sales_details ORDER BY id DESC');
    // Parse items JSON for each row
    const data = rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stock details', error: err.message });
  }
};

// Get stock detail by id
exports.getStockDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM sales_details WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Stock detail not found' });
    }
    const row = rows[0];
    row.items = JSON.parse(row.items);
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stock detail', error: err.message });
  }
};

// Delete stock detail by id
exports.deleteStockDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM sales_details WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Stock detail not found' });
    }
    res.json({ message: 'Stock detail deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting stock detail', error: err.message });
  }
};
