const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// POST /sales-details
router.post('/sales-details', salesController.createSalesDetail);

// GET /sales-details
router.get('/sales-details', salesController.getAllSalesDetails);

// GET /sales-details/:id
router.get('/sales-details/:id', salesController.getSalesDetailById);

// DELETE /sales-details/:id
router.delete('/sales-details/:id', salesController.deleteSalesDetailById);

// PUT /sales-details/:id
router.put('/sales-details/:id', salesController.updateSalesDetailById);

module.exports = router;
