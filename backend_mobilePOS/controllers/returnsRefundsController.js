const db = require('../db');

// Create return/refund
exports.createReturnRefund = async (req, res) => {
  try {
    const { date, item, reason, refund, method } = req.body;
    if (!date || !item || !reason || !refund || !method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await db.execute(
      'INSERT INTO returns_refunds (date, item, reason, refund, method) VALUES (?, ?, ?, ?, ?)',
      [date, item, reason, refund, method]
    );
    res.status(201).json({ message: 'Return/Refund created' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating return/refund', error: err.message });
  }
};

// Get all returns/refunds
exports.getAllReturnsRefunds = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM returns_refunds ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching returns/refunds', error: err.message });
  }
};

// Get return/refund by id
exports.getReturnRefundById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM returns_refunds WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Return/Refund not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching return/refund', error: err.message });
  }
};

// Update return/refund
exports.updateReturnRefundById = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, item, reason, refund, method } = req.body;
    const [result] = await db.execute(
      'UPDATE returns_refunds SET date=?, item=?, reason=?, refund=?, method=? WHERE id=?',
      [date, item, reason, refund, method, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Return/Refund not found' });
    res.json({ message: 'Return/Refund updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating return/refund', error: err.message });
  }
};

// Delete return/refund
exports.deleteReturnRefundById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM returns_refunds WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Return/Refund not found' });
    res.json({ message: 'Return/Refund deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting return/refund', error: err.message });
  }
};
