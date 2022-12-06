const express = require('express');
const { addCar, getDriverCars } = require('../controllers/userDriverAction');

const router = express.Router();

router.post('/newdrivercar', addCar);
router.get('/:driver/getdrivercars', getDriverCars);

module.exports = router;