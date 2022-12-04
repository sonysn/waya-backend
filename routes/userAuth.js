const express = require('express');
const { signup, validateSignUp, ValidateSignin, signin } = require('../controllers/userAuth');
const { userSignupValidator } = require('../validator/userAuthValidator');

const router = express.Router();

router.post('/signup', userSignupValidator, validateSignUp, signup);
router.post('/signin', ValidateSignin, signin);

module.exports = router;