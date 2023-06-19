"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { requestRide, getTripsHistory, searchForDrivers, driverAcceptRide, getPrice, driverCount, getCurrentRide, driverGetCurrentRides, driverOnRideComplete, onRiderCancelledRide, rateDriver, onDriverCancelledRide, getRiderTripHistory, getDriverTripHistory } = require('../../controllers/userActions/requestRide');
const { ensureToken } = require('../../controllers/userAuth');
const router = express_1.default.Router();
router.post('/requestride', ensureToken, requestRide, searchForDrivers);
router.post('/getRidePrice', getPrice);
router.get('/:userId/getridehistory', ensureToken, getTripsHistory);
router.post('/driverAcceptRide', driverAcceptRide);
//Ride information
router.get('/:locationData/driverCount', driverCount);
router.get('/:riderID/getCurrentRide', getCurrentRide);
router.get('/:driverID/driverGetCurrentRides', driverGetCurrentRides);
router.post('/driverOnRideComplete', driverOnRideComplete);
//Ride Cancellation or Ending
router.post('/:riderID/onRiderCancelledRide', onRiderCancelledRide);
router.post('/:driverID/onDriverCancelledRide', onDriverCancelledRide);
//Ratings
router.post('/:riderID/rateDriver', rateDriver);
//Trip Histories
router.get('/:riderID/getRiderTripHistory', getRiderTripHistory);
router.get('/:driverID/getDriverTripHistory', getDriverTripHistory);
module.exports = router;