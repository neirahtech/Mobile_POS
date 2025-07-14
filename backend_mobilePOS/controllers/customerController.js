const db = require('../db');

// Create customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, contact, whatsapp, viber, email, address, joinedDate, paid, due, credit, status, purchases, branch_id } = req.body;
    if (!name || !contact || !joinedDate || !status || !branch_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const purchasesJson = purchases ? JSON.stringify(purchases) : '[]';
    await db.execute(
      'INSERT INTO customers (name, contact, whatsapp, viber, email, address, joinedDate, paid, due, credit, status, purchases, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',

      [name, contact, !!whatsapp, !!viber, email || '', address || '', joinedDate, paid || 0, due || 0, credit || 0, status, purchasesJson, branch_id]
    );
    res.status(201).json({ message: 'Customer created' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating customer', error: err.message });
  }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const branch_id = req.query.branch_id || req.body.branch_id;
    if (!branch_id) {
      return res.status(400).json({ message: "branch_id is required" });
    }
    // Fix: MySQL JSON columns may already be objects, so only parse if string
    const [rows] = await db.execute('SELECT * FROM customers WHERE branch_id = ? ORDER BY id DESC', [branch_id]);
    const data = rows.map(row => ({
      ...row,
      purchases: typeof row.purchases === 'string'
        ? (row.purchases ? JSON.parse(row.purchases) : [])
        : (Array.isArray(row.purchases) ? row.purchases : [])
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customers', error: err.message });
  }
};

// Get customer by id
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM customers WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
    const row = rows[0];
    // Fix: If purchases is a string, parse it, else use as is
    row.purchases = typeof row.purchases === 'string'
      ? (row.purchases ? JSON.parse(row.purchases) : [])
      : (Array.isArray(row.purchases) ? row.purchases : []);
    // Fix: If joinedDate is a Date object, convert to yyyy-MM-dd string
    if (row.joinedDate instanceof Date) {
      const yyyy = row.joinedDate.getFullYear();
      const mm = String(row.joinedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(row.joinedDate.getDate()).padStart(2, '0');
      row.joinedDate = `${yyyy}-${mm}-${dd}`;
    } else if (typeof row.joinedDate === 'string' && row.joinedDate.includes('T')) {
      // If it's an ISO string, slice to yyyy-MM-dd
      row.joinedDate = row.joinedDate.slice(0, 10);
    }
    res.json(row);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customer', error: err.message });
  }
};

// Update customer
exports.updateCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, whatsapp, viber, email, address, joinedDate, paid, due, credit, status, purchases } = req.body;
    // Validate required fields
    if (!name || !contact || !joinedDate || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Fix: Ensure purchases is stringified if it's an object/array
    let purchasesJson = '[]';
    if (Array.isArray(purchases) || typeof purchases === 'object') {
      purchasesJson = JSON.stringify(purchases);
    } else if (typeof purchases === 'string') {
      purchasesJson = purchases;
    }
    // Fix: Ensure joinedDate is yyyy-MM-dd string
    let joinedDateStr = joinedDate;
    if (joinedDate instanceof Date) {
      const yyyy = joinedDate.getFullYear();
      const mm = String(joinedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(joinedDate.getDate()).padStart(2, '0');
      joinedDateStr = `${yyyy}-${mm}-${dd}`;
    } else if (typeof joinedDate === 'string' && joinedDate.includes('T')) {
      joinedDateStr = joinedDate.slice(0, 10);
    }
    const [result] = await db.execute(
      'UPDATE customers SET name=?, contact=?, whatsapp=?, viber=?, email=?, address=?, joinedDate=?, paid=?, due=?, credit=?, status=?, purchases=? WHERE id=?',
      [name, contact, !!whatsapp, !!viber, email || '', address || '', joinedDateStr, paid || 0, due || 0, credit || 0, status, purchasesJson, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating customer', error: err.message });
  }
};

// Delete customer
exports.deleteCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM customers WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting customer', error: err.message });
  }
};
