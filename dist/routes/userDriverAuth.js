"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const userDriverAuth_1 = require("../controllers/userDriverAuth");
const { upload } = require('../databases/upload_config');
const userDriverAuthValidator_1 = require("./../validator/userDriverAuthValidator");
const auth_1 = require("../controllers/auth");
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
    { name: 'vehicleInsurance' },
]), userDriverAuthValidator_1.userDriverSignupValidator, userDriverAuth_1.validateSignUp, userDriverAuth_1.signup);
router.post('/driversignin', userDriverAuth_1.ValidateSignin, userDriverAuth_1.signin);
router.post('/driverchangepassword', auth_1.checkAuthorization, userDriverAuth_1.changePassword);
router.post('/driverForgotPassword', userDriverAuth_1.forgotPassword);
router.post('/driverVerifyForgotPasswordChange', userDriverAuth_1.forgotPasswordChange);
router.get('/genemailtokendriver', userDriverAuth_1.genEmailToken);
router.get('/verifyemaildriver', userDriverAuth_1.verifyEmailToken);
router.post('/logout', auth_1.checkAuthorization, userDriverAuth_1.logout);
module.exports = router;
