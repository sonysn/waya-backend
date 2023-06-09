import mongoose from 'mongoose';
const { Schema } = mongoose;

const paystackPaymentSchema = new Schema({
    driverID: Number,
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

export const PaystackDepositsDrivers = mongoose.model('PaystackDepositsDrivers', paystackPaymentSchema);
module.exports = { PaystackDepositsDrivers };
