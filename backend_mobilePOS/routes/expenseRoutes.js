const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const multer = require('multer');
const path = require('path');

// Set up multer for receipt uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// CRUD routes
router.post('/', upload.single('receipt'), expenseController.createExpense);
router.get('/', expenseController.getAllExpenses);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', upload.single('receipt'), expenseController.updateExpenseById);
router.delete('/:id', expenseController.deleteExpenseById);

module.exports = router;
