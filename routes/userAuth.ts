import express from 'express';
import { signup, validateSignUp, ValidateSignin, signin, changePassword, genEmailToken, verifyEmailToken, logout, forgotPassword,
forgotPasswordChange } from '../controllers/userAuth';
import { userSignupValidator } from './../validator/userAuthValidator';
import { checkAuthorization } from '../controllers/auth';

const router = express.Router();

router.post('/signup', userSignupValidator,validateSignUp, signup);
router.post('/signin', ValidateSignin, signin);
router.post('/userchangepassword', checkAuthorization, changePassword);
router.get('/genemailtoken', genEmailToken);
router.get('/verifyemail', verifyEmailToken);
router.post('/logoutuser', checkAuthorization, logout);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyForgotPasswordChange', forgotPasswordChange);

module.exports = router;