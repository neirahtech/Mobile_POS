const express = require('express');
const router = express.Router();
const { getBillingSettings, setBillingSettings } = require('../controllers/billingSettingsController');

router.get('/billing-settings', getBillingSettings);
router.post('/billing-settings', setBillingSettings);

module.exports = router;
