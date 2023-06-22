"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_1 = require("../controllers/userAuth");
const userAuthValidator_1 = require("./../validator/userAuthValidator");
const auth_1 = require("../controllers/auth");
const router = express_1.default.Router();
router.post('/signup', userAuthValidator_1.userSignupValidator, userAuth_1.validateSignUp, userAuth_1.signup);
router.post('/signin', userAuth_1.ValidateSignin, userAuth_1.signin);
router.post('/userchangepassword', auth_1.checkAuthorization, userAuth_1.changePassword);
router.get('/genemailtoken', userAuth_1.genEmailToken);
router.get('/verifyemail', userAuth_1.verifyEmailToken);
router.post('/logoutuser', auth_1.checkAuthorization, userAuth_1.logout);
router.post('/forgotPassword', userAuth_1.forgotPassword);
router.post('/verifyForgotPasswordChange', userAuth_1.forgotPasswordChange);
module.exports = router;
