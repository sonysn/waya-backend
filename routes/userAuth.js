const express = require('express');
const { signup, validateSignUp, ValidateSignin, signin, changePassword, genEmailToken, verifyEmailToken, logout } = require('../controllers/userAuth');
const { userSignupValidator } = require('../validator/userAuthValidator');

const router = express.Router();

router.post('/signup', userSignupValidator, validateSignUp, signup);
router.post('/signin', ValidateSignin, signin);
router.post('/userchangepassword', changePassword);
router.get('/genemailtoken', genEmailToken);
router.get('/verifyemail', verifyEmailToken);
router.post('/logoutuser', logout);

module.exports = router;