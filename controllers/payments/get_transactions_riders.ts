import { errormessage } from '../../ansi-colors-config';
import { PaystackDepositsRiders } from '../../models/paystack_deposit_riders';
import { userToDriver, UsersToUsers } from '../../models/transfers';
import { Request, Response, NextFunction } from "express";


exports.getRiderPaystackDepositTransactions = async (req: Request, res: Response) => {
    try {
        const userID = req.params.userID;

        const data = await PaystackDepositsRiders.find({ userID }).exec();

        //console.log(data);

        res.status(200).json(data);
    } catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
}

exports.getUserToDriverTransactions = async (req: Request, res: Response) => {
    try {
        const userID = req.params.userID;

        const data = await userToDriver.find({ userID }).exec();

        //console.log(data);

        res.status(200).json(data);
    } catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
}

exports.getUserToUserTransactions = async (req: Request, res: Response) => {
    try {
        const userSendingID = req.params.userID;

        const data = await UsersToUsers.find({ userSendingID }).exec();

        console.log(data);

        res.status(200).json(data);
    } catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
}

exports.getUserToUserTransactionsForReceiver = async (req: Request, res: Response) => {
    try {
        const userReceivingID = req.params.userID;

        const data = await UsersToUsers.find({ userReceivingID }).exec();

        console.log(data);

        res.status(200).json(data);
    } catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
}