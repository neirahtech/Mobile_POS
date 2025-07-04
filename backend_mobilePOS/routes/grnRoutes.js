const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /grn - create a new GRN (multiple rows, one per item)
router.post("/", async (req, res) => {
  const {
    grn_id,
    supplier_name,
    invoice_number,
    invoice_date,
    invoice_total,
    items,
  } = req.body;

  if (
    !grn_id ||
    !supplier_name ||
    !invoice_number ||
    !invoice_date ||
    !invoice_total ||
    !Array.isArray(items)
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields or items array." });
  }

  try {
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
          item.item_code,
          item.item_name,
          item.cost_price,
          item.wholesale_price,
          item.retail_price,
          item.sale_discount,
          item.quantity,
          item.warranty,
          item.expiry,
          item.item_invoice_total,
        ]
      );
    }
    res.status(201).json({ message: "GRN created", grn_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// GET /grn - list all GRNs grouped by grn_id
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM grn ORDER BY created_at DESC");
    // Group by grn_id
    const grouped = {};
    for (const row of rows) {
      const key = row.grn_id; // <-- group by grn_id, not invoice_number
      if (!grouped[key]) {
        grouped[key] = {
          grn_id: row.grn_id,
          supplier_name: row.supplier_name,
          invoice_number: row.invoice_number,
          invoice_date: row.invoice_date,
          invoice_total: row.invoice_total,
          created_at: row.created_at,
          items: [],
        };
      }
      grouped[key].items.push({
        item_code: row.item_code,
        item_name: row.item_name,
        cost_price: row.cost_price,
        wholesale_price: row.wholesale_price,
        retail_price: row.retail_price,
        sale_discount: row.sale_discount,
        quantity: row.quantity,
        warranty: row.warranty,
        expiry: row.expiry,
        item_invoice_total: row.item_invoice_total,
      });
    }
    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// GET /grn/:grn_id - get single GRN by grn_id
router.get("/:grn_id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM grn WHERE grn_id = ?", [
      req.params.grn_id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "GRN not found" });

    const grn = {
      grn_id: rows[0].grn_id,
      supplier_name: rows[0].supplier_name,
      invoice_number: rows[0].invoice_number,
      invoice_date: rows[0].invoice_date,
      invoice_total: rows[0].invoice_total,
      created_at: rows[0].created_at,
      items: rows.map((row) => ({
        item_code: row.item_code,
        item_name: row.item_name,
        cost_price: row.cost_price,
        wholesale_price: row.wholesale_price,
        retail_price: row.retail_price,
        sale_discount: row.sale_discount,
        quantity: row.quantity,
        warranty: row.warranty,
        expiry: row.expiry,
        item_invoice_total: row.item_invoice_total,
      })),
    };
    res.json(grn);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// PUT /grn/:grn_id - update a GRN (delete old, insert new)
router.put("/:grn_id", async (req, res) => {
  const {
    supplier_name,
    invoice_number,
    invoice_date,
    invoice_total,
    items,
    grn_id,
  } = req.body;

  if (
    !grn_id ||
    !supplier_name ||
    !invoice_number ||
    !invoice_date ||
    !invoice_total ||
    !Array.isArray(items)
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields or items array." });
  }

  try {
    // Delete old rows
    await db.query("DELETE FROM grn WHERE grn_id = ?", [
      req.params.grn_id,
    ]);
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
          item.item_code,
          item.item_name,
          item.cost_price,
          item.wholesale_price,
          item.retail_price,
          item.sale_discount,
          item.quantity,
          item.warranty,
          item.expiry,
          item.item_invoice_total,
        ]
      );
    }
    res.json({ message: "GRN updated", grn_id });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// DELETE /grn/:grn_id - delete a GRN
router.delete("/:grn_id", async (req, res) => {
  try {
    await db.query("DELETE FROM grn WHERE grn_id = ?", [
      req.params.grn_id,
    ]);
    res.json({ message: "GRN deleted" });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

module.exports = router;
