const express = require('express');
const { requestRide, getTripsHistory, searchForDrivers, driverAcceptRide, getPrice, driverCount, getCurrentRide,
    driverGetCurrentRides, driverOnRideComplete } = require('../../controllers/userActions/requestRide');
const { ensureToken } = require('../../controllers/userAuth');

const router = express.Router();

router.post('/requestride', ensureToken, requestRide, searchForDrivers);
router.post('/getRidePrice', getPrice);
router.get('/:userId/getridehistory', ensureToken, getTripsHistory);
router.post('/driverAcceptRide', driverAcceptRide);
router.get('/:locationData/driverCount', driverCount);
router.get('/:riderID/getCurrentRide', getCurrentRide);
router.get('/:driverID/driverGetCurrentRides', driverGetCurrentRides);
router.post('/driverOnRideComplete', driverOnRideComplete);

module.exports = router;