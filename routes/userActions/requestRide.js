const express = require('express');
const { requestRide, getTripsHistory, searchForDrivers } = require('../../controllers/userActions/requestRide');
const { ensureToken } = require('../../controllers/userAuth');

const router = express.Router();

router.post('/requestride', ensureToken, requestRide, searchForDrivers);
router.get('/:userId/getridehistory', ensureToken, getTripsHistory);

module.exports = router;