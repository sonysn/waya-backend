const express = require('express');
const { requestRide, getTripsHistory, ensureToken, searchForDrivers } = require('../../controllers/userActions/requestRide');

const router = express.Router();

router.post('/requestride', ensureToken, requestRide, searchForDrivers);
router.get('/:userId/getridehistory', ensureToken, getTripsHistory);

module.exports = router;