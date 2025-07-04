const db = require("../db");
const fs = require('fs');
const path = require('path');

// Create (POST) - Add new item
const addItem = async (req, res) => {
  try {
    // Sanitize req.body keys: trim whitespace from all keys
    const cleanBody = {};
    Object.entries(req.body).forEach(([key, value]) => {
      cleanBody[key.trim()] = value;
    });

    console.log("Sanitized body:", cleanBody);

    // Print all keys and values for troubleshooting
    Object.entries(cleanBody).forEach(([key, value]) => {
      console.log(`Key: "${key}" Value: "${value}"`);
    });

    // Fallback for item_name key variants, also trim spaces
    let item_name = cleanBody.item_name || cleanBody.Item_name || cleanBody.ItemName;
    if (item_name && typeof item_name === "string") item_name = item_name.trim();

    const {
      model_number,
      barcode,
      description,
      Category_name,
      variant_type,
      variant_option
    } = cleanBody;

    if (!item_name) {
      console.warn("item_name is missing from sanitized body. Received keys:", Object.keys(cleanBody));
    }

    // Validate required fields
    if (!item_name || !model_number || !Category_name) {
      return res.status(400).json({
        message: "item_name, model_number, and Category_name are required fields",
        receivedData: { item_name, model_number, Category_name }
      });
    }

    // Get image filename if uploaded
    const image = req.file ? req.file.filename : null;

    // Insert into database
    const [result] = await db.query(
      `INSERT INTO items 
       (item_name, model_number, barcode, description, Category_name, variant_type, variant_option, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [item_name, model_number, barcode, description, Category_name, variant_type, variant_option, image]
    );

    console.log(`Item saved: ${item_name} (${model_number}) in category ${Category_name}`);

    res.status(201).json({
      message: "Item created successfully",
      itemId: result.insertId
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ 
      message: "Failed to create item", 
      error: error.message
    });
  }
};

// Read (GET) - Get all items
const getAllItems = async (req, res) => {
  try {
    // Join items with categories to get the category name
    const [items] = await db.query(`
      SELECT 
        i.*, 
        c.name AS category_name
      FROM items i
      LEFT JOIN categories c ON i.Category_name = c.id
    `);

    // Only use the filename for image, not the full path
    const formattedItems = items.map(item => ({
      ...item,
      image: item.image ? item.image : null // just the filename
    }));

    res.json({ items: formattedItems });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ 
      message: 'Failed to fetch items',
      error: error.message 
    });
  }
};

// Read (GET) - Get item by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    // Join with categories to get category_name
    const [items] = await db.query(`
      SELECT 
        i.*, 
        c.name AS category_name
      FROM items i
      LEFT JOIN categories c ON i.Category_name = c.id
      WHERE i.id = ?
    `, [id]);
    
    if (items.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Return image as just the filename (not /uploads/filename)
    const item = {
      ...items[0],
      image: items[0].image ? items[0].image : null
    };

    res.status(200).json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update (PUT) - Update item by ID
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item_name,
      model_number,
      barcode,
      description,
      Category_name,
      variant_type,
      variant_option
    } = req.body;

    // Get the current item to check if it exists and get its current image
    const [existingItems] = await db.query("SELECT * FROM items WHERE id = ?", [id]);
    if (existingItems.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Handle image update
    let image = existingItems[0].image; // Keep existing image by default
    if (req.file) {
      // If new image uploaded, delete old image and update
      if (existingItems[0].image) {
        const oldImagePath = path.join(__dirname, '../uploads', existingItems[0].image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Error deleting old image file:", err);
        });
      }
      image = req.file.filename;
    }

    await db.query(
      `UPDATE items SET 
        item_name = ?, 
        model_number = ?, 
        barcode = ?, 
        description = ?, 
        Category_name = ?, 
        variant_type = ?, 
        variant_option = ?, 
        image = ?
      WHERE id = ?`,
      [
        item_name,
        model_number,
        barcode,
        description,
        Category_name,
        variant_type,
        variant_option,
        image,
        id
      ]
    );

    res.status(200).json({ 
      message: "Item updated successfully",
      item: {
        id,
        item_name,
        model_number,
        barcode,
        description,
        Category_name,
        variant_type,
        variant_option,
        image: image ? `/uploads/${image}` : null
      }
    });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete (DELETE) - Delete item by ID
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the item to check if it has an image
    const [items] = await db.query("SELECT image FROM items WHERE id = ?", [id]);
    if (items.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete the item
    await db.query("DELETE FROM items WHERE id = ?", [id]);

    // If item had an image, delete it from the uploads folder
    if (items[0].image) {
      const imagePath = path.join(__dirname, '../uploads', items[0].image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image file:", err);
      });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { addItem, getAllItems, getItemById, updateItem, deleteItem };