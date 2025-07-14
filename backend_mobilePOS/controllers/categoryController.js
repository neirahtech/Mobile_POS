const db = require("../db");

const addCategory = async (req, res) => {
  try {
    let { name, branch_id } = req.body;
    console.log('Add Category request body:', req.body);
    console.log('Type of branch_id:', typeof branch_id, 'Value:', branch_id);

    // Defensive: log all request headers and body for debugging
    console.log('Headers:', req.headers);

    if (!name || branch_id === undefined || branch_id === null || branch_id === '') {
      return res.status(400).json({ message: "Category name and branch_id are required" });
    }
    // Convert branch_id to integer and check again
    branch_id = Number(branch_id);
    console.log('branch_id after Number():', branch_id, 'Type:', typeof branch_id);
    if (!Number.isInteger(branch_id) || branch_id <= 0) {
      return res.status(400).json({ message: "branch_id must be a valid positive integer" });
    }

    // Debug: check SQL connection and table structure
    try {
      const [columns] = await db.query("SHOW COLUMNS FROM categories");
      console.log('Categories table columns:', columns);
    } catch (tableErr) {
      console.error('Error inspecting categories table:', tableErr);
      return res.status(500).json({ message: "Database table error", error: tableErr.message });
    }

    // Check if category already exists in the same branch
    const [existing] = await db.query(
      "SELECT id FROM categories WHERE name = ? AND branch_id = ?",
      [name, branch_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Category already exists in this branch" });
    }
    // Insert new category
    try {
      await db.query("INSERT INTO categories (name, branch_id) VALUES (?, ?)", [name, branch_id]);
      const [newCategory] = await db.query("SELECT * FROM categories WHERE id = LAST_INSERT_ID()");
      res.status(201).json({ 
        category: {
          id: newCategory[0].id,
          name: newCategory[0].name
        }
      });
    } catch (sqlError) {
      console.error('SQL error during insert:', sqlError);
      // If duplicate entry, show a clear message
      if (sqlError.code === 'ER_DUP_ENTRY') {
        // This error only happens if you have a UNIQUE constraint on (name, branch_id)
        return res.status(400).json({ message: "Category already exists in this branch (unique constraint)" });
      }
      // If table or column does not exist
      if (sqlError.code === 'ER_NO_SUCH_TABLE' || sqlError.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({ message: "Database schema error: " + sqlError.message });
      }
      return res.status(500).json({ message: "Database error", error: sqlError.message });
    }
  } catch (error) {
    console.error("Error adding category:", error);
    if (error.stack) console.error(error.stack);
    // Log the error object for full details
    console.error('Full error object:', error);
    res.status(500).json({ message: "Internal server error", error: error.message, stack: error.stack });
  }
};

const getCategories = async (req, res) => {
  try {
    // Try to get branch_id from query, body, or params, default to 1 if not provided
    const branch_id = req.query.branch_id || req.body.branch_id || req.params.branch_id || 1;
    
    console.log('Fetching categories for branch_id:', branch_id);
    
    const [categories] = await db.query("SELECT * FROM categories WHERE branch_id = ?", [branch_id]);
    console.log('Categories found:', categories.length);
    
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Category ID is required" });
    }
    
    // Check if category exists
    const [existing] = await db.query("SELECT id FROM categories WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Delete the category (no item relation check)
    await db.query("DELETE FROM categories WHERE id = ?", [id]);
    
    res.json({ 
      success: true,
      message: "Category deleted successfully" 
    });
    
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

module.exports = { addCategory, getCategories, deleteCategory };
