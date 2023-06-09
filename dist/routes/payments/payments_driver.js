"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const deposit_flutterwave_1 = require("../../controllers/payments/deposit_flutterwave");
const { depositPaystack, callbackPaystack, getBalance } = require('../../controllers/payments/deposit_paystack_driver');
const { tranferDriverstoOtherDrivers } = require('../../controllers/payments/transfers');
const router = express_1.default.Router();
router.get('/deposit', deposit_flutterwave_1.deposit);
router.post('/validatecharge', deposit_flutterwave_1.validateCharge);
//paystack routes
router.post('/chargeDriver', depositPaystack);
router.get('/callbackdriver', callbackPaystack);
//getbalance
router.post('/getbalancedriver', getBalance);
//transfers
router.post('/tranfertodriver', tranferDriverstoOtherDrivers);
module.exports = router;
