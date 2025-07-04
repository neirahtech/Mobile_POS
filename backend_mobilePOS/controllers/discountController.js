const db = require('../db');

// Create discount
exports.createDiscount = async (req, res) => {
  try {
    // Fix: Some setups (like raw Postman) may not parse JSON automatically
    let body = req.body;
    if (!body || typeof body !== 'object') {
      // Try to parse if body is a string
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid JSON body' });
      }
    }
    // Defensive: If still not an object, fail
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ message: 'Invalid request body' });
    }
    const { name, type, value, item, items, startDate, endDate, status } = body;
    if (!name || !type || !value || !startDate || !endDate || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await db.execute(
      'INSERT INTO discounts (name, type, value, item, items, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, type, value, item || '', items || '[]', startDate, endDate, status]
    );
    res.status(201).json({ message: 'Discount created' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating discount', error: err.message });
  }
};

// Get all discounts
exports.getAllDiscounts = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM discounts ORDER BY id DESC');
    // Parse items field if string
    const data = rows.map(row => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : (Array.isArray(row.items) ? row.items : [])
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching discounts', error: err.message });
  }
};

// Get discount by id
exports.getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM discounts WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Discount not found' });
    const row = rows[0];
    row.items = typeof row.items === 'string' ? JSON.parse(row.items) : (Array.isArray(row.items) ? row.items : []);
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching discount', error: err.message });
  }
};

// Update discount
exports.updateDiscountById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, value, item, items, startDate, endDate, status } = req.body;
    if (!name || !type || !value || !startDate || !endDate || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await db.execute(
      'UPDATE discounts SET name=?, type=?, value=?, item=?, items=?, startDate=?, endDate=?, status=? WHERE id=?',
      [name, type, value, item || '', items || '[]', startDate, endDate, status, id]
    );
    res.json({ message: 'Discount updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating discount', error: err.message });
  }
};

// Delete discount
exports.deleteDiscountById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM discounts WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Discount not found' });
    res.json({ message: 'Discount deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting discount', error: err.message });
  }
};
