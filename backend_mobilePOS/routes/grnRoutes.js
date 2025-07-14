const express = require("express");
const router = express.Router();
const grnController = require('../controllers/grnController');

// Use controller methods for all routes to ensure consistency
router.post("/", grnController.createGRN);
router.get("/", grnController.getAllGRNs);
router.get("/:grn_id", grnController.getGRNById);
router.put("/:grn_id", grnController.updateGRN);
router.delete("/:grn_id", grnController.deleteGRN);

module.exports = router;