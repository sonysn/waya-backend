const bodyParser = require('body-parser');
const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

exports.depositPaystack = async (req, res) => {
    const { email, amount, reference } = req.body;
  const params = {
    email,
    amount,
    reference,
    callback_url: `${process.env.HOST}/callback`
  };
  paystack.transaction.initialize(params).then((response) => {
    const { authorization_url } = response.data;
    res.json({ authorization_url });
  }).catch((error) => {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while processing your payment.' });
  });
};

exports.callbackPaystack = async (req, res) => {
    const { reference } = req.query;
  paystack.transaction.verify(reference).then((response) => {
    const { status } = response.data;
    if (status === 'success') {
      res.json({ message: 'Your payment was successful!' });
    } else {
      res.status(500).json({ error: 'Your payment failed.' });
    }
  }).catch((error) => {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while processing your payment.' });
  });
};

