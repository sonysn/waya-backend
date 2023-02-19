const express = require('express');
const { signup, validateSignUp, ValidateSignin, signin, changePassword } = require('../controllers/userAuth');
const { userSignupValidator } = require('../validator/userAuthValidator');

const router = express.Router();

router.post('/signup', userSignupValidator, validateSignUp, signup);
router.post('/signin', ValidateSignin, signin);
router.post('/changepassword', changePassword);
//TODO: Test changePassword

module.exports = router;