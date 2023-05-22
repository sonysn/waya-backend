const mongoose = require('mongoose');
const { userToDriver } = require('../../models/transfers');
const { PaystackDepositsDrivers } = require('../../models/paystack_deposit_drivers');
const { errormessage } = require('../../ansi-colors-config');

exports.getDriverTransactionsFromRiders = async (req, res) => {
  try {

    const driverID = req.params.driverID; // Set the driver ID here or retrieve it from req.body or req.params

    const data = await userToDriver.find({ driverID }).exec();
    //console.log(data);

    res.status(200).json(data);
  } catch (error) {
    console.error(errormessage(`${error}`));
    res.status(500).json({ message: 'An error occurred' });
  }
};

exports.getDriverDepositPaystackTransactions = async (req, res) => {
  try {
    const driverID = req.params.driverID; // Set the driver ID here or retrieve it from req.body or req.params


    const data = await PaystackDepositsDrivers.find({ driverID }).exec();

    //console.log(data);

    res.status(200).json(data);
  } catch (error) {
    console.error(errormessage(`${error}`));
    res.status(500).json({ message: 'An error occurred' });
  }
}