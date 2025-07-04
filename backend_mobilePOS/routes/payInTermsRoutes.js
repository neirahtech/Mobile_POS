const express = require('express');
const router = express.Router();
const payInTermsController = require('../controllers/payInTermsController');

router.post('/', payInTermsController.createPayInTerms);
router.get('/', payInTermsController.getAllPayInTerms);
router.get('/:id', payInTermsController.getPayInTermsById);
router.put('/:id', payInTermsController.updatePayInTermsById);
router.delete('/:id', payInTermsController.deletePayInTermsById);

module.exports = router;
