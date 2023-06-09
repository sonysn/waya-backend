"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const { signup, validateSignUp, ValidateSignin, signin, genEmailToken, verifyEmailToken, changePassword, logout } = require('../controllers/userDriverAuth');
const { upload } = require('../databases/upload_config');
const userDriverAuthValidator_1 = require("./../validator/userDriverAuthValidator");
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
]), userDriverAuthValidator_1.userDriverSignupValidator, validateSignUp, signup);
router.post('/driversignin', ValidateSignin, signin);
router.post('/driverchangepassword', changePassword);
router.get('/genemailtokendriver', genEmailToken);
router.get('/verifyemaildriver', verifyEmailToken);
router.post('/logout', logout);
module.exports = router;
