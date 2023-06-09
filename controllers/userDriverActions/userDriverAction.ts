import jsonwebtoken from 'jsonwebtoken';
import redisClient from '../../databases/redis_config';
import { errormessage } from '../../ansi-colors-config';
import { Request, Response, NextFunction } from "express";
import { MySQLConnection } from "../..";
import { env } from 'process';

exports.addCar = async (req: Request, res: Response) => {
    // //get user_id for driver in headers
    // const driver_ID = req.params.driver;
    const { model, make, year, capacity, carType, colour, plateNumber, driver_ID } = req.body;

    const SQLCOMMAND = `INSERT INTO driver_cars(MODEL, MAKE, YEAR, CAPACITY, CAR_TYPE, COLOUR, PLATE_NUMBER, DRIVER_ID)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
    var data = [model, make, year, capacity, carType, colour, plateNumber, driver_ID];

    await MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
        return res.json({ message: "Vehicle added successfully!" });
    });
}

exports.getDriverCars = async (req: Request, res: Response) => {

    const driverID = req.params.driver;

    // SQLCOMMAND = `SELECT driver.FIRST_NAME, driver.LAST_NAME, driver.PHONE_NUMBER, driver.EMAIL, driver_cars.MODEL, driver_cars.MAKE, 
    // driver_cars.PLATE_NUMBER, driver_cars.COLOUR
    // FROM driver
    // JOIN driver_cars ON driver_cars.DRIVER_ID = driver.ID WHERE driver.ID = ?;`
    const SQLCOMMAND = `SELECT VEHICLE_MAKE, VEHICLE_MODEL, VEHICLE_PLATE_NUMBER, VEHICLE_COLOUR, VEHICLE_BODY_TYPE FROM driver WHERE ID = ?`

    await MySQLConnection.query(SQLCOMMAND, driverID, async (err, result) => {
        //await delay(1500);
        return res.json({ result })
    });
}


/**
 * Middleware to verify tokens from headers
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns void
 */
export const ensureToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const bearerHeader: string | undefined = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer: string[] = bearerHeader.split(" ");
        const bearerToken: string = bearer[1];
        req.body.token = bearerToken;
        jsonwebtoken.verify(req.body.token, env.JWT_SECRET as string, function (err: jsonwebtoken.VerifyErrors | null) {
            if (err) {
                res.sendStatus(403);
            } else {
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
}



exports.locationUpdatePing = async (req: Request, res: Response) => {
    //FORMAT FROM APP IS LAT, LONG
    const { locationPoint, timeStamp } = req.body;
    const driver_ID = req.params.driverID;
    //console.log("Location:", locationPoint)

    //THIS IS LONG LAT BELOW
    //console.log(locationPoint[1], locationPoint[0])

    const locationInLongLat = [locationPoint[1], locationPoint[0]]
    const SQLCOMMAND = `UPDATE driver SET CURRENT_LOCATION = POINT(${locationInLongLat}) WHERE ID = ?; 
    UPDATE driver SET LOCATION_LAST_PING = ? WHERE ID = ?; `;
    await MySQLConnection.query(SQLCOMMAND, [driver_ID, timeStamp, driver_ID], (err, result) => {
        return res.sendStatus(200);
    })
}

exports.availability = async (req: Request, res: Response) => {
    const { availabilityStatus, driverID } = req.body;
    const SQLCOMMAND = `UPDATE driver SET AVAILABILITY = ${availabilityStatus} WHERE ID LIKE ?;`
    await MySQLConnection.query(SQLCOMMAND, [driverID], (err, result) => {
        return res.sendStatus(200);
    });
}

//WEBSOCKET REQUEST BELOW HERE

//websocket location update
export const locationUpdateWT = (locationPoint: number[], driver_ID: number, verificationStatus: boolean, driverDestPoint: number[]) => {
    //BUG NOTE
    //FORMAT FROM THE APP IS (LAT, LONG)
    //UPDATED: SQL format is (LONG, LAT)
    //REDIS FORMAT IS (LONG, LAT)
    const members = {
        driverID: driver_ID,
        verified: verificationStatus
    }
    const membersData = {
        driverID: driver_ID,
        verified: verificationStatus,
        destinationPoint: driverDestPoint
    }

    redisClient.multi()
        .geoAdd('driverLocations', { longitude: locationPoint[1], latitude: locationPoint[0], member: JSON.stringify(members) })
        .set(`Driver${members.driverID}`, JSON.stringify(membersData))
        .expire(`Driver${members.driverID}`, 10)
        .exec();
    // console.log(dest)
    //DONE I'VE REMOVED THIS
    // SQLCOMMAND = `UPDATE driver SET CURRENT_LOCATION = POINT(${locationPoint}) WHERE ID LIKE ?;`
    // MySQLConnection.query(SQLCOMMAND, [driver_ID], (err, result) => {
    //     //console.log('driver location update success!');
    // })
}