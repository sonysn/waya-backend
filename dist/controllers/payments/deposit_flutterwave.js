"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCharge = exports.deposit = void 0;
const index_1 = require("../../index");
const deposit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = {
            card_number: '5531886652142950',
            cvv: '564',
            expiry_month: '09',
            expiry_year: '32',
            currency: 'NGN',
            amount: '7500',
            email: 'stephen.nyamali@gmail.com',
            fullname: 'Flutterwave Developers',
            tx_ref: 'transaction' + Date.now(),
            redirect_url: 'https://your-awesome.app/payment-redirect',
            enckey: process.env.FLW_ENCRYPTION_KEY,
            "authorization": {
                "mode": "pin",
                "pin": "3310"
            }
        };
        const response = yield index_1.flw.Charge.card(payload);
        console.log(response);
        res.json(response);
    }
    catch (error) {
        console.log(error);
    }
});
exports.deposit = deposit;
const validateCharge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield index_1.flw.Charge.validate({
        otp: req.body.otp,
        flw_ref: req.body.flw_ref
    });
    console.log(response);
    res.json(response);
});
exports.validateCharge = validateCharge;
