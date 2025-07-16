const db = require('../db');

// Function to format phone number consistently
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleanNumber = phone.replace(/\D/g, '');
  
  // Handle different Sri Lankan number formats
  if (cleanNumber.startsWith('94')) {
    // Already has country code, return with +
    return '+' + cleanNumber;
  } else if (cleanNumber.startsWith('0')) {
    // Local format starting with 0, replace with +94
    return '+94' + cleanNumber.substring(1);
  } else if (cleanNumber.length === 9) {
    // 9 digit number without leading 0
    return '+94' + cleanNumber;
  } else {
    // Return original for other cases
    return phone;
  }
};

// Create customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, contact, whatsapp, viber, email, address, dateOfBirth, paid, due, credit, status, purchases, branch_id } = req.body;
    
    // Validate required fields
    if (!name || !contact || !dateOfBirth || !status) {
      return res.status(400).json({ message: 'Missing required fields: name, contact, dateOfBirth, status' });
    }

    // Use branch_id from request or default to 1 if not provided
    const finalBranchId = branch_id || 1;
    
    // Format phone number consistently
    const formattedContact = formatPhoneNumber(contact);
    
    const purchasesJson = purchases ? JSON.stringify(purchases) : '[]';
    
    await db.execute(
      'INSERT INTO customers (name, contact, whatsapp, viber, email, address, dateOfBirth, paid, due, credit, status, purchases, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, formattedContact, !!whatsapp, !!viber, email || '', address || '', dateOfBirth, paid || 0, due || 0, credit || 0, status, purchasesJson, finalBranchId]
    );
    
    res.status(201).json({ 
      message: 'Customer created successfully',
      formattedContact: formattedContact 
    });
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ message: 'Error creating customer', error: err.message });
  }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    // Make branch_id optional, default to 1 if not provided
    const branch_id = req.query.branch_id || req.body.branch_id || 1;
    
    const [rows] = await db.execute('SELECT * FROM customers WHERE branch_id = ? ORDER BY id DESC', [branch_id]);
    const data = rows.map(row => ({
      ...row,
      purchases: typeof row.purchases === 'string'
        ? (row.purchases ? JSON.parse(row.purchases) : [])
        : (Array.isArray(row.purchases) ? row.purchases : [])
    }));
    res.json(data);
  } catch (err) {
    console.error('Error fetching customers:', err);
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
    row.purchases = typeof row.purchases === 'string'
      ? (row.purchases ? JSON.parse(row.purchases) : [])
      : (Array.isArray(row.purchases) ? row.purchases : []);
    
    // Fix: If dateOfBirth is a Date object, convert to yyyy-MM-dd string
    if (row.dateOfBirth instanceof Date) {
      const yyyy = row.dateOfBirth.getFullYear();
      const mm = String(row.dateOfBirth.getMonth() + 1).padStart(2, '0');
      const dd = String(row.dateOfBirth.getDate()).padStart(2, '0');
      row.dateOfBirth = `${yyyy}-${mm}-${dd}`;
    } else if (typeof row.dateOfBirth === 'string' && row.dateOfBirth.includes('T')) {
      // If it's an ISO string, slice to yyyy-MM-dd
      row.dateOfBirth = row.dateOfBirth.slice(0, 10);
    }
    
    res.json(row);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ message: 'Error fetching customer', error: err.message });
  }
};

// Update customer
exports.updateCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, whatsapp, viber, email, address, dateOfBirth, paid, due, credit, status, purchases } = req.body;
    
    // Validate required fields
    if (!name || !contact || !dateOfBirth || !status) {
      return res.status(400).json({ message: 'Missing required fields: name, contact, dateOfBirth, status' });
    }
    
    // Format phone number consistently
    const formattedContact = formatPhoneNumber(contact);
    
    // Fix: Ensure purchases is stringified if it's an object/array
    let purchasesJson = '[]';
    if (Array.isArray(purchases) || typeof purchases === 'object') {
      purchasesJson = JSON.stringify(purchases);
    } else if (typeof purchases === 'string') {
      purchasesJson = purchases;
    }
    
    // Fix: Ensure dateOfBirth is yyyy-MM-dd string
    let dateOfBirthStr = dateOfBirth;
    if (dateOfBirth instanceof Date) {
      const yyyy = dateOfBirth.getFullYear();
      const mm = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
      const dd = String(dateOfBirth.getDate()).padStart(2, '0');
      dateOfBirthStr = `${yyyy}-${mm}-${dd}`;
    } else if (typeof dateOfBirth === 'string' && dateOfBirth.includes('T')) {
      dateOfBirthStr = dateOfBirth.slice(0, 10);
    }
    
    const [result] = await db.execute(
      'UPDATE customers SET name=?, contact=?, whatsapp=?, viber=?, email=?, address=?, dateOfBirth=?, paid=?, due=?, credit=?, status=?, purchases=? WHERE id=?',
      [name, formattedContact, !!whatsapp, !!viber, email || '', address || '', dateOfBirthStr, paid || 0, due || 0, credit || 0, status, purchasesJson, id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
    
    res.json({ 
      message: 'Customer updated successfully',
      formattedContact: formattedContact 
    });
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ message: 'Error updating customer', error: err.message });
  }
};

// Delete customer
exports.deleteCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM customers WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ message: 'Error deleting customer', error: err.message });
  }
};