import { userToDriver } from '../../models/transfers';
import { PaystackDepositsDrivers } from '../../models/paystack_deposit_drivers';
import { errormessage } from '../../ansi-colors-config';
import { Request, Response, NextFunction } from "express";


export const getDriverTransactionsFromRiders = async (req: Request, res: Response) => {
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


export const getDriverDepositPaystackTransactions = async (req: Request, res: Response) => {
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