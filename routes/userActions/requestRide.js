const express = require('express');
const { requestRide, getTripsHistory, searchForDrivers, driverAcceptRide, getPrice } = require('../../controllers/userActions/requestRide');
const { ensureToken } = require('../../controllers/userAuth');

const router = express.Router();

router.post('/requestride', ensureToken, requestRide, searchForDrivers);
router.post('/getRidePrice', getPrice);
router.get('/:userId/getridehistory', ensureToken, getTripsHistory);
router.post('/driverAcceptRide', driverAcceptRide);

module.exports = router;