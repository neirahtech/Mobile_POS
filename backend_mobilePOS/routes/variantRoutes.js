const express = require('express');
const router = express.Router();
const { addVariant, getVariants, deleteVariant } = require('../controllers/variantController');

router.get('/', getVariants);
router.post('/', addVariant);
router.delete('/:id', deleteVariant);

module.exports = router;
