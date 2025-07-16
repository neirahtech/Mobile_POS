const db = require('../db');

// Get all expense categories
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM expense_categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Error in getAllCategories:', err);
    res.status(500).json({ message: 'Error fetching categories', error: err.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO expense_categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    
    res.status(201).json({
      id: result.insertId,
      name,
      description: description || null
    });
  } catch (err) {
    console.error('Error in createCategory:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: 'Error creating category', error: err.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const [result] = await db.execute(
      'UPDATE expense_categories SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ id: parseInt(id), name, description: description || null });
  } catch (err) {
    console.error('Error in updateCategory:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: 'Error updating category', error: err.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, update expenses that use this category to set category to 'Other'
    await db.execute(
      'UPDATE expenses SET category = ? WHERE category = (SELECT name FROM expense_categories WHERE id = ?)',
      ['Other', id]
    );
    
    // Then delete the category
    const [result] = await db.execute('DELETE FROM expense_categories WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error in deleteCategory:', err);
    res.status(500).json({ message: 'Error deleting category', error: err.message });
  }
};
