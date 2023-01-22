const express = require('express');
const { addCar, getDriverCars, ensureToken, locationUpdate } = require('../controllers/userDriverAction');

const router = express.Router();

router.post('/newdrivercar', addCar);
router.get('/:driver/getdrivercars',  ensureToken, getDriverCars);
router.post('/:driverID/updatecurrentlocation', locationUpdate);

module.exports = router;