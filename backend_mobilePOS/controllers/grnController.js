const db = require("../db");

// Create a new GRN (requires grn_id, one row per item)
const createGRN = async (req, res) => {
  try {
    const {
      grn_id,
      supplier_name,
      invoice_number,
      invoice_date,
      invoice_total,
      items // array of items
    } = req.body;

    if (!grn_id || !supplier_name || !invoice_number || !invoice_date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Missing required GRN fields or items" });
    }

    // Insert each item as a row in grn table, all with same grn_id
    for (const item of items) {
      await db.query(
        `INSERT INTO grn 
          (grn_id, supplier_name, invoice_number, invoice_date, invoice_total, item_code, item_name, cost_price, wholesale_price, retail_price, sale_discount, quantity, warranty, expiry, item_invoice_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          grn_id,
          supplier_name,
          invoice_number,
          invoice_date,
          invoice_total,
          item.code || null,
          item.productName || null,
          item.costPrice || 0,
          item.wholesalePrice || 0,
          item.retailPrice || 0,
          item.saleDiscount || 0,
          item.quantity || 0,
          item.warranty || null,
          item.expiry || null,
          item.invoiceTotal || 0
        ]
      );
    }

    res.status(201).json({ message: "GRN created successfully" });
  } catch (error) {
    console.error("Error creating GRN:", error);
    res.status(500).json({ message: "Failed to create GRN", error: error.message });
  }
};

// Get all GRNs (grouped by grn_id, with items as array)
const getAllGRNs = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM grn ORDER BY id DESC`
    );
    // Group by grn_id
    const grnMap = {};
    for (const row of rows) {
      const key = row.grn_id;
      if (!grnMap[key]) {
        grnMap[key] = {
          grn_id: row.grn_id,
          supplier_name: row.supplier_name,
          invoice_number: row.invoice_number,
          invoice_date: row.invoice_date,
          invoice_total: row.invoice_total,
          created_at: row.created_at,
          items: []
        };
      }
      grnMap[key].items.push({
        item_code: row.item_code,
        item_name: row.item_name,
        cost_price: row.cost_price,
        wholesale_price: row.wholesale_price,
        retail_price: row.retail_price,
        sale_discount: row.sale_discount,
        quantity: row.quantity,
        warranty: row.warranty,
        expiry: row.expiry,
        item_invoice_total: row.item_invoice_total
      });
    }
    res.json(Object.values(grnMap));
  } catch (error) {
    console.error("Error fetching GRNs:", error);
    res.status(500).json({ message: "Failed to fetch GRNs", error: error.message });
  }
};

// Get a single GRN by grn_id (with all items)
const getGRNById = async (req, res) => {
  try {
    const { grn_id } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM grn WHERE grn_id = ? ORDER BY id ASC`, [grn_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "GRN not found" });
    }
    const header = rows[0];
    const items = rows.map(row => ({
      item_code: row.item_code,
      item_name: row.item_name,
      cost_price: row.cost_price,
      wholesale_price: row.wholesale_price,
      retail_price: row.retail_price,
      sale_discount: row.sale_discount,
      quantity: row.quantity,
      warranty: row.warranty,
      expiry: row.expiry,
      item_invoice_total: row.item_invoice_total
    }));
    res.json({
      grn_id: header.grn_id,
      supplier_name: header.supplier_name,
      invoice_number: header.invoice_number,
      invoice_date: header.invoice_date,
      invoice_total: header.invoice_total,
      created_at: header.created_at,
      items
    });
  } catch (error) {
    console.error("Error fetching GRN:", error);
    res.status(500).json({ message: "Failed to fetch GRN", error: error.message });
  }
};

// Update a GRN (delete all rows for grn_id, then insert new ones)
const updateGRN = async (req, res) => {
  try {
    const { grn_id } = req.params;
    const {
      supplier_name,
      invoice_number,
      invoice_date,
      invoice_total,
      items
    } = req.body;

    // Check if GRN exists
    const [rows] = await db.query(`SELECT * FROM grn WHERE grn_id = ?`, [grn_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "GRN not found" });
    }

    // Delete all rows for this grn_id
    await db.query(`DELETE FROM grn WHERE grn_id = ?`, [grn_id]);

    // Insert new rows
    for (const item of items) {
      await db.query(
        `INSERT INTO grn 
          (grn_id, supplier_name, invoice_number, invoice_date, invoice_total, item_code, item_name, cost_price, wholesale_price, retail_price, sale_discount, quantity, warranty, expiry, item_invoice_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          grn_id,
          supplier_name,
          invoice_number,
          invoice_date,
          invoice_total,
          item.code || null,
          item.productName || null,
          item.costPrice || 0,
          item.wholesalePrice || 0,
          item.retailPrice || 0,
          item.saleDiscount || 0,
          item.quantity || 0,
          item.warranty || null,
          item.expiry || null,
          item.invoiceTotal || 0
        ]
      );
    }

    res.json({ message: "GRN updated successfully" });
  } catch (error) {
    console.error("Error updating GRN:", error);
    res.status(500).json({ message: "Failed to update GRN", error: error.message });
  }
};

// Delete a GRN (delete all rows for grn_id)
const deleteGRN = async (req, res) => {
  try {
    const { grn_id } = req.params;
    const [rows] = await db.query(`SELECT * FROM grn WHERE grn_id = ?`, [grn_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "GRN not found" });
    }
    await db.query(`DELETE FROM grn WHERE grn_id = ?`, [grn_id]);
    res.json({ message: "GRN deleted successfully" });
  } catch (error) {
    console.error("Error deleting GRN:", error);
    res.status(500).json({ message: "Failed to delete GRN", error: error.message });
  }
};

module.exports = { createGRN, getAllGRNs, getGRNById, updateGRN, deleteGRN };


