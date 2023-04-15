const express = require('express');
const { deposit, validateCharge } = require('../../controllers/userActions/deposit');

const router = express.Router();

router.get('/deposit', deposit);
router.post('/validatecharge', validateCharge)

module.exports = router;