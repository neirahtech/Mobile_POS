const db = require('../db');

// Create purchase order
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { orderNo, supplier, date, status, amount } = req.body;
    if (!orderNo || !supplier || !date || !status || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await db.execute(
      'INSERT INTO purchase_orders (orderNo, supplier, date, status, amount) VALUES (?, ?, ?, ?, ?)',
      [orderNo, supplier, date, status, amount]
    );
    res.status(201).json({ message: 'Purchase order created' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating purchase order', error: err.message });
  }
};

// Get all purchase orders
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM purchase_orders ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching purchase orders', error: err.message });
  }
};

// Get purchase order by id
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM purchase_orders WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Purchase order not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching purchase order', error: err.message });
  }
};

// Update purchase order
exports.updatePurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderNo, supplier, date, status, amount } = req.body;
    const [result] = await db.execute(
      'UPDATE purchase_orders SET orderNo=?, supplier=?, date=?, status=?, amount=? WHERE id=?',
      [orderNo, supplier, date, status, amount, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Purchase order not found' });
    res.json({ message: 'Purchase order updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating purchase order', error: err.message });
  }
};

// Delete purchase order
exports.deletePurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM purchase_orders WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Purchase order not found' });
    res.json({ message: 'Purchase order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting purchase order', error: err.message });
  }
};
