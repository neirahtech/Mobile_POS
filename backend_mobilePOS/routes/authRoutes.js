const express = require('express');
const { register , login} = require('../controllers/authController');
const router = express.Router();  

router.post('/register', register); // Register route
router.post('/login', login); // Login route
module.exports = router; // Export the router for use in the main app