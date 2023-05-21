const express = require('express');
const { addCar, getDriverCars, ensureToken, locationUpdatePing, availability } = require('../../controllers/userDriverActions/userDriverAction');

const router = express.Router();

router.post('/newdrivercar', addCar);
router.get('/:driver/getdrivercars',  ensureToken, getDriverCars);

router.post('/:driverID/currentLocationPing', locationUpdatePing);
router.post('/availability', availability);

module.exports = router;