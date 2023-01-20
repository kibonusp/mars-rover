const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movement');

router.post('/movement', movementController.saveMovement);

module.exports = router;