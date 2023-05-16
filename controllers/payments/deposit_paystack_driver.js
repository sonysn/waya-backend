const bodyParser = require('body-parser');
const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
const { PaystackDepositsDrivers } = require('../../models/paystack_deposit_drivers');
const { MySQLConnection } = require('../../index');
const { info, errormessage } = require('../../ansi-colors-config');

exports.depositPaystack = async (req, res) => {
  const { driverID, phone, email, amount, reference } = req.body;
  //TODO: ADD PHONE NUM
  const params = {
    email,
    amount,
    reference,
    metadata: { "phone": phone, "driverID": driverID },
    //TODO: THIS IS NGROK
    callback_url: `${process.env.URL_SELF_HOST}/callbackdriver`
  };
  paystack.transaction.initialize(params).then((response) => {
    const { authorization_url } = response.data;
    res.json({ authorization_url });
  }).catch((error) => {
    console.log(errormessage(error));
    res.status(500).json({ error: 'An error occurred while processing your payment.' });
  });
};

exports.callbackPaystack = async (req, res) => {
  const { reference } = req.query;
  console.log('hi')
  paystack.transaction.verify(reference).then((response) => {
    const { status } = response.data;
    //console.log(response)

    //to save in mongo
    const parsedPayment = {
      driverID: response.data.metadata.driverID,
      status: response.status,
      message: response.message,
      data: {
        id: response.data.id,
        domain: response.data.domain,
        status: response.data.status,
        reference: response.data.reference,
        amount: response.data.amount,
        message: response.data.message,
        gateway_response: response.data.gateway_response,
        paid_at: response.data.paid_at,
        created_at: response.data.created_at,
        channel: response.data.channel,
        currency: response.data.currency,
        ip_address: response.data.ip_address,
        fees: response.data.fees,
        customer: {
          id: response.data.customer.id,
          email: response.data.customer.email,
          customer_code: response.data.customer.customer_code,
          phone: response.data.metadata.phone,
          risk_action: response.data.customer.risk_action
        }
      }
    };

    const payment = new PaystackDepositsDrivers(parsedPayment);
    payment.save()
      .then(() => console.log(info('Data saved to database')))
      .catch(error => console.error(error));


    if (status === 'success') {
      // This code queries the 'driver' table in the MySQL database for the ACCOUNT_BALANCE column, based on the email provided in the 'response' object. If an error occurs during the query, it is logged to the console.
      // The retrieved ACCOUNT_BALANCE value is used to calculate a new balance by adding the amount in the 'response' object, which is divided by 100 to convert from kobo to naira.
      // A new query is then executed to update the ACCOUNT_BALANCE value in the 'driver' table, based on the email provided in the 'response' object. If an error occurs during the update, it is logged to the console.
      // The new balance is logged to the console.

      const SQLCOMMAND = `SELECT ACCOUNT_BALANCE FROM driver WHERE EMAIL LIKE ?;`

      MySQLConnection.query(SQLCOMMAND, response.data.customer.email, function (err, result) {
        if (err) {
          console.error(err);
          return;
        }
        const SQLCOMMAND1 = `UPDATE driver SET ACCOUNT_BALANCE = ? WHERE EMAIL LIKE ?;`
        const balance = result[0].ACCOUNT_BALANCE;
        const deposit = (response.data.amount) / 100;
        const new_balance = balance + deposit;
        MySQLConnection.query(SQLCOMMAND1, [new_balance, response.data.customer.email], function (err, result) {
          if (err) {
            console.error(err);
            return;
          }
        })
        console.log(new_balance);
      });


      res.json({ message: 'Your payment was successful!' });
    } else {
      res.status(500).json({ error: 'Your payment failed.' });
    }
  }).catch((error) => {
    console.log(errormessage(error));
    res.status(500).json({ error: 'An error occurred while processing your payment.' });
  });
};

// Define the getBalance function
exports.getBalance = function (req, res) {
  const id = req.body.id;
  const phoneNumber = req.body.phoneNumber;

  // Construct the SQL query
  const query = 'SELECT ACCOUNT_BALANCE FROM driver WHERE ID = ? AND PHONE_NUMBER = ?';
  const values = [id, phoneNumber];

  // Execute the query using the connection pool
  MySQLConnection.query(query, values, function (err, result) {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Internal server error');
      return;
    }

    if (result.length === 0) {
      res.status(404).send('Account not found');
      return;
    }

    // Return the account balance as a JSON object
    res.json({ balance: result[0].ACCOUNT_BALANCE });
  });
};







