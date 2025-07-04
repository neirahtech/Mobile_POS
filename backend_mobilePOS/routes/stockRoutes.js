const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// POST /api/stock-details
router.post('/stock-details', stockController.createStockDetail);

// GET /api/stock-details
router.get('/stock-details', stockController.getAllStockDetails);

// GET /api/stock-details/:id
router.get('/stock-details/:id', stockController.getStockDetailById);

// DELETE /api/stock-details/:id
router.delete('/stock-details/:id', stockController.deleteStockDetailById);

module.exports = router;
