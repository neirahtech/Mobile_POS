const express = require('express');
const router = express.Router();
const returnsRefundsController = require('../controllers/returnsRefundsController');

router.post('/', returnsRefundsController.createReturnRefund);
router.get('/', returnsRefundsController.getAllReturnsRefunds);
router.get('/:id', returnsRefundsController.getReturnRefundById);
router.put('/:id', returnsRefundsController.updateReturnRefundById);
router.delete('/:id', returnsRefundsController.deleteReturnRefundById);

module.exports = router;
