const { flw } = require('../../index');

exports.deposit = async (req, res) => {
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
            tx_ref: 'transaction'+Date.now(),
            redirect_url: 'https://your-awesome.app/payment-redirect',
            enckey: process.env.FLW_ENCRYPTION_KEY,
            "authorization": {
                "mode": "pin",
                "pin": "3310"
            }
        }

        const response = await flw.Charge.card(payload);
        console.log(response);
        res.json(response);
    } catch (error) {
        console.log(error)
    }

}

exports.validateCharge = async (req, res) => {
    const response = await flw.Charge.validate({
        otp: req.body.otp,
        flw_ref: req.body.flw_ref
    });
    console.log(response);
    res.json(response);
}