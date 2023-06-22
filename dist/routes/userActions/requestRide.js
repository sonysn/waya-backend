"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { requestRide, getTripsHistory, searchForDrivers, driverAcceptRide, getPrice, driverCount, getCurrentRide, driverGetCurrentRides, driverOnRideComplete, onRiderCancelledRide, rateDriver, onDriverCancelledRide, getRiderTripHistory, getDriverTripHistory } = require('../../controllers/userActions/requestRide');
const { ensureToken } = require('../../controllers/userAuth');
const auth_1 = require("../../controllers/auth");
const router = express_1.default.Router();
router.post('/requestride', auth_1.checkAuthorization, requestRide, searchForDrivers);
router.post('/getRidePrice', getPrice);
router.get('/:userId/getridehistory', auth_1.checkAuthorization, getTripsHistory);
router.post('/driverAcceptRide', auth_1.checkAuthorization, driverAcceptRide);
//Ride information
router.get('/:locationData/driverCount', driverCount);
router.get('/:riderID/getCurrentRide', auth_1.checkAuthorization, getCurrentRide);
router.get('/:driverID/driverGetCurrentRides', auth_1.checkAuthorization, driverGetCurrentRides);
router.post('/driverOnRideComplete', auth_1.checkAuthorization, driverOnRideComplete);
//Ride Cancellation or Ending
router.post('/:riderID/onRiderCancelledRide', auth_1.checkAuthorization, onRiderCancelledRide);
router.post('/:driverID/onDriverCancelledRide', auth_1.checkAuthorization, onDriverCancelledRide);
//Ratings
router.post('/:riderID/rateDriver', auth_1.checkAuthorization, rateDriver);
//Trip Histories
router.get('/:riderID/getRiderTripHistory', auth_1.checkAuthorization, getRiderTripHistory);
router.get('/:driverID/getDriverTripHistory', auth_1.checkAuthorization, getDriverTripHistory);
module.exports = router;
