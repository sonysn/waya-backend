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
    const { locationPoint, timeStamp } = req.body;
    const driver_ID = req.params.driverID;

    // Type definition for the coordinates.
    type Coordinates = {
        latitude: number;
        longitude: number;
    };

    const driverCurrentCoordinates: Coordinates = {
        latitude: req.body.locationPoint[0],
        longitude: req.body.locationPoint[1],
    }

    //MYSQL DB TAKES IN LONG LAT FORMAT
    const driverCurrentCoordinatesArray: [number, number] = [
        driverCurrentCoordinates.longitude,
        driverCurrentCoordinates.latitude
    ]

    const SQLCOMMAND = `UPDATE driver SET CURRENT_LOCATION = POINT(${driverCurrentCoordinatesArray}), LOCATION_LAST_PING = ? WHERE ID = ?;`;
    MySQLConnection.query(SQLCOMMAND, [timeStamp, driver_ID], (err, result) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }
        return res.sendStatus(200);
    });
};

exports.availability = async (req: Request, res: Response) => {
    const { availabilityStatus, driverID } = req.body;
    const SQLCOMMAND = `UPDATE driver SET AVAILABILITY = ${availabilityStatus} WHERE ID LIKE ?;`
    await MySQLConnection.query(SQLCOMMAND, [driverID], (err, result) => {
        return res.sendStatus(200);
    });
}

//WEBSOCKET REQUEST BELOW HERE

/**
 * TYPE NOTE
 * FORMAT FROM THE APP IS (LAT, LONG)
 * UPDATED: SQL format is (LONG, LAT)
 * REDIS FORMAT IS (LONG, LAT)
 * Update the location of a driver in a Redis database for real-time tracking.
 * @param locationPoint - Array of latitude and longitude of the driver's current location.
 * @param driver_ID - ID of the driver.
 * @param verificationStatus - Indicates if the driver's identity has been verified.
 * @param driverDestPoint - Array of latitude and longitude of the driver's destination.
 * @param driverDestPoint - Returns [null, null] if array is empty [] or null
 */
export const locationUpdateWT = (locationPoint: [number, number], driver_ID: number, verificationStatus: boolean, driverDestPoint: [number, number]) => {
    // Type definition for the coordinates.
    type Coordinates = {
        latitude: number;
        longitude: number;
    };

    // Create a coordinate object from the location point array.
    const driverCurrentLocation: Coordinates = {
        latitude: locationPoint[0],
        longitude: locationPoint[1],
    };

    // Create a coordinate object from the destination point array.
    const driverSetDestination: Coordinates = {
        latitude: driverDestPoint[0],
        longitude: driverDestPoint[1],
    };

    // Create an array of latitude and longitude from the destination coordinate object.
    const driverSetDestinationArray: [number, number] = [
        driverSetDestination.latitude,
        driverSetDestination.longitude,
    ];

    // Create an object to store the driver ID and verification status.
    const members = {
        driverID: driver_ID,
        verified: verificationStatus,
    };

    // Create an object to store the driver ID, verification status, and destination point.
    const membersData = {
        driverID: driver_ID,
        verified: verificationStatus,
        destinationCoordinates: driverSetDestinationArray,
    };

    // Add the driver's current location to the Redis database.
    redisClient.multi()
        .geoAdd('driverLocations', {
            longitude: driverCurrentLocation.longitude,
            latitude: driverCurrentLocation.latitude,
            member: JSON.stringify(members),
        })
        // Set the driver's data in the Redis database.
        .set(`Driver${members.driverID}`, JSON.stringify(membersData))
        // Set an expiration of 10 seconds for the driver's data in the Redis database.
        .expire(`Driver${members.driverID}`, 10)
        .exec();
};