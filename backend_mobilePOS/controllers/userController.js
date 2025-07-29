const db = require('../db');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    // Select all necessary fields including contact
    const [rows] = await db.query('SELECT id, name, email, contact, role, branchCode FROM workers');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', {
      message: err.message,
      code: err.code,
      sql: err.sql,
      sqlMessage: err.sqlMessage
    });
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Add a user
exports.addUser = async (req, res) => {
  try {
    const { name, email, role, branchCode } = req.body;
    
    // Validate required fields
    if (!name || !email || !role || !branchCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM workers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Insert new user (without password for now)
    await db.query(
      'INSERT INTO workers (name, email, role, branchCode) VALUES (?, ?, ?, ?)',
      [name, email, role, branchCode]
    );
    
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ 
      error: 'Failed to add user',
      message: err.message,
      code: err.code
    });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, contact, role, branchCode } = req.body;
    
    // Validate required fields
    if (!name || !email || !role || !branchCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email is being changed to an existing one
    const [existing] = await db.query(
      'SELECT id FROM workers WHERE email = ? AND id != ?', 
      [email, id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Update user with contact field
    await db.query(
      'UPDATE workers SET name = ?, email = ?, contact = ?, role = ?, branchCode = ? WHERE id = ?',
      [name, email, contact || null, role, branchCode, id]
    );
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', {
      message: err.message,
      code: err.code,
      sql: err.sql,
      sqlMessage: err.sqlMessage
    });
    res.status(500).json({ 
      error: 'Failed to update user',
      message: err.message
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM workers WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};


