const db = require("../db");

const getVariants = async (req, res) => {
  try {
    const [variants] = await db.query("SELECT * FROM variants ORDER BY variant_type, variant_option");
    
    // Group variants by type
    const groupedVariants = variants.reduce((acc, variant) => {
      if (!acc[variant.variant_type]) {
        acc[variant.variant_type] = [];
      }
      acc[variant.variant_type].push(variant.variant_option);
      return acc;
    }, {});

    res.json({
      types: Object.keys(groupedVariants),
      options: groupedVariants,
      variants
    });
  } catch (error) {
    console.error("Error fetching variants:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const addVariant = async (req, res) => {
  try {
    const { variant_type, variant_option } = req.body;
    if (!variant_type || !variant_option) {
      return res.status(400).json({ message: "variant_type and variant_option are required" });
    }
    // Check if variant already exists
    const [existing] = await db.query(
      "SELECT id FROM variants WHERE variant_type = ? AND variant_option = ?",
      [variant_type, variant_option]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Variant already exists" });
    }
    // Insert new variant
    const [result] = await db.query(
      "INSERT INTO variants (variant_type, variant_option) VALUES (?, ?)",
      [variant_type, variant_option]
    );
    res.status(201).json({ 
      message: "Variant added successfully",
      variant: {
        id: result.insertId,
        variant_type,
        variant_option
      }
    });
  } catch (error) {
    console.error("Error adding variant:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Variant ID is required" });
    }
    // Check if variant exists
    const [existing] = await db.query("SELECT id FROM variants WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Variant not found" });
    }
    // Delete variant
    await db.query("DELETE FROM variants WHERE id = ?", [id]);
    res.json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Error deleting variant:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { addVariant, getVariants, deleteVariant };
