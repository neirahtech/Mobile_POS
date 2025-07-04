const db = require("../db");

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    // Check if category already exists
    const [existing] = await db.query("SELECT id FROM categories WHERE name = ?", [name]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Category already exists" });
    }
    // Insert new category
    await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
    const [newCategory] = await db.query("SELECT * FROM categories WHERE id = LAST_INSERT_ID()");
    res.status(201).json({ 
      category: {
        id: newCategory[0].id,
        name: newCategory[0].name
      }
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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
