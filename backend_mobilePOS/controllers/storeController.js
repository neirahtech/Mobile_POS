const db = require('../db');
const path = require('path');
const fs = require('fs');

// Store Info
exports.getStoreInfo = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM store_info LIMIT 1');
    const storeInfo = rows[0] || {};
    
    // Handle logo path - ensure it's just the filename
    if (storeInfo.logo) {
      // Remove any existing /uploads/ prefix to avoid duplication
      storeInfo.logo = storeInfo.logo.replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
        .replace(/^uploads\//, ''); // Remove any uploads/ prefix
    }
    
    res.json(storeInfo);
  } catch (error) {
    console.error('Error getting store info:', error);
    res.status(500).json({ error: 'Failed to get store info' });
  }
};

exports.updateStoreInfo = async (req, res) => {
  try {
    const { name, code, email, businessType } = req.body;
    
    // Get current store info to handle logo updates
    const [currentStore] = await db.query('SELECT * FROM store_info WHERE id = 1');
    let logo = currentStore[0]?.logo || null;

    // Handle file upload if present
    if (req.file && req.file.filename) {
      // Delete old logo if it exists
      if (logo) {
        // Remove /uploads/ prefix if present for file system operations
        const cleanLogoPath = logo.startsWith('/uploads/') ? logo.substring(8) : logo;
        const oldLogoPath = path.join(__dirname, '../uploads', cleanLogoPath);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      logo = req.file.filename; // Store just the filename in the database
    }

    if (!name || !code || !email || !businessType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await db.query(
      `UPDATE store_info SET name = ?, code = ?, email = ?, businessType = ?, logo = ? WHERE id = 1`,
      [name, code, email, businessType, logo]
    );

    // Get updated store info
    const [updatedStore] = await db.query('SELECT * FROM store_info WHERE id = 1');
    const updatedStoreInfo = updatedStore[0] || {};
    
    // Clean up logo path to ensure consistency
    if (updatedStoreInfo.logo) {
      // Remove any existing /uploads/ prefix and extra slashes
      updatedStoreInfo.logo = updatedStoreInfo.logo
        .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
        .replace(/^uploads\//, ''); // Remove any uploads/ prefix
    }

    res.json({ 
      success: true, 
      store: updatedStoreInfo 
    });
  } catch (error) {
    console.error('Error updating store info:', error);
    res.status(500).json({ error: 'Failed to update store info' });
  }
};

exports.setActiveBranch = async (req, res) => {
  const { branchId } = req.body;
  await db.query('UPDATE store_info SET activeBranchId=? WHERE id=1', [branchId]);
  res.json({ success: true });
};
