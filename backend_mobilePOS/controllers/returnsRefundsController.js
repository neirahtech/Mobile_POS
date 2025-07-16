const db = require('../db');

// Create return/refund
exports.createReturnRefund = async (req, res) => {
  try {
    const { date, item, reason, refund, method, branch_id, customer_name } = req.body;
    // Defensive: refund must be a number, branch_id must be a number
    const refundValue = Number(refund) || 0;
    const branchId = Number(branch_id) || null;

    if (!date || !item || !reason || !refundValue || !method || !branchId || !customer_name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await db.execute(
      'INSERT INTO returns_refunds (date, item, reason, refund, method, branch_id, customer_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [date, item, reason, refundValue, method, branchId, customer_name]
    );
    res.status(201).json({ message: 'Return/Refund created' });
  } catch (err) {
    console.error('Error creating return/refund:', err);
    res.status(500).json({ message: 'Error creating return/refund', error: err.message });
  }
};

// Get all returns/refunds
exports.getAllReturnsRefunds = async (req, res) => {
  try {
    const branch_id = req.query.branch_id || req.body.branch_id;
    if (!branch_id) {
      return res.status(400).json({ message: "branch_id is required" });
    }
    const [rows] = await db.execute('SELECT * FROM returns_refunds WHERE branch_id = ? ORDER BY id DESC', [branch_id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching returns/refunds:', err);
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
    console.error('Error fetching return/refund:', err);
    res.status(500).json({ message: 'Error fetching return/refund', error: err.message });
  }
};

// Update return/refund
exports.updateReturnRefundById = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, item, reason, refund, method, customer_name } = req.body;

    const refundValue = Number(refund) || 0;

    if (!customer_name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    const [result] = await db.execute(
      'UPDATE returns_refunds SET date=?, item=?, reason=?, refund=?, method=?, customer_name=? WHERE id=?',
      [date, item, reason, refundValue, method, customer_name, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Return/Refund not found' });
    res.json({ message: 'Return/Refund updated' });
  } catch (err) {
    console.error('Error updating return/refund:', err);
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
    console.error('Error deleting return/refund:', err);
    res.status(500).json({ message: 'Error deleting return/refund', error: err.message });
  }
};
