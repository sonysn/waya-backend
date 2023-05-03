const mongoose = require('mongoose');
const { Schema } = mongoose;

const paystackPaymentSchema = new Schema({
    role: {
        type: Schema.Types.ObjectId,
        auto: false
    },
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
        metadata: String,
        fees: Number,
        customer: {
            id: Number,
            first_name: String,
            last_name: String,
            email: String,
            customer_code: String,
            phone: String,
            metadata: Schema.Types.Mixed,
            risk_action: String,
            international_format_phone: String
        },
    }
});

const PaystackDeposits = mongoose.model('PaystackDeposits', paystackPaymentSchema);
module.exports = { PaystackDeposits };
