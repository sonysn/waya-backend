const express = require('express');
const { signup, validateSignUp, ValidateSignin, signin } = require('../controllers/userDriverAuth');
const { userDriverSignupValidator } = require('../validator/userDriverAuthValidator');

const router = express.Router();

router.post('/driversignup', userDriverSignupValidator, validateSignUp, signup);
router.post('/driversignin', ValidateSignin, signin);

module.exports = router;