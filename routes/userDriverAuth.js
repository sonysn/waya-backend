const express = require('express');
const { signup, validateSignUp, ValidateSignin, signin, genEmailToken, verifyEmailToken, changePassword } = require('../controllers/userDriverAuth');
const { userDriverSignupValidator } = require('../validator/userDriverAuthValidator');
const { upload } = require('../databases/upload_config');

const router = express.Router();

router.post('/driversignup',upload.fields([
    { name: 'firstname' },
    { name: 'lastname' },
    { name: 'password' },
    { name: 'phoneNumber' },
    { name: 'email' },
    { name: 'address' },
    { name: 'dob' },
    { name: 'profilePhoto' },
    { name: 'driversLicense' },
    { name: 'vehicleInsurance' },]),userDriverSignupValidator, validateSignUp, signup);
router.post('/driversignin', ValidateSignin, signin);
router.post('/driverchangepassword', changePassword);
router.get('/genemailtokendriver', genEmailToken);
router.get('/verifyemaildriver', verifyEmailToken);

module.exports = router;