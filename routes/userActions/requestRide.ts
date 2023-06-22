import express from 'express';
const { requestRide, getTripsHistory, searchForDrivers, driverAcceptRide, getPrice, driverCount, getCurrentRide,
    driverGetCurrentRides, driverOnRideComplete, onRiderCancelledRide, rateDriver, 
    onDriverCancelledRide, getRiderTripHistory, getDriverTripHistory } = require('../../controllers/userActions/requestRide');
const { ensureToken } = require('../../controllers/userAuth');
import { checkAuthorization } from '../../controllers/auth';

const router = express.Router();

router.post('/requestride', checkAuthorization, requestRide, searchForDrivers);
router.post('/getRidePrice', getPrice);
router.get('/:userId/getridehistory', checkAuthorization, getTripsHistory);
router.post('/driverAcceptRide', checkAuthorization, driverAcceptRide);

//Ride information
router.get('/:locationData/driverCount', driverCount);
router.get('/:riderID/getCurrentRide', checkAuthorization, getCurrentRide);
router.get('/:driverID/driverGetCurrentRides', checkAuthorization, driverGetCurrentRides);
router.post('/driverOnRideComplete', checkAuthorization, driverOnRideComplete);

//Ride Cancellation or Ending
router.post('/:riderID/onRiderCancelledRide', checkAuthorization, onRiderCancelledRide);
router.post('/:driverID/onDriverCancelledRide', checkAuthorization, onDriverCancelledRide)

//Ratings
router.post('/:riderID/rateDriver', checkAuthorization, rateDriver);

//Trip Histories
router.get('/:riderID/getRiderTripHistory', checkAuthorization, getRiderTripHistory);
router.get('/:driverID/getDriverTripHistory', checkAuthorization, getDriverTripHistory);

module.exports = router;