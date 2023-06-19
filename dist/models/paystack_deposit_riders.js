"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackDepositsRiders = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const paystackPaymentSchema = new Schema({
    userID: Number,
    status: Boolean,
    message: String,
    data: {
        id: Number,
        domain: String,
        status: String,
        reference: String,
        amount: Number,
        message: String,
        gateway_response: String,
        paid_at: Date,
        created_at: Date,
        channel: String,
        currency: String,
        ip_address: String,
        fees: Number,
        customer: {
            id: Number,
            email: String,
            customer_code: String,
            phone: String,
            risk_action: String,
        },
    }
});
exports.PaystackDepositsRiders = mongoose_1.default.model('PaystackDepositsRiders', paystackPaymentSchema);
module.exports = { PaystackDepositsRiders: exports.PaystackDepositsRiders };