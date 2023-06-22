"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const deposit_flutterwave_1 = require("../../controllers/payments/deposit_flutterwave");
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack_driver');
const { tranferDriverstoOtherDrivers } = require('../../controllers/payments/transfers');
const auth_1 = require("../../controllers/auth");
const router = express_1.default.Router();
//THESE TWO NOT BEING USED
router.get('/deposit', auth_1.checkAuthorization, deposit_flutterwave_1.deposit);
router.post('/validatecharge', deposit_flutterwave_1.validateCharge);
//paystack routes
router.post('/chargeDriver', auth_1.checkAuthorization, depositPaystack);
router.get('/callbackdriver', callbackPaystack);
//getbalance
router.post('/getbalancedriver', auth_1.checkAuthorization, getBalance);
//transfers
router.post('/tranfertodriver', auth_1.checkAuthorization, tranferDriverstoOtherDrivers);
module.exports = router;
