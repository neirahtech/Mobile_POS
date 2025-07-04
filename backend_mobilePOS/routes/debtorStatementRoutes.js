const express = require('express');
const router = express.Router();
const debtorStatementController = require('../controllers/debtorStatementController');

router.post('/', debtorStatementController.createDebtorStatement);
router.get('/', debtorStatementController.getAllDebtorStatements);
router.get('/:id', debtorStatementController.getDebtorStatementById);
router.put('/:id', debtorStatementController.updateDebtorStatementById);
router.delete('/:id', debtorStatementController.deleteDebtorStatementById);

module.exports = router;
