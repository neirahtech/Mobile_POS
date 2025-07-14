const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// Branches CRUD
router.get('/branches', branchController.getBranches);
router.post('/branches', branchController.addBranch);
router.put('/branches/:id', branchController.updateBranch);
router.delete('/branches/:id', branchController.deleteBranch);
router.patch('/branches/:id/toggle', branchController.toggleBranch);

module.exports = router;
