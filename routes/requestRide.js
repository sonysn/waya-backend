const express = require('express');
const { requestRide, getTripsHistory } = require('../controllers/requestRide');

const router = express.Router();

router.post('/requestride', requestRide);
router.get('/:userId/getridehistory', getTripsHistory);

module.exports = router;