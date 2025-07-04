const db = require('../db');

// Create purchase return
exports.createPurchaseReturn = async (req, res) => {
  try {
    const { returnNo, supplier, date, reason, amount } = req.body;
    if (!returnNo || !supplier || !date || !reason || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await db.execute(
      'INSERT INTO purchase_returns (returnNo, supplier, date, reason, amount) VALUES (?, ?, ?, ?, ?)',
      [returnNo, supplier, date, reason, amount]
    );
    res.status(201).json({ message: 'Purchase return created' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating purchase return', error: err.message });
  }
};

// Get all purchase returns
exports.getAllPurchaseReturns = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM purchase_returns ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching purchase returns', error: err.message });
  }
};

// Get purchase return by id
exports.getPurchaseReturnById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM purchase_returns WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Purchase return not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching purchase return', error: err.message });
  }
};

// Update purchase return
exports.updatePurchaseReturnById = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnNo, supplier, date, reason, amount } = req.body;
    const [result] = await db.execute(
      'UPDATE purchase_returns SET returnNo=?, supplier=?, date=?, reason=?, amount=? WHERE id=?',
      [returnNo, supplier, date, reason, amount, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Purchase return not found' });
    res.json({ message: 'Purchase return updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating purchase return', error: err.message });
  }
};

// Delete purchase return
exports.deletePurchaseReturnById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM purchase_returns WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Purchase return not found' });
    res.json({ message: 'Purchase return deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting purchase return', error: err.message });
  }
};
