const db = require('../db');

// Get all notification templates
exports.getAllTemplates = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM notification_templates ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching templates', error: err.message });
  }
};

// Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM notification_templates WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching template', error: err.message });
  }
};

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const { name, type, triggerEvent, message, status } = req.body;
    
    if (!name || !type || !triggerEvent || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO notification_templates (name, type, trigger_event, template_text, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, type, triggerEvent, message, status !== false]
    );
    
    const [newTemplate] = await db.execute('SELECT * FROM notification_templates WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newTemplate[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error creating template', error: err.message });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, triggerEvent, message, status } = req.body;
    
    if (!name || !type || !triggerEvent || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    await db.execute(
      'UPDATE notification_templates SET name = ?, type = ?, trigger_event = ?, template_text = ?, is_active = ? WHERE id = ?',
      [name, type, triggerEvent, message, status !== false, id]
    );
    
    const [updatedTemplate] = await db.execute('SELECT * FROM notification_templates WHERE id = ?', [id]);
    
    if (updatedTemplate.length === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(updatedTemplate[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error updating template', error: err.message });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute('DELETE FROM notification_templates WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting template', error: err.message });
  }
};
