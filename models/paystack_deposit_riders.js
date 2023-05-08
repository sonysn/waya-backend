const mongoose = require('mongoose');
const { Schema } = mongoose;

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

const PaystackDepositsRiders = mongoose.model('PaystackDepositsRiders', paystackPaymentSchema);
module.exports = { PaystackDepositsRiders };
