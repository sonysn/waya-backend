const express = require('express');
const { addCar, getDriverCars, ensureToken, locationUpdate, availability } = require('../../controllers/userDriverActions/userDriverAction');

const router = express.Router();

router.post('/newdrivercar', addCar);
router.get('/:driver/getdrivercars',  ensureToken, getDriverCars);
router.post('/:driverID/updatecurrentlocation', locationUpdate);
router.post('/availability', availability);

module.exports = router;