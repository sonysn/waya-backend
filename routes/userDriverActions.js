const express = require('express');
const { addCar, getDriverCars, ensureToken } = require('../controllers/userDriverAction');

const router = express.Router();

router.post('/newdrivercar', addCar);
router.get('/:driver/getdrivercars',  ensureToken, getDriverCars);

module.exports = router;