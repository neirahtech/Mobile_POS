const db = require('../db');

// Create Pay in Terms customer
exports.createPayInTerms = async (req, res) => {
  try {
    const { name, contact, creditLimit, termDuration, creditUsed, paymentCycleNumber, paymentCycleUnit, invoice_date, due_date, branch_id } = req.body;
    const paymentCycle = `${paymentCycleNumber} ${paymentCycleUnit}`;
    if (!name || !contact || !creditLimit || !termDuration || !paymentCycle || !invoice_date || !due_date || !branch_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await db.execute(
      'INSERT INTO pay_in_terms (name, contact, creditLimit, termDuration, creditUsed, paymentCycle, invoice_date, due_date, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, contact, creditLimit, termDuration, creditUsed || 0, paymentCycle, invoice_date, due_date, branch_id]
    );
    res.status(201).json({ message: 'Pay in Terms customer created' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating pay in terms customer', error: err.message });
  }
};

// Get all Pay in Terms customers
exports.getAllPayInTerms = async (req, res) => {
  try {
    const branch_id = req.query.branch_id || req.body.branch_id;
    if (!branch_id) {
      return res.status(400).json({ message: "branch_id is required" });
    }
    const [rows] = await db.execute('SELECT * FROM pay_in_terms WHERE branch_id = ? ORDER BY id DESC', [branch_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pay in terms customers', error: err.message });
  }
};

// Get Pay in Terms customer by id
exports.getPayInTermsById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM pay_in_terms WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pay in Terms customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pay in terms customer', error: err.message });
  }
};

// Update Pay in Terms customer
exports.updatePayInTermsById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, creditLimit, termDuration, creditUsed, paymentCycleNumber, paymentCycleUnit, invoice_date, due_date } = req.body;
    const paymentCycle = `${paymentCycleNumber} ${paymentCycleUnit}`;
    const [result] = await db.execute(
      'UPDATE pay_in_terms SET name=?, contact=?, creditLimit=?, termDuration=?, creditUsed=?, paymentCycle=?, invoice_date=?, due_date=? WHERE id=?',
      [name, contact, creditLimit, termDuration, creditUsed, paymentCycle, invoice_date, due_date, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pay in Terms customer not found' });
    res.json({ message: 'Pay in Terms customer updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating pay in terms customer', error: err.message });
  }
};

// Delete Pay in Terms customer
exports.deletePayInTermsById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM pay_in_terms WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pay in Terms customer not found' });
    res.json({ message: 'Pay in Terms customer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting pay in terms customer', error: err.message });
  }
};
