const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/workers', userController.getUsers);
router.post('/workers', userController.addUser);
router.put('/workers/:id', userController.updateUser);
router.delete('/workers/:id', userController.deleteUser);

module.exports = router;
