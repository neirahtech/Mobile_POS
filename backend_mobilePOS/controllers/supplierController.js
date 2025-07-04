const db = require('../db');

// Create supplier
exports.createSupplier = async (req, res) => {
  try {
    const { name, contact, total_purchase, paid, discount, balance } = req.body;
    if (!name || !contact) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await db.execute(
      'INSERT INTO suppliers (name, contact, total_purchase, paid, discount, balance) VALUES (?, ?, ?, ?, ?, ?)',
      [name, contact, total_purchase || 0, paid || 0, discount || 0, balance || 0]
    );
    res.status(201).json({ message: 'Supplier created' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating supplier', error: err.message });
  }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM suppliers ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching suppliers', error: err.message });
  }
};

// Get supplier by id
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM suppliers WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching supplier', error: err.message });
  }
};

// Update supplier
exports.updateSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, total_purchase, paid, discount, balance } = req.body;
    const [result] = await db.execute(
      'UPDATE suppliers SET name=?, contact=?, total_purchase=?, paid=?, discount=?, balance=? WHERE id=?',
      [name, contact, total_purchase || 0, paid || 0, discount || 0, balance || 0, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating supplier', error: err.message });
  }
};

// Delete supplier
exports.deleteSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM suppliers WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting supplier', error: err.message });
  }
};
