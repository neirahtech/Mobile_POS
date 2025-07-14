const db = require('../db');

// Get all branches
exports.getBranches = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM branches');
  res.json(rows);
};

// Add a branch
exports.addBranch = async (req, res) => {
  try {
    console.log('POST /branches - Received body:', req.body);
    const { name, code, address, tel, manager, active } = req.body;
    if (!name || !code || !address || !tel || !manager || typeof active === 'undefined') {
      return res.status(400).json({ error: `Missing required fields: name=${name}, code=${code}, address=${address}, tel=${tel}, manager=${manager}, active=${active}` });
    }
    const activeValue = (active === true || active === "true") ? 1 : 0;
    await db.query(
      'INSERT INTO branches (name, code, address, tel, manager, active) VALUES (?, ?, ?, ?, ?, ?)',
      [name, code, address, tel, manager, activeValue]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error in addBranch:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a branch
exports.updateBranch = async (req, res) => {
  try {
    console.log('PUT /branches/:id - Received body:', req.body);
    const { id } = req.params;
    const { name, code, address, tel, manager, active } = req.body;
    if (!name || !code || !address || !tel || !manager || typeof active === 'undefined') {
      return res.status(400).json({ error: `Missing required fields: name=${name}, code=${code}, address=${address}, tel=${tel}, manager=${manager}, active=${active}` });
    }
    const activeValue = (active === true || active === "true") ? 1 : 0;
    await db.query(
      'UPDATE branches SET name=?, code=?, address=?, tel=?, manager=?, active=? WHERE id=?',
      [name, code, address, tel, manager, activeValue, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error in updateBranch:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a branch
exports.deleteBranch = async (req, res) => {
  try {
    console.log('DELETE /branches/:id - Received id:', req.params.id);
    const { id } = req.params;
    await db.query('DELETE FROM branches WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error in deleteBranch:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle branch status
exports.toggleBranch = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  await db.query('UPDATE branches SET active=? WHERE id=?', [active, id]);
  res.json({ success: true });
};
