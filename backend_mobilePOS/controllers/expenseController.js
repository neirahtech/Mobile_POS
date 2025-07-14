const db = require('../db');

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const { expense, paidTo, date, amount, paymentMethod, status, remark, balance, branch_id } = req.body;
    let receipt = null;
    if (req.file) {
      receipt = req.file.filename;
    }
    if (!expense || !paidTo || !date || !amount || !paymentMethod || !status || !branch_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Fix: If balance is empty string, set to null
    const balanceValue = balance === '' || balance === undefined ? null : balance;
    await db.execute(
      'INSERT INTO expenses (expense, paidTo, date, amount, paymentMethod, status, remark, balance, receipt, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [expense, paidTo, date, amount, paymentMethod, status, remark || '', balanceValue, receipt, branch_id]
    );
    res.status(201).json({ message: 'Expense created' });
  } catch (err) {
    console.error('Error in createExpense:', err);
    res.status(500).json({ message: 'Error creating expense', error: err.message });
  }
};

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const branch_id = req.query.branch_id || req.body.branch_id;
    if (!branch_id) {
      return res.status(400).json({ message: "branch_id is required" });
    }
    const [rows] = await db.execute('SELECT * FROM expenses WHERE branch_id = ? ORDER BY id DESC', [branch_id]);
    res.json(rows);
  } catch (err) {
    console.error('Error in getAllExpenses:', err);
    res.status(500).json({ message: 'Error fetching expenses', error: err.message });
  }
};

// Get expense by id
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM expenses WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error in getExpenseById:', err);
    res.status(500).json({ message: 'Error fetching expense', error: err.message });
  }
};

// Update expense by id
exports.updateExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { expense, paidTo, date, amount, paymentMethod, status, remark, balance } = req.body;
    let receipt = null;
    if (req.file) {
      receipt = req.file.filename;
    }
    // Fix: If balance is empty string, set to null
    const balanceValue = balance === '' || balance === undefined ? null : balance;
    let query = 'UPDATE expenses SET expense=?, paidTo=?, date=?, amount=?, paymentMethod=?, status=?, remark=?, balance=?';
    let params = [expense, paidTo, date, amount, paymentMethod, status, remark || '', balanceValue];
    if (receipt) {
      query += ', receipt=?';
      params.push(receipt);
    }
    query += ' WHERE id=?';
    params.push(id);

    const [result] = await db.execute(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense updated' });
  } catch (err) {
    console.error('Error in updateExpenseById:', err);
    res.status(500).json({ message: 'Error updating expense', error: err.message });
  }
};

// Delete expense by id
exports.deleteExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM expenses WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Error in deleteExpenseById:', err);
    res.status(500).json({ message: 'Error deleting expense', error: err.message });
  }
};
