const express = require('express');
const { signup, validateSignUp, ValidateSignin, signin } = require('../controllers/auth');

const router = express.Router();

router.post('/signup', validateSignUp, signup);
router.post('/signin', ValidateSignin, signin);

module.exports = router;