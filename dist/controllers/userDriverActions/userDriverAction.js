"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationUpdateWT = exports.ensureToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_config_1 = __importDefault(require("../../databases/redis_config"));
const __1 = require("../..");
const process_1 = require("process");
exports.addCar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // //get user_id for driver in headers
    // const driver_ID = req.params.driver;
    const { model, make, year, capacity, carType, colour, plateNumber, driver_ID } = req.body;
    const SQLCOMMAND = `INSERT INTO driver_cars(MODEL, MAKE, YEAR, CAPACITY, CAR_TYPE, COLOUR, PLATE_NUMBER, DRIVER_ID)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
    var data = [model, make, year, capacity, carType, colour, plateNumber, driver_ID];
    yield __1.MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
        return res.json({ message: "Vehicle added successfully!" });
    });
});
exports.getDriverCars = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverID = req.params.driver;
    // SQLCOMMAND = `SELECT driver.FIRST_NAME, driver.LAST_NAME, driver.PHONE_NUMBER, driver.EMAIL, driver_cars.MODEL, driver_cars.MAKE, 
    // driver_cars.PLATE_NUMBER, driver_cars.COLOUR
    // FROM driver
    // JOIN driver_cars ON driver_cars.DRIVER_ID = driver.ID WHERE driver.ID = ?;`
    const SQLCOMMAND = `SELECT VEHICLE_MAKE, VEHICLE_MODEL, VEHICLE_PLATE_NUMBER, VEHICLE_COLOUR, VEHICLE_BODY_TYPE FROM driver WHERE ID = ?`;
    yield __1.MySQLConnection.query(SQLCOMMAND, driverID, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
        //await delay(1500);
        return res.json({ result });
    }));
});
/**
 * Middleware to verify tokens from headers
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns void
 */
const ensureToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.body.token = bearerToken;
        jsonwebtoken_1.default.verify(req.body.token, process_1.env.JWT_SECRET, function (err) {
            if (err) {
                res.sendStatus(403);
            }
            else {
                next();
            }
        });
    }
    else {
        res.sendStatus(403);
    }
});
exports.ensureToken = ensureToken;
exports.locationUpdatePing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //FORMAT FROM APP IS LAT, LONG
    const { locationPoint, timeStamp } = req.body;
    const driver_ID = req.params.driverID;
    //console.log("Location:", locationPoint)
    //THIS IS LONG LAT BELOW
    //console.log(locationPoint[1], locationPoint[0])
    const locationInLongLat = [locationPoint[1], locationPoint[0]];
    const SQLCOMMAND = `UPDATE driver SET CURRENT_LOCATION = POINT(${locationInLongLat}) WHERE ID = ?; 
    UPDATE driver SET LOCATION_LAST_PING = ? WHERE ID = ?; `;
    yield __1.MySQLConnection.query(SQLCOMMAND, [driver_ID, timeStamp, driver_ID], (err, result) => {
        return res.sendStatus(200);
    });
});
exports.availability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { availabilityStatus, driverID } = req.body;
    const SQLCOMMAND = `UPDATE driver SET AVAILABILITY = ${availabilityStatus} WHERE ID LIKE ?;`;
    yield __1.MySQLConnection.query(SQLCOMMAND, [driverID], (err, result) => {
        return res.sendStatus(200);
    });
});
//WEBSOCKET REQUEST BELOW HERE
//websocket location update
const locationUpdateWT = (locationPoint, driver_ID, verificationStatus, driverDestPoint) => {
    //BUG NOTE
    //FORMAT FROM THE APP IS (LAT, LONG)
    //UPDATED: SQL format is (LONG, LAT)
    //REDIS FORMAT IS (LONG, LAT)
    const members = {
        driverID: driver_ID,
        verified: verificationStatus
    };
    const membersData = {
        driverID: driver_ID,
        verified: verificationStatus,
        destinationPoint: driverDestPoint
    };
    redis_config_1.default.multi()
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
};
exports.locationUpdateWT = locationUpdateWT;
