const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// CRUD routes
router.post('/', supplierController.createSupplier);
router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.put('/:id', supplierController.updateSupplierById);
router.delete('/:id', supplierController.deleteSupplierById);

module.exports = router;
