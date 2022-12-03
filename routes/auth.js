const express = require('express');
const { signup, validateSignUp } = require('../controllers/auth');

const router = express.Router();

router.post('/signup', validateSignUp, signup);

module.exports = router;