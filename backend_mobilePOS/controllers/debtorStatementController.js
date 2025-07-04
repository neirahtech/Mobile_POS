const db = require('../db');

// Create debtor statement
exports.createDebtorStatement = async (req, res) => {
  try {
    const { supplier, date, description, debit, credit, balance } = req.body;
    if (!supplier || !date || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await db.execute(
      'INSERT INTO debtor_statements (supplier, date, description, debit, credit, balance) VALUES (?, ?, ?, ?, ?, ?)',
      [supplier, date, description, debit || 0, credit || 0, balance || 0]
    );
    res.status(201).json({ message: 'Debtor statement created' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating debtor statement', error: err.message });
  }
};

// Get all debtor statements
exports.getAllDebtorStatements = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM debtor_statements ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching debtor statements', error: err.message });
  }
};

// Get debtor statement by id
exports.getDebtorStatementById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM debtor_statements WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Debtor statement not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching debtor statement', error: err.message });
  }
};

// Update debtor statement
exports.updateDebtorStatementById = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier, date, description, debit, credit, balance } = req.body;
    const [result] = await db.execute(
      'UPDATE debtor_statements SET supplier=?, date=?, description=?, debit=?, credit=?, balance=? WHERE id=?',
      [supplier, date, description, debit || 0, credit || 0, balance || 0, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Debtor statement not found' });
    res.json({ message: 'Debtor statement updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating debtor statement', error: err.message });
  }
};

// Delete debtor statement
exports.deleteDebtorStatementById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM debtor_statements WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Debtor statement not found' });
    res.json({ message: 'Debtor statement deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting debtor statement', error: err.message });
  }
};
