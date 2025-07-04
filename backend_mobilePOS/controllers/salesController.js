const db = require('../db');

// Create a new sales detail
exports.createSalesDetail = async (req, res) => {
  try {
    let { date, customer, items, total } = req.body;
    if (!date || !customer || !items || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Accept both mm-dd-yyyy and yyyy-mm-dd, convert to yyyy-mm-dd for MySQL
    const mmddyyyyRegex = /^\d{2}-\d{2}-\d{4}$/;
    const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (mmddyyyyRegex.test(date)) {
      // Convert mm-dd-yyyy to yyyy-mm-dd
      const [mm, dd, yyyy] = date.split('-');
      date = `${yyyy}-${mm}-${dd}`;
    } else if (!yyyymmddRegex.test(date)) {
      return res.status(400).json({ message: 'Date must be in YYYY-MM-DD or MM-DD-YYYY format' });
    }
    // --- KEY FIX: Do NOT convert or manipulate the date further ---
    // Just insert as string, let MySQL DATE column store as-is

    // Validate items: must be array of {name, quantity}
    if (!Array.isArray(items) || items.some(item => !item.name || typeof item.quantity !== 'number')) {
      return res.status(400).json({ message: 'Each item must have name and quantity' });
    }
    // Ensure total is a valid number
    if (isNaN(Number(total))) {
      return res.status(400).json({ message: 'Total must be a valid number' });
    }
    const itemsJson = JSON.stringify(items);
    const [result] = await db.execute(
      'INSERT INTO sales_details (date, customer, items, total) VALUES (?, ?, ?, ?)',
      [date, customer, itemsJson, total]
    );
    res.status(201).json({ id: result.insertId, date, customer, items, total });
  } catch (err) {
    // Log the error for debugging
    console.error('Error in createSalesDetail:', err);
    res.status(500).json({ message: 'Error creating sales detail', error: err.message });
  }
};

// Get all sales details
exports.getAllSalesDetails = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM sales_details ORDER BY id DESC');
    const data = rows.map(row => {
      let items = [];
      try {
        items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
      } catch (e) {
        items = [];
      }
      // Fix: Always return date as stored in DB (no conversion, no slicing)
      // If row.date is a Date object, convert to YYYY-MM-DD using getFullYear/getMonth/getDate
      let date = row.date;
      if (date instanceof Date) {
        // MySQL DATE fields may come as JS Date objects, so format as YYYY-MM-DD
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        date = `${yyyy}-${mm}-${dd}`;
      }
      // If it's already a string, just use as is (no slice)
      return {
        ...row,
        date,
        items
      };
    });
    res.json(data);
  } catch (err) {
    console.error('Error in getAllSalesDetails:', err);
    res.status(500).json({ message: 'Error fetching sales details', error: err.message });
  }
};

// Get sales detail by id
exports.getSalesDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM sales_details WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Sales detail not found' });
    }
    const row = rows[0];
    row.items = JSON.parse(row.items);
    res.json(row);
  } catch (err) {
    console.error('Error in getSalesDetailById:', err);
    res.status(500).json({ message: 'Error fetching sales detail', error: err.message });
  }
};

// Delete sales detail by id
exports.deleteSalesDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM sales_details WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sales detail not found' });
    }
    res.json({ message: 'Sales detail deleted' });
  } catch (err) {
    console.error('Error in deleteSalesDetailById:', err);
    res.status(500).json({ message: 'Error deleting sales detail', error: err.message });
  }
};

// Update sales detail by id
exports.updateSalesDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    let { date, customer, items, total } = req.body;
    if (!date || !customer || !items || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Accept both mm-dd-yyyy and yyyy-mm-dd, convert to yyyy-mm-dd for MySQL
    const mmddyyyyRegex = /^\d{2}-\d{2}-\d{4}$/;
    const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (mmddyyyyRegex.test(date)) {
      const [mm, dd, yyyy] = date.split('-');
      date = `${yyyy}-${mm}-${dd}`;
    } else if (!yyyymmddRegex.test(date)) {
      return res.status(400).json({ message: 'Date must be in YYYY-MM-DD or MM-DD-YYYY format' });
    }
    if (!Array.isArray(items) || items.some(item => !item.name || typeof item.quantity !== 'number')) {
      return res.status(400).json({ message: 'Each item must have name and quantity' });
    }
    if (isNaN(Number(total))) {
      return res.status(400).json({ message: 'Total must be a valid number' });
    }
    const itemsJson = JSON.stringify(items);
    const [result] = await db.execute(
      'UPDATE sales_details SET date = ?, customer = ?, items = ?, total = ? WHERE id = ?',
      [date, customer, itemsJson, total, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sales detail not found' });
    }
    res.json({ id, date, customer, items, total });
  } catch (err) {
    console.error('Error in updateSalesDetailById:', err);
    res.status(500).json({ message: 'Error updating sales detail', error: err.message });
  }
};
