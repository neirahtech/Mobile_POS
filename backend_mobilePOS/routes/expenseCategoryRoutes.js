const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/expenseCategoryController');
const { authenticate } = require('../middleware/auth');

// Get all categories
router.get('/', authenticate, categoryController.getAllCategories);

// Create a new category
router.post('/', authenticate, categoryController.createCategory);

// Update a category
router.put('/:id', authenticate, categoryController.updateCategory);

// Delete a category
router.delete('/:id', authenticate, categoryController.deleteCategory);

module.exports = router;
