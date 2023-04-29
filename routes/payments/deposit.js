const express = require('express');
const { deposit, validateCharge } = require('../../controllers/payments/deposit_flutterwave');

const router = express.Router();

router.get('/deposit', deposit);
router.post('/validatecharge', validateCharge)

module.exports = router;