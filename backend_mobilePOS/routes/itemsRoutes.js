const express = require('express');
const router = express.Router();
const { addItem, getAllItems, getItemById, deleteItem, updateItem } = require('../controllers/itemsController');
const upload = require('../middleware/fileupload');

// Create new item with file upload
router.post('/', upload.single('image'), addItem);

// Get all items
router.get('/', getAllItems);

// Get item by ID
router.get('/:id', getItemById);

// Delete item by ID
router.delete('/:id', deleteItem);

// Update item by ID with file upload
router.put('/:id', upload.single('image'), updateItem);

module.exports = router;
