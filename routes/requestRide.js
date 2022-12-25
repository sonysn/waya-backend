const express = require('express');
const { requestRide, getTripsHistory, ensureToken } = require('../controllers/requestRide');

const router = express.Router();

router.post('/requestride', ensureToken, requestRide);
router.get('/:userId/getridehistory', ensureToken, getTripsHistory);

module.exports = router;