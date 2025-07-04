const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');

// Read (GET) - Get item by ID
router.get('/items/:id', itemsController.getItemById);

module.exports = router;