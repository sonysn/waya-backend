const express = require('express');
const { signup, validateSignUp, ValidateSignin, signin, genEmailToken, verifyEmailToken } = require('../controllers/userDriverAuth');
const { userDriverSignupValidator } = require('../validator/userDriverAuthValidator');

const router = express.Router();

router.post('/driversignup', userDriverSignupValidator, validateSignUp, signup);
router.post('/driversignin', ValidateSignin, signin);
router.get('/genemailtokendriver', genEmailToken);
router.get('/verifyemaildriver', verifyEmailToken);

module.exports = router;