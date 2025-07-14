const db = require('../db');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Add a user
exports.addUser = async (req, res) => {
  try {
    const { name, username, email, role, branchCode } = req.body;
    if (!name || !username || !email || !role || !branchCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    await db.query(
      'INSERT INTO users (name, username, email, role, branchCode) VALUES (?, ?, ?, ?, ?)',
      [name, username, email, role, branchCode]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error adding user:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add user' });
    }
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, email, role, branchCode } = req.body;
    if (!name || !username || !email || !role || !branchCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    await db.query(
      'UPDATE users SET name=?, username=?, email=?, role=?, branchCode=? WHERE id=?',
      [name, username, email, role, branchCode, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};


