const express = require('express');
import { signup, validateSignUp, ValidateSignin, signin, genEmailToken, verifyEmailToken, changePassword, logout, forgotPassword, forgotPasswordChange } from '../controllers/userDriverAuth';
const { upload } = require('../databases/upload_config');
import { userDriverSignupValidator } from './../validator/userDriverAuthValidator';
import { checkAuthorization } from '../controllers/auth';

const router = express.Router();

router.post('/driversignup', upload.fields([
    { name: 'firstname' },
    { name: 'lastname' },
    { name: 'password' },
    { name: 'phoneNumber' },
    { name: 'email' },
    { name: 'address' },
    { name: 'dob' },
    { name: 'profilePhoto' },
    { name: 'driversLicense' },
    { name: 'vehicleInsurance' },]), userDriverSignupValidator, validateSignUp, signup);
router.post('/driversignin', ValidateSignin, signin);
router.post('/driverchangepassword', checkAuthorization, changePassword);
router.post('/driverForgotPassword', forgotPassword);
router.post('/driverVerifyForgotPasswordChange', forgotPasswordChange);
router.get('/genemailtokendriver', genEmailToken);
router.get('/verifyemaildriver', verifyEmailToken);
router.post('/logout', checkAuthorization, logout);

module.exports = router;